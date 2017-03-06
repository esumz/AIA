/**
 * Created by HaThao on 8/11/14.
 */

var routes = [
    {name: 'adPage_manager', path: framework.config['admin-route'] + '/page/index', action: indexAction, flags: ['authorize']},
    {name: 'adPage_delete', path: framework.config['admin-route'] + '/page/delete/{link}', action: deleteAction, flags: ['authorize', 'xhr', 'post']}
];

exports.install = function(framework) {
    global.routes = global.routes || new Array();

    routes.forEach(function(route) {
        framework.route(route.path, route.action, route.flags || ['get']);
        global.routes[route.name] = route.path;
    });
}

/**
 * Manager component page
 */
function indexAction() {
    var self = this;
    var Page = MODEL('page').schema;

    Page.getList({}, function(err, listPage) {
        self.view('../index', {
            pages: listPage
        });
    });
}

/**
 * Delete page
 *
 * @param link
 */
function deleteAction(link) {
    var self = this;
    var Page = MODEL('page').schema;
    link = link || null;

    Page.getOne({link: link}, function(err, page) {
        if (err || !page) {
            self.json(false);
        } else {
            page.remove();
            self.json(true);
        }
    });
}