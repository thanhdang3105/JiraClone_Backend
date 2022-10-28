/**
 * UsersController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
const { sendEmail } = require("../../EmailService");
const jwt = require("jsonwebtoken")

const verifyCodes = new global.Map()
const timmerIds = new global.Map()

module.exports = {
  getList: async function (req, res) {
    const {userIds} = req.body
    const listUsers = await Users.find({id: {nin: userIds}}).select(['name','email','avatarUrl'])
    return res.json(listUsers)
  },

  update: async (req, res) => {
    const data = req.body
    if(data){
        const {id,...info} = data
        try {
            await Users.updateOne({id}).set(info)
            return res.json({message: 'Update Success!'})
        } catch (error) {
            console.log(error)
            return res.status(400).send('Error updating')
        }
    }
    return res.status(500).send('Invalid data update!')
  },

  register: async function (req,res) {
    const {action,data} = req.body
    switch (action) {
        case 'verifyEmail':
            const user = await Users.findOne({email: data})
            if(!user){
                let verifyCode = Math.random().toString().substring(2, 8)
                sendEmail('verifyEmail',data,verifyCode)
                .then(() => {
                    verifyCodes.set(data,verifyCode)
                    setTimeout(() => {
                        verifyCodes.delete(data)
                    },10 * 60 * 1000)
                    return res.json('Mã xác thực đã được gửi đến mail của bạn.')
                })
                .catch(err => {
                    return res.status(401).end()
                })
            }else{
                return res.status(400).send('Tài khoản đã tồn tại!')
            }
            break;
        case 'verifyCode':
            const {email,code} = data
            if(verifyCodes.get(email) === code){
                return res.json('Xác thực thành công.')
            }else if(!verifyCodes.has(email)){
                return res.status(400).send('Mã đã hết hạn!')
            }else{
                return res.status(401).send('Mã xác thực không đúng!')
            }
        case 'createUser':
            const newUser = await sails.helpers.createuser(data)
            newUser.accessToken = jwt.sign({id:newUser.id},sails.config.custom.jwtAccessKey,{ expiresIn: '8h' })
            let refeshToken = jwt.sign({id:newUser.id},sails.config.custom.jwtRefeshKey,{ expiresIn: '5 days'})
            res.cookie('refeshToken',refeshToken,{ maxAge: 5 * 24 * 3600 * 1000, httpOnly: true })
            return res.json(newUser)
        default:
            throw new Error('Invalid action')
    }
  },

  login: async function (req, res) {
    const {email,password} = req.body
    const userInfo = await Users.findOne({email}).decrypt()
    if(userInfo){
        const isLogin = await sails.helpers.checklogin({password,hash:userInfo.password})
        if(isLogin) {
            delete userInfo.password
            const listProjects = await Projects.find({userIds: {contains: userInfo.id}})
            userInfo.projects = listProjects
            userInfo.accessToken = jwt.sign({id:userInfo.id},sails.config.custom.jwtAccessKey,{ expiresIn: '8h' })
            let refeshToken = jwt.sign({id:userInfo.id},sails.config.custom.jwtRefeshKey,{ expiresIn: '5 days'})
            res.cookie('refeshToken',refeshToken,{ maxAge: 5 * 24 * 3600 * 1000, httpOnly: true })
            return res.json(userInfo)
        }else{
            return res.status(400).send('Sai tài khoản hoặc mật khẩu!')
        }
    }else{
        return res.status(401).send('Tài khoản không tồn tại!')
    }
  },

  authorization: async function (req, res) {
    const {accessToken} = req.body
    const {refeshToken} = req.cookies
    jwt.verify(accessToken,sails.config.custom.jwtAccessKey,async (err,data) => {
        let decoded = data
        let newAccessToken
        if(err) {
            if(err.name === 'TokenExpiredError' && refeshToken){

                jwt.verify(refeshToken,sails.config.custom.jwtRefeshKey, (err,data) => {
                    if(err) {
                        res.clearCookie('refeshToken')
                        return res.status(403).end()
                    }
                    decoded = data
                    newAccessToken = jwt.sign({id:decoded.id},sails.config.custom.jwtAccessKey,{ expiresIn: '8h' })
                })
            }else{
                return res.status(403).end()
            }
        }
        const userInfo = await Users.findOne({id: decoded.id}).select(['name','email','avatarUrl'])
        if(userInfo){
            const listProjects = await Projects.find({userIds: {contains: userInfo.id}})
            userInfo.projects = listProjects
            if(newAccessToken) {
                userInfo.accessToken = newAccessToken
            }
            return res.json(userInfo)
        }else{
            return res.status(400).end()
        }
    })
  },

  resetPwd: async (req, res) => {
    const {action,data} = req.body
    if(!data) return res.status(400).end()
    switch (action) {
        case 'checkEmail':
            const user = await Users.findOne({email: data})
            if(user){
                let verifyCode = Math.random().toString().substring(2, 8)
                sendEmail('verifyEmail',data,verifyCode)
                .then(() => {
                    if(verifyCodes.has(data)){
                        verifyCodes.delete(data)
                        verifyCodes.set(data,verifyCode)
                    }else{
                        verifyCodes.set(data,verifyCode)
                    }
                    const timeoutId = setTimeout(() => {
                        verifyCodes.delete(data)
                    },10 * 60 * 1000)
                    timmerIds.set(verifyCode,timeoutId)
                    return res.json({message: 'Mã xác thực đã được gửi đến mail của bạn.'})
                })
                .catch(err => {
                    console.log(err)
                    return res.status(401).end()
                })
            }else{
                return res.status(400).send('Tài khoản không tồn tại!')
            }
            break;
        case 'verifyCode':
            const {email,code} = data
            if(verifyCodes.get(email) == code){
                clearTimeout(timmerIds.get(code))
                timmerIds.delete(code)
                return res.json({message: 'Xác thực thành công.'})
            }else if(!verifyCodes.has(email)){
                return res.status(400).send('Mã đã hết hạn!')
            }else{
                return res.status(401).send('Mã xác thực không đúng!')
            }
        case 'resetPWD':
            if(verifyCodes.get(data?.email) === data?.code){
                const passwordHash = sails.helpers.hashpassword(data.password)
                await Users.updateOne({email: data.email}).set({password: passwordHash})
                const userInfo = await Users.findOne({email: data.email})
                if(userInfo){
                    delete userInfo.password
                    const listProjects = await Projects.find({userIds: {contains: userInfo.id}})
                    userInfo.projects = listProjects
                    userInfo.accessToken = jwt.sign({id:userInfo.id},sails.config.custom.jwtAccessKey,{ expiresIn: '5 days' })
                    verifyCodes.delete(data.email)
                    return res.json(userInfo)
                }else{
                    res.status(400).send('Tài khoản không tồn tại!')
                }
            }else{
                return res.status(403).end()
            }
        default:
            throw new Error('Invalid action')
    }
  },

  logout: (req, res) => {
    res.clearCookie('refeshToken')
    res.ok()
  }

};

