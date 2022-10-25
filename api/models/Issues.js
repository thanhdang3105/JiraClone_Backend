/**
 * Issues.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {

    title: {
      type: 'string',
      required: true
    },
    type:{
      type: 'string',
      required: true
    },
    description: {
      type: 'string',
      required: true
    },
    status: {
      type: 'string',
      defaultsTo: 'backlog'
    },
    assignees: {
        collection: 'users',
        via: 'issueIds'
    },
    reporterId: {
      model: 'users'
    },
    priority: {
      type: 'string',
      required: true
    },
    projectId: {
      model: 'projects'
    },
    comments: {
      type: 'ref'
    },
    estimate: {
      type: 'number',
      defaultsTo: 0
    },
    index: {
      type: 'number',
      required: true
    },
    deadline: {
      type: 'number'
    }

    //  ╔═╗╦═╗╦╔╦╗╦╔╦╗╦╦  ╦╔═╗╔═╗
    //  ╠═╝╠╦╝║║║║║ ║ ║╚╗╔╝║╣ ╚═╗
    //  ╩  ╩╚═╩╩ ╩╩ ╩ ╩ ╚╝ ╚═╝╚═╝


    //  ╔═╗╔╦╗╔╗ ╔═╗╔╦╗╔═╗
    //  ║╣ ║║║╠╩╗║╣  ║║╚═╗
    //  ╚═╝╩ ╩╚═╝╚═╝═╩╝╚═╝


    //  ╔═╗╔═╗╔═╗╔═╗╔═╗╦╔═╗╔╦╗╦╔═╗╔╗╔╔═╗
    //  ╠═╣╚═╗╚═╗║ ║║  ║╠═╣ ║ ║║ ║║║║╚═╗
    //  ╩ ╩╚═╝╚═╝╚═╝╚═╝╩╩ ╩ ╩ ╩╚═╝╝╚╝╚═╝

  },

};

