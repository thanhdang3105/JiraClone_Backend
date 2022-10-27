/**
 * ProjetsController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {
  create: async (req,res) => {
    const projectInfo = req.body
    let newProject = await Projects.create(projectInfo).fetch()
    newProject = await Projects.findOne({id: newProject.id}).populate('userIds',{
      select: ['name','email','avatarUrl']
    })
    if(newProject){
      return res.json(newProject)
    }
    return res.status(400).send('Create Failed')
  },

  update: async (req,res) => {
    const data = req.body
    if(data){
      const {id,...dataUpdate} = data
      const projectUpdated = await Projects.updateOne({id}).set(dataUpdate)
      return res.json(projectUpdated)
    }
    return res.status(400).send('Invalid data update!')
  },

  getByUserId: async (req, res) => {
    const {userId} = req.query
    const userInfo = await Users.findOne({id:userId}).populate('projectIds')
    if(userInfo){
      return res.json(userInfo.projectIds)
    }else{
      return res.status(401).end()
    }
  }, 

  getByProjectId: async (req, res) => {
    const {id} = req.query
    const projectInfo = await Projects.findOne({id}).populate('userIds',{
      select: ['name','email','avatarUrl']
    })
    const listIssue = await Issues.find({projectId: id}).populate('assignees',{
      select: ['name','email','avatarUrl']
    }).populate('reporterId')
    return res.json({project: projectInfo,issues: listIssue})
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
    const {userIds,projectId} = req.body
    await Projects.addToCollection(projectId,'userIds',userIds)
    const newUsersInProject = await Users.find({id: {in: userIds}}).select(['name','email','avatarUrl'])
    return res.json(newUsersInProject)
  },

  removeUsers: async (req, res) => {
    const {userIds,projectId} = req.body
    try {
      await Projects.removeFromCollection(projectId,'userIds',userIds)

      const issues = await Issues.find({projectId})

      const issueIds = issues.map(issue => issue.id)

      await Issues.removeFromCollection(issueIds,'assignees',userIds)

      return res.json(userIds)
    } catch (error) {
      return res.status(500).end()
    }
  }

};

