/**
 * Created by HaThao on 7/8/14.
 */

var preAdminPostRoute = framework.config['admin-route'] + '/cms';
var routes = [
    {name: 'adCms_post_list', path: preAdminPostRoute + '/post-list', action: indexAction, flags: ['authorize', 'get']},
    {name: 'adCms_post_list', path: preAdminPostRoute + '/post-list', action: indexAction, flags: ['authorize', 'post', 'xhr']},
    {name: 'adCms_post_view', path: preAdminPostRoute + '/post-view/{id}', action: viewAction, flags: ['authorize', 'get']},
    {name: 'adCms_post_create', path: preAdminPostRoute + '/post-create', action: createAction, flags: ['authorize', 'get']},
    {name: 'adCms_post_save', path: preAdminPostRoute + '/post-save', action: saveAction, flags: ['authorize', 'xhr', 'post']},
    {name: 'adCms_post_delete', path: preAdminPostRoute + '/post-delete/{id}', action: deleteAction, flags: ['authorize', 'xhr', 'post']},
    {name: 'adCms_post_edit', path: preAdminPostRoute + '/post-edit/{id}', action: editAction, flags: ['authorize', 'get']},
    {name: 'adCms_post_alias', path: preAdminPostRoute + '/post-check-alias', action: checkAliasAction, flags: ['authorize', 'xhr', 'post']}
];

exports.install = function(framework) {
    global.routes = global.routes || new Array();

    routes.forEach(function(route) {
        framework.route(route.path, route.action, route.flags || ['get']);
        global.routes[route.name] = route.path;
    });
}

/**
 * Get list post
 */
function indexAction() {
    var self = this;
    var dataFilter = self.post;

    if (!self.xhr) {
        MODEL('cmsPost').schema.getList({}, 50, 1, function(err, listPost) {
            MODEL('cmsCategory').schema.find({}, function(err, listCategory) {
                self.view('index', {
                    posts: listPost,
                    categories: listCategory
                });
            });
        });
    } else {
        if (dataFilter.category != 'all' && dataFilter.category != 'undefined') {
            data.category = dataFilter.category;
        }
        if (dataFilter.published != 'all') {
            data.published = dataFilter.published == 1 ? true : false;
        }
        if (dataFilter.title != '') {
            data.title = dataFilter.title;
        }
        MODEL('cmsPost').schema.getList(data, 50, dataFilter.page, function(err, listPost) {
            self.view('list', {posts: listPost});
        });
    }
}

/**
 * Get form create new post
 */
function createAction() {
    var self = this;

    MODEL('cmsCategory').schema.getList({}, function(err, list) {
        self.view('form', {categories: list});
    });
}

/**
 * Save post data
 */
function saveAction() {
    var self = this;
    var Post = MODEL('cmsPost').schema;
    var data = self.post;

    data.user = self.user;
    data.content = decodeURI(data.content);
    data.published = data.published == '1' ? true : false,
    data.category = data.category == '' ? null : data.category,
    data.tagNames = data.tags.split(",");
    data.modified = new Date();
    data.tags = null;

    Post.findOne({_id: data.id}, function(err, post) {
        if (err) {
            post = new Post(data);
        } else {
            for (var attr in data) {
                post[attr] = data[attr];
            }
        }
        post.save(function(err) {
            if (!err) {
                self.json({error: false, postId: post.id});
            } else {
                self.json({error: true});
            }
        });
    });
}

/**
 * View post
 *
 * @param id
 */
function viewAction(id) {
    var self = this;

    MODEL('cmsPost').schema.getOne({_id: id}, function(err, post) {
        MODEL('cmsComment').schema.getList({post: id, type: 'comment'}, 50, 1, function(err, listComment) {
            self.view('view', {
                post: post,
                comments: listComment,
                currentUser: self.user
            });
        });
    });
}

/**
 * Delete post
 *
 * @param id
 */
function deleteAction(id) {
    var self = this;

    MODEL('cmsPost').schema.getOne({_id: id}, function(err, post) {
        if (!err && !utils.isEmpty(post)) {
            post.remove();
            var logMessage = 'Article ['+id+']'+' was deleted by ['+self.user.id+']';
            self.log(logMessage);
            self.json(true);
        } else {
            self.json(false);
        }
    });
}

/**
 * Edit post
 *
 * @param id
 */
function editAction(id) {
    var self = this;

    MODEL('cmsPost').schema.getOne({_id: id}, function(err, post) {
        MODEL('cmsCategory').schema.find({}, function(err, listCategory) {
            self.view('form', {post: post, categories: listCategory});
        });
    });
}

/**
 * Check alias
 */
function checkAliasAction() {
    var self = this;
    var Post = MODEL('cmsPost').schema;
    var data = self.post;

    Post.getOne({alias: data.alias}, function(err, post) {
        if (post && post.id != data.id) {
            self.json(false);
        } else {
            self.json(true);
        }
    });
}