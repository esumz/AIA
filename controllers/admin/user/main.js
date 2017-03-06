/**
 * Created by HaThao on 7/8/14.
 */

var preAdminUserRoute = framework.config['admin-route'] + '/user';
var routes = [
    {name: 'adUser_logout', path: preAdminUserRoute + '/logout', action: logoutAction, flags: ['authorize']},
    {name: 'adUser_login', path: preAdminUserRoute + '/login', action: loginAction},
    {name: 'adUser_check_login', path: preAdminUserRoute + '/check-login', action: loginAction, flags: ['xhr', 'post']},
    {name: 'adUser_list', path: preAdminUserRoute + '/list', action: indexAction, flags: ['authorize', 'get']},
    {name: 'adUser_list', path: preAdminUserRoute + '/list', action: indexAction, flags: ['authorize', 'xhr', 'post']},
    {name: 'adUser_save', path: preAdminUserRoute + '/save', action: saveAction, flags: ['authorize', 'xhr', 'post']},
    {name: 'adUser_delete', path: preAdminUserRoute + '/delete/{id}', action: deleteAction, flags: ['authorize', 'xhr', 'post']},
    {name: 'adUser_edit', path: preAdminUserRoute + '/edit/{id}', action: editAction, flags: ['authorize', 'xhr', 'post']},
    {name: 'adUser_profile', path: preAdminUserRoute + '/profile', action: viewProfileAction, flags: ['authorize']},
    {name: 'adUser_change_password', path: preAdminUserRoute + '/profile/change-password', action: changePasswordAction, flags: ['authorize', 'xhr', 'post']},
    {name: 'adUser_change_avatar', path: preAdminUserRoute + '/profile/change-avatar', action: changeAvatarAction, flags: ['upload']}
];

exports.install = function(framework) {
    global.routes = global.routes || new Array();

    routes.forEach(function(route) {
        framework.route(route.path, route.action, route.flags || ['get']);
        global.routes[route.name] = route.path;
    });
}


/**
 * Get list user
 */
function indexAction() {
    var self = this;
    var dataFilter = self.post;
    var data = {};
    var view = !self.xhr ? 'index' : 'list';

    if (self.xhr) {
        if (dataFilter.group != 'all' && dataFilter.group != 'undefined') {
            data.group = dataFilter.group;
        }
        if (dataFilter.isActive != 'all') {
            data.isActive = dataFilter.isActive == 1 ? true : false;
        }
        if (dataFilter.email != '') {
            data.email = dataFilter.email;
        }
    }
    MODEL('user').schema.getList(data, 50, dataFilter.page || 1, function(err, listUser) {
        MODEL('group').schema.find({}, function(err, listGroup) {
            MODEL('role').schema.find({}, function(err, listRole) {
                self.view(view, {
                    users: listUser,
                    groups: listGroup,
                    roles: listRole
                });
            });
        });
    });
}

/**
 * Login view
 */
function loginAction() {
    var self = this;
    var auth = self.module('authorization');
    var data = self.post;

    if (!self.xhr) {
        if (!utils.isEmpty(self.user) && self.user.role == 'ROLE_ADMIN') {
            self.redirect(framework.config['admin-route']);
            return;
        }
        self.view('login');
        return;
    }
    self.module('user').checkLogin({email: data.email, password: data.password}, function(err, user) {

        if (!utils.isEmpty(user) && user.role == 'ROLE_ADMIN') {
            auth.login(self, user.id, user);

            var logMessage = 'User ['+user.id+']'+ ' logged in';
            self.log(logMessage);
            self.json(true);
        } else {
            self.json(false);
        }
    });
}


/**
 * Create or update user
 */
function saveAction() {
    var self = this;
    var User = self.module('user');
    var data = self.post;

    async.waterfall([
        function handle(next) {
            if (!data.updateProfile) {
                data.isActive = data.isActive == 'on' ? true : false;
            }
            next(null, data);
        },
        function save(data, next) {
            if (data.id != '') {
                User.updateInfo(data, function(err, numAffected) {
                    next(err, numAffected);
                });
            } else {
                User.createNew(data, function(err, newUser) {
                    next(err, newUser);
                });
            }
        }
    ], function(err, results) {
        self.json(err ? false : true);
    });
}

/**
 * Delete user
 *
 * @param id
 */
function deleteAction(id) {
    var self = this;

    if (self.user.role != 'ROLE_ADMIN') {
        var valid = permission.check(self.user, 'user', 'delete');
        if (!valid) {
            self.json(false);
            return;
        }
    }
    MODEL('user').schema.getOne({_id: id}, function(err, user) {
        if (!err && !utils.isEmpty(user)) {
            user.remove();
            var logMessage = 'User ['+user.id+']'+ ' was deleted by ['+self.user.id+']';
            self.log(logMessage);
            self.json(true);
        } else {
            self.json(false);
        }
    });
}

/**
 * Edit user
 *
 * @param id
 */
function editAction(id) {
    var self = this;
    var data = self.post;

    self.module('user').update(id, data, function(err) {
        if (!err) {
            self.json(true);
        } else {
            self.json(false);
        }
    });
}

// Logoff process
// POST, [+xhr, logged]
function logoutAction() {
    var self = this;
    var auth = self.module('authorization');
    var user = self.user;

    var logMessage = 'User ['+user.id+']'+ ' was logged out';
    self.log(logMessage);

    // remove cookie
    // remove user session
    auth.logoff(self, user.id);

    self.redirect(framework.config['admin-route'] + '/user/login');
}

/**
 * View profile
 *
 * @param id
 */
function viewProfileAction() {
    var self = this;

    self.view('profile', {user: self.user});
}

/**
 * Change password
 */
function changePasswordAction() {
    var self = this;
    var User = MODEL('user').schema;
    var data = self.post;

    if (data.newPassword != data.rePassword) {
        self.json(false);
    }
    User.findOne({_id: data.id}, function(err, user) {
        if (err || utils.isEmpty(user)) {
            self.json(false);
        } else {
            var currentPassword = self.module('user').generatePassword(data.currentPassword);

            if (currentPassword != user.password) {
                self.json(false);
            } else {
                user.password = self.module('user').generatePassword(data.newPassword);
                user.save(function(err) {
                    self.json(err ? false : true);
                });
            }
        }
    });
}

/**
 * Change avatar
 */
function changeAvatarAction() {
    var self = this;
    var user = self.user;
    var avatar = self.files[0];

    self.module('file').upload(user, avatar, 'privacy', true, function(err, id, stat) {
        if (err) {
            self.json(false);
        } else {
            var data = {
                id: user.id,
                avatar: 'uploads/' + user.id + '/privacy/' + id + '.' + stat.extension
            };
            self.module('user').updateInfo(data, function(err) {
                if (!err) {
                    self.user.avatar = data.avatar;
                    self.json(true);
                } else {
                    self.json(false);
                }
            });
        }
    });
}
