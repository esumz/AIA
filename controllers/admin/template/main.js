/**
 * Created by ThaoHa on 10/10/2014.
 */


var routes = [
    {name: 'adSetting_page', path: framework.config['admin-route'] + '/setting/', action: indexAction, flags: ['authorize']}
];

exports.install = function(framework) {
    global.routes = global.routes || new Array();

    routes.forEach(function(route) {
        framework.route(route.path, route.action, route.flags || ['get']);
        global.routes[route.name] = route.path;
    });
}

function indexAction() {

}