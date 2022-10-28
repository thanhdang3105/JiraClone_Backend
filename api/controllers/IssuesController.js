/**
 * IssuesController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {
  create: async (req, res) => {
    const data = req.body
    const newIssues = await Issues.create(data).fetch()
    if(newIssues){
      const usersInfo = await Users.find({
        where: {or: [
          {id: {in: newIssues.assignees}},
          {id: newIssues.reporterId}
        ]},
        select: ['name','email','avatarUrl']
      })

      const assignees = []
      usersInfo.map(user => {
        if(newIssues.assignees.includes(user.id)){
          assignees.push(user)
        }
        if(newIssues.reporterId === user.id){
          newIssues.reporterId = user
        }
        return user
      })
      newIssues.assignees = assignees
      return res.json(newIssues)
    }
    return res.status(400).end()
  },
  
  update: async (req, res) => {
    const {idUpdate} = req.query
    const data = req.body
    if(data) {
      try {
        const issueUpdated = await Issues.updateOne({id: idUpdate}).set(data)
        const usersInfo = await Users.find({
          where: {or: [
            {id: {in: issueUpdated.assignees}},
            {id: issueUpdated.reporterId}
          ]},
          select: ['name','email','avatarUrl']
        })
  
        const assignees = []
        usersInfo.map(user => {
          if(issueUpdated.assignees.includes(user.id)){
            assignees.push(user)
          }
          if(issueUpdated.reporterId === user.id){
            issueUpdated.reporterId = user
          }
          return user
        })
        issueUpdated.assignees = assignees
        return res.json(issueUpdated)
      } catch (error) {
        return res.status(400).end()
      }
    }else{
      return res.status(400).send('Invalid data!')
    }
  },

  updateMany: async (req,res) => {
    const data = req.body
    if(data?.length){
      const promiseItem = data.map(item => (
        Issues.updateOne({id: item.id}).set(item)
      ))
      try {
        await Promise.all(promiseItem)
        return res.send('success')
      } catch (error) {
        console.error(error)
        return res.status(400).send(error)
      }
    }
    return res.status(400).send('Invalid data update!')
  },

  delete: async (req, res) => {
    const {idDelete} = req.query
    const isDelete = await Issues.destroyOne({id: idDelete})
    if(isDelete){
      return res.json({message: 'Xoá thành công!'})
    }else{
      return res.status(500).send('Xoá thất bại!')
    }
  },

  addComment: async (req, res) => {
    const data = req.body
    try {
      const newComment = await Comments.create(data).fetch()
      if(newComment){
        const userInfo = await Users.findOne({id: newComment.userId}).select(['name','avatarUrl'])
        Object.assign(newComment,userInfo)
        delete newComment.userId
        return res.json(newComment)
      }
      throw new Error('Create failed')
    } catch (error) {
      console.log(error)
      res.status(400).end(error.message)
    }
  },

  getComments: async (req, res) => {
    const {issueId} = req.query
    try {
      if(issueId){
        const listComments = await Comments.find({
          where: {issueId},
          sort: 'createdAt DESC'
        })
        for(let comment of listComments){
          userInfo = await Users.findOne({id:comment.userId}).select(['name','avatarUrl'])
          delete userInfo.id
          Object.assign(comment,userInfo)
        }
        return res.json(listComments)
      }
      return res.status(400).send('Invalid data!')
    } catch (error) {
      console.log(error)
      return res.status(400).send('Invalid data!')
    }
  },

  search: async (req, res) => {
    const {searchTerm,projectId} = req.query
    if(searchTerm && projectId){
      // const listIssues = await Issues.find({
      //   // or: [
      //   //   { title : { $regex: `/${searchTerm}/i` }},
      //   //   // { title : { contains: searchTerm.toUpperCase()}},
      //   //   // { title : { contains: searchTerm[0].toUpperCase() + searchTerm.substring(1)}},
      //   //   // { type : { contains: searchTerm}},
      //   //   // { type : { contains: searchTerm.toUpperCase()}},
      //   //   // { type : { contains: searchTerm[0].toUpperCase() + searchTerm.substring(1)}},
      //   //   // { description : { contains: searchTerm}},
      //   //   // { description : { contains: searchTerm.toUpperCase()}},
      //   //   // { description : { contains: searchTerm[0].toUpperCase() + searchTerm.substring(1)}},
      //   // ],
      //   title : { regex: `/${searchTerm}/i` },
      //   projectId
      // })
      const issues = []
      const regex = new RegExp(searchTerm, 'ig')
      const listIssues = await Issues.find({projectId})

      listIssues.map((issue => {
        const issueStringify = JSON.stringify(Object.values(issue))
        const check = issueStringify.match(regex)
          if(issueStringify && check){
          issues.push(issue)
        }
        return issue
      }))
      return res.json(issues)
    }
    return res.status(400).send('Invalid value search!')
  }

};

