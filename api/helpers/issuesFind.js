module.exports = {
    sync: false,
    friendlyName: 'Issues find or findOne',
    description: 'Return Issues find or findOne',
    inputs: {
      method: {
        type: 'string',
        required: true
      },
      query: {
        type: 'ref',
        required: true
      }
    },
    fn: async function ({method, query}, exits) {
      const data = await Issues[method](query).populate('assignees',{
        select: ['name','email','avatarUrl']
      }).populate('reporterId')
      return exits.success(data);
    }
  };