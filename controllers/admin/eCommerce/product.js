/**
 * Created by HaThao on 7/21/14.
 */

var preAdminEComRoute = framework.config['admin-route'] + '/e-commerce';
var routes = [
    {name: 'adProduct_list', path: preAdminEComRoute + '/product-list', action: indexAction, flags: ['authorize', 'get']},
    {name: 'adProduct_list', path: preAdminEComRoute + '/product-list', action: indexAction, flags: ['authorize', 'xhr', 'post']},
    {name: 'adProduct_form', path: preAdminEComRoute + '/product-create', action: getFormAction, flags: ['authorize', 'get']},
    {name: 'adProduct_save', path: preAdminEComRoute + '/product-save', action: saveAction, flags: ['authorize', 'xhr', 'post']},
    {name: 'adProduct_edit', path: preAdminEComRoute + '/product-edit/{id}', action: editAction, flags: ['authorize', 'get']},
    {name: 'adProduct_delete', path: preAdminEComRoute + '/product-delete/{id}', action: deleteAction, flags: ['authorize', 'xhr', 'post']},
    {name: 'adProduct_alias', path: preAdminEComRoute + '/product-check-alias', action: checkAliasAction, flags: ['authorize', 'xhr', 'post']}
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
        MODEL('ecomProduct').schema.getList(data, 50, 1, function(err, listProduct) {
            MODEL('ecomCatalog').schema.getList({}, function(err, listCatalog) {
                self.view('index', {
                    products: listProduct,
                    catalogs: listCatalog
                });
            });
        });
    } else {
        if (dataFilter.catalog != 'all' && dataFilter.catalog != 'undefined') {
            data.catalog = dataFilter.catalog;
        }
        if (dataFilter.published != 'all') {
            data.published = dataFilter.published == 1 ? true : false;
        }
        if (dataFilter.name != '') {
            data.name = dataFilter.name;
        }
        MODEL('ecomProduct').schema.getList(data, 50, dataFilter.page, function(err, list) {
            self.view('list', {
                products: list
            });
        });
    }
}

/**
 * Get form for edit and add product
 */
function getFormAction() {
    var self = this;

    MODEL('ecomCatalog').schema.getList({}, function(err, listCatalog) {
        MODEL('ecomAttributeGroup').schema.getList({}, function(err, listAttributeGroup) {
            self.view('form', {
                catalogs: listCatalog,
                attributeGroups: listAttributeGroup
            });
        });
    });
}

/**
 * Create product
 */
function saveAction() {
    var self = this;
    var Product = MODEL('ecomProduct').schema;
    var data = self.post;

    data.user = self.user;
    data.description = decodeURI(data.description);
    data.published = data.published == '1' ? true : false,
    data.catalog = data.catalog == '' ? null : data.catalog,
    data.tagNames = data.tags.split(",");
    data.modified = new Date();
    data.tags = null;

    Product.findOne({_id: data.id}, function(err, product) {
        if (err) {
            product = new Product(data);
        } else {
            for (var attr in data) {
                product[attr] = data[attr];
            }
        }
        product.save(function(err) {
            if (!err) {
                self.json({error: false, productId: product.id});
            } else {
                self.json({error: true});
            }
        });
    });
}

/**
 * Edit product
 *
 * @param id
 */
function editAction(id) {
    var self = this;

    MODEL('ecomCatalog').schema.getList({}, function(err, list) {
        MODEL('ecomAttributeGroup').schema.getList({}, function(err, listAttributeGroup) {
            MODEL('ecomProduct').schema.getOne({_id: id}, function(err, product) {
                self.view('form', {
                    catalogs: list,
                    product: product,
                    attributeGroups: listAttributeGroup
                });
            });
        });
    });
}

/**
 * Delete product
 *
 * @param id
 */
function deleteAction(id) {
    var self = this;

    if (self.user.role != 'ROLE_ADMIN' && self.user.role != 'ROLE_SUPER_ADMIN') {
        self.json(false);
    } else {
        MODEL('ecomProduct').schema.getOne({_id: id}, function(err, product) {
            if (!err && !utils.isEmpty(product)) {
                product.remove();
                self.json(true);
            } else {
                self.json(false);
            }
        });
    }
}

/**
 * Check alias
 */
function checkAliasAction() {
    var self = this;
    var Product = MODEL('ecomProduct').schema;
    var data = self.post;

    Product.findOne({alias: data.alias}, function(err, product) {
        if (product && product.id != data.id) {
            self.json(false);
        } else {
            self.json(true);
        }
    });
}