/**
 * Created by HaThao on 7/8/14.
 */

var preAdminUserRoute = framework.config['admin-route'] + '/user';
var routes = [
    {name: 'adUser_group_list', path: preAdminUserRoute + '/group-list', action: indexAction, flags: ['authorize', 'get']},
    {name: 'adUser_group_create', path: preAdminUserRoute + '/group-create', action: createAction, flags: ['authorize', 'xhr', 'post']},
    {name: 'adUser_group_delete', path: preAdminUserRoute + '/group-delete/{id}', action: deleteAction, flags: ['authorize', 'xhr', 'post']}
];

exports.install = function(framework) {
    global.routes = global.routes || new Array();

    routes.forEach(function(route) {
        framework.route(route.path, route.action, route.flags || ['get']);
        global.routes[route.name] = route.path;
    });
}

/**
 * Get list group
 */
function indexAction() {
    var self = this;

    MODEL('group').schema.getList({}, function(err, listGroup) {
        MODEL('role').schema.find({}, function(err, listRole) {
            if (self.req.method == 'GET') {
                self.view('list', {
                    groups: listGroup,
                    roles: listRole
                });
            } else {
                self.json(list);
            }
        });
    });
}

/**
 * Create new group
 */
function createAction() {
    var self = this;
    var Group = MODEL('group').schema;
    var data = self.post;

    Group.getOne({_id: data.id || null}, function(err, group) {
        if (err || !group) {
            group = new Group();
        }
        group.name = data.name;
        group.description = data.description;
        group.roles = data.roles;
        group.admin = self.user.id;

        group.save(function(err) {
            self.json(err ? false : true);
        });
    });
}

/**
 * Delete group
 *
 * @param id
 */
function deleteAction(id) {
    var self = this;

    MODEL('group').schema.getOne({_id: id}, function(err, group) {
        if (!err && !utils.isEmpty(group)) {
            group.remove();
            self.json(true);
        } else {
            self.json(false);
        }
    });
}

/**
 * Edit group
 *
 * @param id
 */
function editAction(id) {
    var self = this;
    var data = self.post;

    self.module('group').update(id, data, {multi: false}, function(err, numAffected) {
        if (!err && numAffected > 0) {
            self.json(true);
        } else {
            self.json(false);
        }
    });
}
