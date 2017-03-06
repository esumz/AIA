/**
 * Created by HaThao on 7/21/14.
 */

var routes = [
    {name: 'home_page', path: '/', action: indexAction},
    {name: 'home_page', path: '/', action: indexAction, flags: ['post', 'xhr']},
    {name: 'product_page', path: '/products', action: indexAction},
    {name: 'product_page', path: '/products', action: indexAction, flags: ['post', 'xhr']},
    {name: 'product_page_catalog', path: '/products/{catalog}', action: indexAction},
    {name: 'product_page_catalog', path: '/products/{catalog}', action: indexAction, flags: ['post', 'xhr']},
    {name: 'product_view', path: '/view-product/{alias}', action: viewAction}
];

exports.install = function(framework) {
    global.routes = global.routes || new Array();

    routes.forEach(function(route) {
        framework.route(route.path, route.action, route.flags || ['get']);
        global.routes[route.name] = route.path;
    });
}

/**
 * Product view index
 */
function indexAction(catalog) {
    var self = this;
    var limit = 12;
    var Product = MODEL('ecomProduct').schema;
    var Catalog = MODEL('ecomCatalog').schema;
    var filter = {published: true};

    if (!self.xhr) {
        async.parallel({
            bestViewers: function(next) {
                Product.bestViewers({published: true}, 10, function(err, list) {
                    next(err, list);
                });
            },
            catalog: function(next) {
                Catalog.getOne({alias: catalog || null}, function(err, cata) {
                    if (cata) {
                        filter.catalog = cata;
                    }
                    next(err, cata);
                });
            }
        }, function(err, results) {
            Product.getList(filter, limit, 1, function(err, list) {
                results.user = self.user;
                results.products = list;
                self.view('~/home/'+thData.setting['frontendTemplate']+'/eCommerce/product/index', results);
            });
        });
    } else {
        var data = self.post;

        Product.getList(filter, limit, data.page || 1, function(err, list) {
            MODEL('setting').schema.get(function(err, setting) {
                self.view('~/home/'+thData.setting['frontendTemplate']+'/eCommerce/product/list', {
                    setting: setting,
                    products: list,
                    page: data.page || 1
                });
            });
        });
    }
}

/**
 * View product
 */
function viewAction(alias) {
    var self = this;
    var Product = MODEL('ecomProduct').schema;

    async.waterfall([
        function find(next) {
            Product.getOne({alias: alias || null, published: true}, function(err, product) {
                if (!err) {
                    product.numberOfView++;
                    product.save();
                }
                next(err, product);
            });
        },
        function bestSellers(product, next) {
            Product.bestSellers({published: true}, 5, function(err, list) {
                next(err, list, product);
            });
        },
        function getReviews(bestSellers, product, next) {
            MODEL('ecomReview').schema.getList({product: product}, null, null, function(err, list) {
                next(err, {
                    product: product,
                    bestSellers: bestSellers,
                    reviews: list
                });
            });
        }
    ], function(err, results) {
        if (utils.isEmpty(results.product)) {
            self.view404();
        } else {
            self.view('~/home/'+thData.setting['frontendTemplate']+'/eCommerce/product/view', results);
        }
    });
}
