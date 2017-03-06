/**
 * Created by HaThao on 7/8/14.
 */

var routes = [
//    {name: 'user_login_page', path: '/user', action: 'loginAction'},
    {name: 'user_profile_view', path: '/user/profile/{id}', action: profileAction, flags: ['authorize']},
    {name: 'owner_profile_view', path: '/user/profile', action: profileAction, flags: ['authorize']},
    {name: 'user_profile_save', path: '/user/save', action: saveAction, flags: ['authorize', 'xhr', 'post']},
    {name: 'user_login_page', path: '/user/login', action: loginAction},
    {name: 'user_login_page', path: '/user/login', action: loginAction, flags: ['xhr', 'post']},
    {name: 'user_logout_page', path: '/user/logout', action: logoutAction, flags: ['authorize']},
    {name: 'user_registry_page', path: '/user/registry', action: registryAction},
    {name: 'user_registry_page', path: '/user/registry', action: registryAction, flags: ['xhr', 'post']},
    {name: 'user_change_password', path: '/user/change-password', action: changePasswordAction, flags: ['authorize', 'xhr', 'post']},
    {name: 'user_change_avatar', path: '/user/change-avatar', action: changeAvatarAction, flags: ['upload']},
    {name: 'user_facebook_auth', path: '/auth/facebook', action: fbLoginAction},
    {name: 'user_facebook_callback', path: '/auth/facebook/callback', action: fbCallBackAction}
];

exports.install = function(framework) {
    global.routes = global.routes || new Array();

    routes.forEach(function(route) {
        framework.route(route.path, route.action, route.flags || ['get']);
        global.routes[route.name] = route.path;
    });
}

/**
 * Profile
 */
function profileAction() {
    var self = this;
    var Customer = MODEL('customer').schema;
    var Order = MODEL('order').schema;

    async.waterfall([
        function getCustomer(next) {
            Customer.getOne({user: self.user}, function(err, customer) {
                next(err, customer);
            });
        },
        function getOrders(customer, next) {
            Order.getList({customer: customer}, 50, 1, function(err, list) {
                next(err, list);
            });
        }
    ], function(err, orders) {
        self.view('~/home/'+global.thData['setting']['frontendTemplate']+'/user/index', {
            orders: orders
        });
    });
}

/**
 * Sign up
 */
function registryAction() {
    var self = this;
    var User = self.module('user');
    var auth = self.module('authorization');

    if (!utils.isEmpty(self.user)) {
        self.redirect('/user');
        return;
    }
    if (!self.xhr) {
        self.view('~/home/'+global.thData['setting']['frontendTemplate']+'/user/registry');
    } else {
        var data = self.post;

        User.createNew(data, function(err, newUser) {
            if (!err) {
                auth.login(self, newUser.id, newUser);
            }
            self.json(err ? false : true);
        });
    }
}

/**
 * Login
 */
function loginAction() {
    var self = this;
    var auth = self.module('authorization');
    var data = self.post;

    if (!self.xhr) {
        if (!utils.isEmpty(self.user)) {
            self.redirect('/user/profile');
        }
        self.view('~/home/'+thData.setting['frontendTemplate']+'/user/login');
    } else {
        self.module('user').checkLogin({email: data.email, password: data.password}, function(err, user) {
            if (!utils.isEmpty(user) && user.isActive === true) {
                auth.login(self, user.id, user);
                global.thData['user'] = user;

                var logMessage = 'User ['+user.id+']'+ ' logged in';
                self.log(logMessage);
                self.json(true);
            } else {
                self.json(false);
            }
        });
    }
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
    global.thData['user'] = null;

    self.redirect('/user/login');
}


/**
 * Update user info
 */
function saveAction() {
    var self = this;
    var auth = self.module('authorization');
    var User = MODEL('user').schema;
    var data = self.post;

    data.modified = new Date();
    User.update({_id: data.id}, data, {multi: false}, function(err, numAffected) {
        if (!err && numAffected > 0) {
            // Log
            var logMessage = 'User ['+self.user.id+']'+ ' was updated by ['+self.user.id+']';
            self.log(logMessage);

            // update self.user - profile update
            if (data.updateProfile) {
                User.findOne({_id: data.id}, function(err, user) {
                    auth.login(self, user.id, user);
                    self.json(true);
                });
            } else {
                self.json(true);
            }
        } else {
            self.json(false);
        }
    });
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
        return;
    }
    User.findOne({_id: data.id}, function(err, user) {
        if (utils.isEmpty(user) || (user.id != self.user.id && self.user.role != 'ROLE_ADMIN')) {
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

/**
 * Login with facebook
 */
function fbLoginAction() {
    var self = this;

    passport.authenticate('facebook', {scope: ['email']}, function () {})(self.req, self.res);
}

function fbCallBackAction() {
    var self = this;
    var auth = self.module('authorization');

    passport.authenticate('facebook',
        {successRedirect: '/', failureRedirect: '/user/login'},
        function (err, user) {
            if (!err) {
                auth.login(self, user.id, user);
                self.redirect('/');
            } else {
                self.redirect('/user/login');
            }
        })(self.req, self.res);
}