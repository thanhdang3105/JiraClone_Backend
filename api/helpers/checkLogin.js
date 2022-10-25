const bcrypt = require('bcrypt')

module.exports = {
    sync: true,
    friendlyName: 'Check Password',
    description: 'Return boolean.',
    inputs: {
        data: {
            type: 'ref',
            required: true
        }
    },
    fn: function (inputs, exits) {
      const {password,hash} = inputs.data
      const isComparePWD = bcrypt.compareSync(password,hash)
      return exits.success(isComparePWD);
    }
};