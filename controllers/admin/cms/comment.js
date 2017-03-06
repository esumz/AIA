/**
 * Created by HaThao on 7/21/14.
 */

var preAdminCmsRoute = framework.config['admin-route'] + '/cms';
var routes = [
    {name: 'adComment_list', path: preAdminCmsRoute + '/comment-list', action: indexAction, flags: ['authorize', 'get']},
    {name: 'adComment_list', path: preAdminCmsRoute + '/comment-list', action: indexAction, flags: ['authorize', 'post', 'xhr']},
    {name: 'adComment_create', path: preAdminCmsRoute + '/comment-add/{id}', action: addAction, flags: ['authorize', 'xhr', 'post']},
    {name: 'adComment_delete', path: preAdminCmsRoute + '/comment-delete/{id}', action: deleteAction, flags: ['authorize', 'xhr', 'post']}
];

exports.install = function(framework) {
    global.routes = global.routes || new Array();

    routes.forEach(function(route) {
        framework.route(route.path, route.action, route.flags || ['get']);
        global.routes[route.name] = route.path;
    });
}

/**
 * Get list comment manager
 */
function indexAction() {
    var self = this;
    var dataFilter = self.post;
    var Comment = MODEL('cmsComment').schema;
    var view = !self.xhr ? 'index' : 'list';
    var data = {};

    if (self.xhr && dataFilter.username != '') {
        data.username = dataFilter.username;
    }
    Comment.getList(data, 50, dataFilter.page || 1, function(err, list) {
        self.view(view, {comments: list});
    });
}

/**
 * Add comment
 *
 * @param postId
 */
function addAction(id) {
    var self = this;
    var Comment = MODEL('cmsComment').schema;
    var data = self.post;

    data.type = data.type == 'reply' ? data.type : 'comment';

    if (data.content == '') {
        self.json(false);
    } else {
        if (data.type == 'reply' && data.commentId != '') {
            Comment.getOne({_id: data.commentId}, function(err, comment) {
                if (err || utils.isEmpty(comment)) {
                    self.json(false);
                } else {
                    var newReply = new Comment({
                        userId: self.user.id,
                        username: self.user.firstName + ' ' + self.user.lastName,
                        avatar: self.user.avatar,
                        content: data.content,
                        post: id,
                        type: data.type,
                        created: new Date()
                    });
                    newReply.save();
                    comment.replies.push(newReply);
                    comment.save();

                    self.view('embed', {comments: [newReply]});
                }
            });
        } else {
            MODEL('cmsPost').schema.getOne({_id: id}, function(err, post) {
                if (err || utils.isEmpty(post)) {
                    self.json(false);
                } else {
                    var newComment = new Comment({
                        userId: self.user.id,
                        username: self.user.firstName + ' ' + self.user.lastName,
                        avatar: self.user.avatar,
                        content: data.content,
                        type: data.type,
                        post: id,
                        created: new Date()
                    });
                    newComment.save();
                    self.view('embed', {comments: [newComment]});
                }
            });
        }
    }
}

/**
 * Delete comment
 *
 * @param id
 */
function deleteAction(id) {
    var self = this;

    MODEL('cmsComment').schema.getOne({_id: id}, function(err, comment) {
        if (!err && !utils.isEmpty(comment)) {
            if (comment.admin.id == self.user.id) {
                var replies = comment.replies;
                if (replies.length > 0) {
                    replies.forEach(function(reply) {
                        reply.remove();
                    });
                }
                comment.remove();
                var logMessage = 'Comment ['+comment.id+']'+ ' was deleted by ['+self.user.id+']';
                self.log(logMessage);
                self.json(true);
            } else {
                self.json(false);
            }
        } else {
            self.json(false);
        }
    });
}

