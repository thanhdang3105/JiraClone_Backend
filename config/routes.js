/**
 * Route Mappings
 * (sails.config.routes)
 *
 * Your routes tell Sails what to do each time it receives a request.
 *
 * For more information on configuring custom routes, check out:
 * https://sailsjs.com/anatomy/config/routes-js
 */

module.exports.routes = {
    // users

    'get /api/board': 'IssuesController.getIssues',
    'post /api/users': 'UsersController.getList',
    'patch /api/users/update': 'UsersController.update',
    'post /api/users/authorization': 'UsersController.authorization',
    'post /api/users/register': 'UsersController.register',
    'post /api/users/login': 'UsersController.login',
    'post /api/users/resetPwd': 'UsersController.resetPwd',

    // projects

    'post /api/projects/addUsers': 'ProjectsController.addUsers',
    'post /api/projects/removeUsers': 'ProjectsController.removeUsers',
    'post /api/projects/create': 'ProjectsController.create',
    'get /api/projects/getData': 'ProjectsController.getByUserId',
    'patch /api/projects/update': 'ProjectsController.update',
    'get /api/projects': 'ProjectsController.getByProjectId',
    'delete /api/projects': 'ProjectsController.delete',
    
    // issues
    
    'post /api/issues/create' : 'IssuesController.create',
    'patch /api/issues/update' : 'IssuesController.update',
    'patch /api/issues/updateMany' : 'IssuesController.updateMany',
    'get /api/issues/search' : 'IssuesController.search',
    'post /api/issues/comments' : 'IssuesController.addComment',
    'delete /api/issues' : 'IssuesController.delete',
};
