/**
 * Created by thaoha on 8/21/14.
 */

var routes = [
    {name: 'page_design', path: '/page-design', action: indexAction, flags: ['authorize', 'get']},
    {name: 'page_design', path: '/page-design/{link}', action: indexAction, flags: ['authorize', 'get']},
    {name: 'page_save', path: '/page-save', action: saveAction, flags: ['authorize', 'xhr', 'post']},
    {name: 'page_save', path: '/page-save/{id}', action: saveAction, flags: ['authorize', 'xhr', 'post']}
];

exports.install = function(framework) {
    global.routes = global.routes || new Array();

    routes.forEach(function(route) {
        framework.route(route.path, route.action, route.flags || ['get']);
        global.routes[route.name] = route.path;
    });
};

/**
 * Design page
 *
 * @param link
 */
function indexAction(link) {
    var self = this;
    var Page = MODEL('page').schema;

    if (!self.user || self.user.role == 'ROLE_USER') {
        self.redirect('/');
        return;
    }
    thComponent.getInfo(function(err, data) {
        Page.getOne({link: link || null}, function(err, page) {
            if (err) {
                self.redirect('/');
            } else {
                Page.getList({}, function(err, listPage) {
                    if (err) {
                        self.redirect('/');
                    } else {
                        self.view('index', {
                            page: page,
                            components: data.components,
                            pages: listPage
                        });
                    }
                });
            }
        });
    });
}

/**
 * Save page
 *
 * @param id
 */
function saveAction(id) {
    var self = this;
    var Page = MODEL('page').schema;
    var data = self.post;

    Page.getOne({_id: id || null}, function(err1, page) {
        page = page || new Page();
        page.layout = unescape(data.layout);
        page.rows = JSON.parse(data.rows);
        page.name = data.name;
        page.link = data.link;

        page.save(function(err) {
            self.json(err ? false : true);
        });
    });
}