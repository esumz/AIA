/**
 * Created by HaThao on 7/21/14.
 */

var preAdminCmsRoute = framework.config['admin-route'] + '/cms';
var routes = [
    {name: 'adCategory_list', path: preAdminCmsRoute + '/category-list', action: indexAction, flags: ['authorize', 'get']},
    {name: 'adCategory_create', path: preAdminCmsRoute + '/category-create', action: addAction, flags: ['authorize', 'xhr', 'post']},
    {name: 'adCategory_delete', path: preAdminCmsRoute + '/category-delete/{id}', action: deleteAction, flags: ['authorize', 'xhr', 'post']}
];

exports.install = function(framework) {
    global.routes = global.routes || new Array();

    routes.forEach(function(route) {
        framework.route(route.path, route.action, route.flags || ['get']);
        global.routes[route.name] = route.path;
    });
}


/**
 * Get list category
 */
function indexAction() {
    var self = this;

    MODEL('cmsCategory').schema.getList({}, function(err, list) {
        if (self.req.method == 'GET') {
            self.view('index', {categories: list});
        } else {
            self.json(list);
        }
    });
}

/**
 * Create category
 */
function addAction() {
    var self = this;
    var Category = MODEL('cmsCategory').schema;
    var data = self.post;
    data.alias = data.alias.toLowerCase();
    global.thData['categories'] = null;

    if (data.id != '') {
        Category.update({_id: data.id}, data, {multi: false}, function(err, numAffected) {
            self.json(!err && numAffected > 0 ? true : false);
        });
    } else {
        new Category(data).save(function(err) {
            self.json(err ? false : true);
        });
    }
}

/**
 * Delete category
 *
 * @param id
 */
function deleteAction(id) {
    var self = this;
    global.thData['categories'] = null;

    MODEL('cmsCategory').schema.getOne({_id: id}, function(err, category) {
        if (!err && !utils.isEmpty(category)) {
            category.remove();
            self.json(true);
        } else {
            self.json(false);
        }
    });
}
