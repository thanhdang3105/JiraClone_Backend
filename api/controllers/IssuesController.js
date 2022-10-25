/**
 * IssuesController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {
  create: async (req, res) => {
    const data = req.body
    let newIssues = await Issues.create(data).fetch()
    if(newIssues){
      newIssues = await sails.helpers.issuesfind('findOne',{id: newIssues.id})
      return res.json(newIssues)
    }
    return res.status(400).end()
  },
  
  update: async (req, res) => {
    const {idUpdate} = req.query
    const data = req.body
    await Issues.updateOne({id: idUpdate}).set(data)
    const issueUpdated = await sails.helpers.issuesfind('findOne',{id: idUpdate})
    return res.json(issueUpdated)
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
    const {id,...info} = req.body
    const issueUpdated = await sails.helpers.issuesfind('findOne',{id})
    if(issueUpdated.comments && issueUpdated.comments.length){
      issueUpdated.comments.unshift(info)
    }else{
      issueUpdated.comments = [info]
    }
    await Issues.updateOne({id},{comments:issueUpdated.comments})
    return res.json(issueUpdated)
  },

  search: async (req, res) => {
    const {searchTerm} = req.query
    if(searchTerm){
      const listIssues = await sails.helpers.issuesfind('find',{
        or: [
          { title : { contains: searchTerm}},
          { title : { contains: searchTerm.toUpperCase()}},
          { title : { contains: searchTerm[0].toUpperCase() + searchTerm.substring(1)}},
          { type : { contains: searchTerm}},
          { type : { contains: searchTerm.toUpperCase()}},
          { type : { contains: searchTerm[0].toUpperCase() + searchTerm.substring(1)}},
          { description : { contains: searchTerm}},
          { description : { contains: searchTerm.toUpperCase()}},
          { description : { contains: searchTerm[0].toUpperCase() + searchTerm.substring(1)}},
        ]
      })
      return res.json(listIssues)
    }
    return res.status(400).send('Invalid value search!')
  }

};

