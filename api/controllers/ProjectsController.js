/**
 * ProjetsController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {
  getList: async (req, res) => {
    const listProjects = await Projects.find({})
    return res.json(listProjects)
  },

  createProject: async (req,res) => {
    const projectInfo = req.body
    const newProject = await Projects.create(projectInfo).fetch()
    if(newProject){
      return res.json(newProject)
    }
    return res.status(400).send('Create Failed')
  },

  updateProject: async (req,res) => {
    const data = req.body
    if(data){
      const {id,...dataUpdate} = data
      await Projects.updateOne({id}).set(dataUpdate)
      return res.json({message: 'Project updated successfully'})
    }
    return res.status(400).send('Invalid data update!')
  },

  getByProjectId: async (req, res) => {
    const {id} = req.query
    try {
      const projectInfo = await Projects.findOne({id})
      const usersInfo = await Users.find({id: {in: projectInfo.userIds}}).select(['name','email','avatarUrl'])
      projectInfo.userIds = usersInfo
      const listIssue = await Issues.find({projectId: id})
      
      listIssue.forEach(issue => {
        let assignees = []
        usersInfo.map(user => {
          if(issue.assignees?.includes(user.id)){
            assignees.push(user)
          }
          if(issue.reporterId === user.id){
            issue.reporterId = user
          }
        })
        issue.assignees = assignees
        return issue
      })
      return res.json({project: projectInfo,issues: listIssue})
    } catch (error) {
      console.log(error)
      return res.status(400).end()
    }
  },

  delete: async (req, res) => {
    const {projectId} = req.query
    await Issues.destroy({projectId})
    const isDelete = await Projects.destroyOne({id: projectId})
    if(isDelete){
      return res.json({message: 'Xoá thành công!'})
    }else{
      return res.json({message: 'Xoá thất bại!'})
    }
  },

  addUsers: async (req, res) => {
    try {
      const {userIds,project} = req.body
      const newUserIds = project.userIds.map(user => user.id).concat(userIds)
      await Projects.updateOne({id: project.id}).set({userIds: newUserIds})
      const newUsersInProject = await Users.find({id: {in: userIds}}).select(['name','email','avatarUrl'])
      return res.json(newUsersInProject)
    } catch (error) {
      console.log(error)
      return res.status(400).end()
    }
  },

  removeUsers: async (req, res) => {
    try {
      const {userIds,project} = req.body
      const newUserIds = project.userIds.filter(user => !userIds.includes(user.id)).map(user => user.id)
      await Projects.updateOne({id: project.id}).set({userIds: newUserIds})

      const listIssue = await Issues.find({projectId: project.id})
      const listUpdate = []
       listIssue.map(issue => {
        let assignees = []
        issue.assignees.map(userId => {
          if(!userIds.includes(userId)){
            assignees.push(userId)
          }
          return userId
        })
        if(assignees.length > 0){
          listUpdate.push(Issues.updateOne({id: issue.id}).set({assignees}))
        }
        return issue
      })
      await Promise.all(listUpdate)
      return res.json(userIds)
    } catch (error) {
      return res.status(500).end()
    }
  }

};

