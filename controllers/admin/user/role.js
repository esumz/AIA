/**
 * Created by thaoha on 8/25/14.
 */

var preAdminUserRoute = framework.config['admin-route'] + '/user';
var routes = [
    {name: 'adUser_role_list', path: preAdminUserRoute + '/role-list', action: indexAction, flags: ['authorize', 'get']},
    {name: 'adUser_role_create', path: preAdminUserRoute + '/role-create', action: addAction, flags: ['authorize', 'xhr', 'post']},
    {name: 'adUser_role_delete', path: preAdminUserRoute + '/role-delete/{id}', action: deleteAction, flags: ['authorize', 'xhr', 'post']}
];

exports.install = function(framework) {
    global.routes = global.routes || new Array();

    routes.forEach(function(route) {
        framework.route(route.path, route.action, route.flags || ['get']);
        global.routes[route.name] = route.path;
    });
}

/**
 * List role
 */
function indexAction() {
    var self = this;
    var Role = MODEL('role');

    Role.schema.getList({}, function(err, list) {
        self.view('index', {
            roles: list,
            permissions: Role.permissions
        });
    });
}

/**
 * Add role
 */
function addAction() {
    var self = this;
    var data = self.post;
    var Role = MODEL('role').schema;

    Role.getOne({_id: data.id || null}, function(err, role) {
        if (err || !role) {
            role = new Role();
        }
        role.name = data.name;
        role.description = data.description;
        role.permissions = JSON.parse(data.permissions);
        role.save(function(err) {
            self.json(!err ? true : false);
        });
    });
}

/**
 * Delete role
 *
 * @param id
 */
function deleteAction(id) {
    var self = this;
    var Role = MODEL('role').schema;

    Role.getOne({_id: id}, function(err, role) {
        if (err || !role) {
            self.json(false);
        } else {
            role.remove();
            self.json(true);
        }
    });
}
