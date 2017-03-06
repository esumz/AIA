/**
 * Created by HaThao on 7/21/14.
 */

var preAdminEComRoute = framework.config['admin-route'] + '/e-commerce';
var routes = [
    {name: 'adCatalog_list', path: preAdminEComRoute + '/catalog-list', action: indexAction, flags: ['authorize', 'get']},
    {name: 'adCatalog_create', path: preAdminEComRoute + '/catalog-create', action: addAction, flags: ['authorize', 'xhr', 'post']},
    {name: 'adCatalog_delete', path: preAdminEComRoute + '/catalog-delete/{id}', action: deleteAction, flags: ['authorize', 'xhr', 'post']}
];

exports.install = function(framework) {
    global.routes = global.routes || new Array();

    routes.forEach(function(route) {
        framework.route(route.path, route.action, route.flags || ['get']);
        global.routes[route.name] = route.path;
    });
}

/**
 * Get list catalog
 */
function indexAction() {
    var self = this;

    MODEL('ecomCatalog').schema.getList({}, function(err, listCatalog) {
        MODEL('ecomAttributeGroup').schema.getList({}, function(err, listAttrGroup) {
            self.view('index', {
                catalogs: listCatalog,
                attributeGroups: listAttrGroup
            });
        });
    });
}

/**
 * Create catalog
 */
function addAction() {
    var self = this;
    var Catalog = MODEL('ecomCatalog').schema;
    var data = self.post;
    data.alias = data.alias.toLowerCase();
    global.thData['catalogs'] = null;

    if (data.id != '') {
        Catalog.update({_id: data.id}, data, {multi: false}, function(err, numAffected) {
            if (!err && numAffected > 0) {
                self.json(true);
            } else {
                self.json(false);
            }
        });
    } else {
        data.attributeGroup = data.attributeGroup == 'none' ? null : data.attributeGroup;
        new Catalog(data).save(function(err) {
            if (!err) {
                self.json(true);
            } else {
                self.json(false);
            }
        });
    }
}

/**
 * Delete catalog
 *
 * @param id
 */
function deleteAction(id) {
    var self = this;
    global.thData['catalogs'] = null;

    MODEL('ecomCatalog').schema.getOne({_id: id}, function(err, catalog) {
        if (!err && !utils.isEmpty(catalog)) {
            catalog.remove();
            self.json(true);
        } else {
            self.json(false);
        }
    });
}
