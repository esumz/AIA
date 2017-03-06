/**
 * Created by HaThao on 7/21/14.
 */

var preAdminEComRoute = framework.config['admin-route'] + '/e-commerce';
var routes = [
    {name: 'adOrder_list', path: preAdminEComRoute + '/order-list', action: indexAction, flags: ['authorize', 'get']},
    {name: 'adOrder_list', path: preAdminEComRoute + '/order-list', action: indexAction, flags: ['authorize', 'xhr', 'post']},
    {name: 'adOrder_view', path: preAdminEComRoute + '/order-view/{id}', action: viewAction, flags: ['authorize', 'get']},
    {name: 'adOrder_delete', path: preAdminEComRoute + '/order-delete/{id}', action: deleteAction, flags: ['authorize', 'xhr', 'post']}
];

exports.install = function(framework) {
    global.routes = global.routes || new Array();

    routes.forEach(function(route) {
        framework.route(route.path, route.action, route.flags || ['get']);
        global.routes[route.name] = route.path;
    });
}

/**
 * Get list product
 */
function indexAction() {
    var self = this;
    var dataFilter = self.post;
    var data = {};

    if (!self.xhr) {
        MODEL('order').schema.getList(data, 50, 1, function(err, list) {
            self.view('index', {
                orders: list
            });
        });
    } else {
        if (dataFilter.status != 'all') {
            data.status = dataFilter.status;
        }
        MODEL('order').schema.getList(data, 50, dataFilter.page, function(err, list) {
            self.view('list', {orders: list});
        });
    }
}

/**
 * Delete order
 *
 * @param id
 */
function deleteAction(id) {
    var self = this;

    MODEL('order').schema.getOne({_id: id}, function(err, order) {
        if (!err && !utils.isEmpty(order)) {
            order.remove();
            self.json(true);
        } else {
            self.json(false);
        }
    });
}

/**
 * View order
 *
 * @param id
 */
function viewAction(id) {
    var self = this;

    MODEL('order').schema.getOne({_id: id}, function(err, order) {
        self.view('view', {order: order});
    });
}

