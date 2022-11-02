/**
 * IssuesController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {
  getList: async (req, res) => {
    const listIssues = await Issues.find({})
    return res.json(listIssues)
  },

  createIssue: async (req, res) => {
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
  
  updateIssue: async (req, res) => {
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
      const regex = new RegExp('.*'+searchTerm+'.*','ig')
      const db = Issues.getDatastore().manager
      const listIssues = await db.collection('issues')
      .find({
        $or:[
          {title: regex},
          {description: regex},
          {status: regex}
        ],
        projectId
      }).map((records) => {
        if(records){
          records.id = records._id
          delete records._id
        }
        return records
      }).toArray()
      // .aggregate([
      //   {$match: {$or: [
      //       {title: regex},
      //       {description: regex},
      //       {status: regex}
      //   ]}},
      //   {$project: {
      //     _id: 0,
      //     id: '$_id',
      //     title: 1,
      //     type: 1,
      //   }}
      // ]).toArray()
      return res.json(listIssues)
    }
    return res.status(400).send('Invalid value search!')
  }

};

