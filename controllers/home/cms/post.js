/**
 * Created by HaThao on 7/8/14.
 */

var routes = [
    {name: 'blog_page', path: '/blog', action: indexAction},
    {name: 'blog_page', path: '/blog', action: indexAction, flags: ['xhr', 'post']},
    {name: 'blog_page_category', path: '/blog/{category}', action: indexAction},
    {name: 'blog_page_category', path: '/blog/{category}', action: indexAction, flags: ['xhr', 'post']},
    {name: 'blog_view', path: '/blog-view/{alias}', action: viewAction}
];

exports.install = function(framework) {
    global.routes = global.routes || new Array();

    routes.forEach(function(route) {
        framework.route(route.path, route.action, route.flags || ['get']);
        global.routes[route.name] = route.path;
    });
}

function indexAction(category) {
    var self = this;
    var Post = MODEL('cmsPost').schema;
    var Comment = MODEL('cmsComment').schema;
    var Category = MODEL('cmsCategory').schema;
    var limit = 15;
    var filter = {};

    if (!self.xhr) {
        async.parallel({
            comments: function(next) {
                Comment.getList({}, 5, 1, function(err, list) {
                    next(err, list);
                });
            },
            category: function(next) {
                Category.getOne({alias: category || null}, function(err, cate) {
                    if (cate) {
                        filter.category = cate;
                    }
                    next(err, cate);
                });
            }
        }, function(err, results) {
            Post.getList(filter, limit, self.get.page || 1, function(err, list) {
                results.user = self.user;
                results.posts = list;
                self.view('~/home/'+thData.setting['frontendTemplate']+'/cms/post/index', results);
            });
        });
    } else {
        var data = self.post;

        Post.getList(filter, limit, data.page || 1, function(err, list) {
            self.view('~/home/'+thData.setting['frontendTemplate']+'/cms/post/list', {
                posts: list,
                page: data.page || 1
            });
        });
    }
}

/**
 * View post
 *
 * @param alias
 */
function viewAction(alias) {
    var self = this;

    async.waterfall([
        function(next) {
            MODEL('cmsPost').schema.getOne({alias: alias, published: true}, function(err, post) {
                next(err, post);
            });
        },
        function(post, next) {
            MODEL('cmsComment').schema.getList({post: post, type: 'comment'}, 100, 1, function(err, list) {console.log(list);
                next(err, {
                    post: post,
                    comments: list
                });
            });
        }
    ], function(err, results) {
        if (utils.isEmpty(results.post)) {
            self.view404();
        } else {
            self.view('~/home/'+thData.setting['frontendTemplate']+'/cms/post/view', results);
        }
    });
}

