const bcrypt = require('bcrypt')

module.exports = {
    sync: true,
    friendlyName: 'Hash Password',
    description: 'Return PasswordHash.',
    inputs: {
        password: {
            type: 'string',
            required: true
        }
    },
    fn: function (inputs, exits) {
      const {password} = inputs
      const passwordHash = bcrypt.hashSync(password,sails.config.custom.saltRounds)
      return exits.success(passwordHash);
    }
};