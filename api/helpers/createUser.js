
module.exports = {
    sync: false,
    friendlyName: 'Create User',
    description: 'Return newUser.',
    inputs: {
        data: {
            type: 'ref',
            required: true
        }
    },
    fn: async function (inputs, exits) {
      const userInfo = inputs.data
      const passwordHash = sails.helpers.hashpassword(userInfo.password)
      userInfo.password = passwordHash
      const result = await Users.create(userInfo).fetch()
      delete result.password
      return exits.success(result);
    }
};