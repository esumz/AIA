/**
 * Created by thaoha on 9/24/14.
 */

var routes = [
    {name: 'region_list', path: '/region-list/{countryCode}', action: regionListAction, flags: ['xhr', 'post']}
];

exports.install = function(framework) {
    global.routes = global.routes || new Array();

    routes.forEach(function(route) {
        framework.route(route.path, route.action, route.flags || ['get']);
        global.routes[route.name] = route.path;
    });
}

/**
 * Get region list of country
 *
 * @param countryCode
 */
function regionListAction(countryCode) {
    var self = this;
    var Region = MODEL('region').schema;

    Region.getList({countryCode: countryCode || null}, function(err, list) {
        self.view('~/home/'+global.thData['setting']['frontendTemplate']+'/eCommerce/country/state', {
            states: list
        });
    });
}