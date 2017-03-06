/**
 * Created by thaoha on 8/21/14.
 */

var routes = [
    {name: 'page_view', path: '/page/{link}', action: indexAction},
    {name: 'page_view_param', path: '/page/{link}/{param}', action: indexAction}
];

exports.install = function(framework) {
    global.routes = global.routes || new Array();

    routes.forEach(function(route) {
        framework.route(route.path, route.action, route.flags || ['get']);
        global.routes[route.name] = route.path;
    });
};

/**
 * View page
 *
 * @param link
 */
function indexAction(link, param) {
    var self = this;
    var Page = MODEL('page').schema;
    param = param || null;

    async.waterfall([
        function(next) {
            Page.getOne({link: link}, function(err, page) {
                next(null, page);
            });
        },
        function(page, next) {
            thComponent.getInfo(function(err, data) {
                var rows = page.rows;
                var components = {};

                async.each(rows, function(row, callback) {
                    async.each(row.components, function(component, done) {
                        self.component(component.name, function(tpl) {
                            components[component.name] = {
                                name: component.name,
                                content: tpl
                            };
                            done();
                        }, false, param);

                    }, function(err) {
                        callback(err);
                    });

                }, function(err) {
                    next(err, {
                        page: page,
                        components: components,
                        componentAssets: data.components
                    });
                });
            });
        }
    ], function(err, results) {
        self.view('index', results);
    });
}