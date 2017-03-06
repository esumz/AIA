/**
 * Created by HaThao on 7/21/14.
 */


var routes = [
    {name: 'admin_home_page', path: framework.config['admin-route'] + '/', action: indexAction, flags: ['get']},
    {name: 'admin_system_info', path: framework.config['admin-route'] + '/get-system-info', action: adminSystemInfo, flags: ['authorize', 'post', 'xhr']},
    {name: 'admin_new_data', path: framework.config['admin-route'] + '/get-new-data', action: getNewData, flags: ['authorize', 'post', 'xhr']}
];

exports.install = function(framework) {
    global.routes = global.routes || new Array();

    routes.forEach(function(route) {
        framework.route(route.path, route.action, route.flags || ['get']);
        global.routes[route.name] = route.path;
    });
};

/**
 * View admin page
 */
function indexAction() {
	var self = this;

    if (utils.isEmpty(self.user)) {
        self.redirect(framework.config['admin-route'] + '/user/login');
    } else {
        self.view('index');
    }
}

/**
 * Get system info
 */
function adminSystemInfo() {
    var self = this;

    MODEL('user').schema.count({}, function(err, numberOfUser) {
        MODEL('cmsPost').schema.count({}, function(err, numberOfPost) {
            MODEL('cmsComment').schema.count({}, function(err, numberOfComment) {
                MODEL('ecomProduct').schema.count({}, function(err, numberOfProduct) {
                    self.json({
                        numberOfUser: numberOfUser,
                        numberOfPost: numberOfPost,
                        numberOfComment: numberOfComment,
                        numberOfProduct: numberOfProduct
                    });
                });
            });
        });
    });
}

/**
 * Get new data
 */
function getNewData() {
    var self = this;

    MODEL('user').schema.getList({}, 10, 1, function(err, listUser) {
        MODEL('cmsPost').schema.getList({}, 10, 1, function(err,listPost) {
            MODEL('cmsComment').schema.getList({}, 10, 1, function(err, listComment) {
                self.view('feeds', {
                    newUsers: listUser,
                    newPosts: listPost,
                    newComments: listComment
                });
            });
        });
    });
}