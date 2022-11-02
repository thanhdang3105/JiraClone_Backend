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

    'post /api/users': 'UsersController.getUsersById',
    'patch /api/users/update': 'UsersController.updateUser',
    'post /api/users/authorization': 'UsersController.authorization',
    'post /api/users/register': 'UsersController.register',
    'post /api/users/login': 'UsersController.login',
    'post /api/users/resetPwd': 'UsersController.resetPwd',
    'get /api/users/logout': 'UsersController.logout',

    // projects

    'post /api/projects/addUsers': 'ProjectsController.addUsers',
    'post /api/projects/removeUsers': 'ProjectsController.removeUsers',
    'post /api/projects/create': 'ProjectsController.createProject',
    'patch /api/projects/update': 'ProjectsController.updateProject',
    'get /api/projects': 'ProjectsController.getByProjectId',
    'delete /api/projects': 'ProjectsController.delete',
    
    // issues
    
    'post /api/issues/create' : 'IssuesController.createIssue',
    'patch /api/issues/update' : 'IssuesController.updateIssue',
    'patch /api/issues/updateMany' : 'IssuesController.updateMany',
    'get /api/issues/search' : 'IssuesController.search',
    'post /api/issues/comments' : 'IssuesController.addComment',
    'get /api/issues/comments' : 'IssuesController.getComments',
    'delete /api/issues' : 'IssuesController.delete',

    // admin
    'get /api/findProjects': 'ProjectsController.getList', 
    'get /api/findIssues': 'IssuesController.getList', 
    'get /api/findUsers': 'UsersController.getList' 
};
