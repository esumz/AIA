/**
 * Created by HaThao on 7/21/14.
 */

var preAdminEcomRoute = framework.config['admin-route'] + '/e-commerce';
var routes = [
    {name: 'adProduct_tag_list', path: preAdminEcomRoute + '/tag-list', action: indexAction, flags: ['authorize', 'get']},
    {name: 'adProduct_tag_list', path: preAdminEcomRoute + '/tag-list', action: indexAction, flags: ['authorize', 'post', 'xhr']},
    {name: 'adProduct_tag_create', path: preAdminEcomRoute + '/tag-add', action: addAction, flags: ['authorize', 'xhr', 'post']},
    {name: 'adProduct_tag_delete', path: preAdminEcomRoute + '/tag-delete/{id}', action: deleteAction, flags: ['authorize', 'xhr', 'post']}
];

exports.install = function(framework) {
    global.routes = global.routes || new Array();

    routes.forEach(function(route) {
        framework.route(route.path, route.action, route.flags || ['get']);
        global.routes[route.name] = route.path;
    });
}


/**
 * List tag
 */
function indexAction() {
    var self = this;
    var Tag = MODEL('ecomTag').schema;
    var dataFilter = self.post;
    var view = !self.xhr ? 'index' : 'list';
    var data = {};

    if (self.xhr && dataFilter.username != '') {
        data.username = dataFilter.username;
    }

    Tag.getList(data, 50, dataFilter.page || 1, function(err, list) {
        self.view(view, {tags: list});
    });
}

/**
 * Delete comment
 *
 * @param id
 */
function deleteAction(id) {
    var self = this;

    MODEL('ecomTag').schema.getOne({_id: id}, function(err, tag) {
        if (!err && !utils.isEmpty(tag)) {
            tag.remove();
            var logMessage = 'Tag ['+tag.id+']'+ ' was deleted by ['+self.user.id+']';
            self.log(logMessage);
        } else {
            self.json(false);
        }
    });
}

/**
 * Add tag
 */
function addAction() {
    var self = this;
    var Tag = MODEL('ecomTag').schema;
    var data = self.post;
    var newTag = new Tag(data);

    newTag.save(function(err) {
        if (!err) {
            self.json(true);
        } else {
            self.json(false);
        }
    });
}
