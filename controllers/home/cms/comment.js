/**
 * Created by HaThao on 7/21/14.
 */

var routes = [
    {name: 'blog_comment_add', path: '/cms/comment-add/{id}', action: addAction, flags: ['authorize', 'post', 'xhr']},
    {name: 'blog_comment_delete', path: '/cms/comment-delete/{id}', action: deleteAction, flags: ['authorize', 'post', 'xhr']}
];

exports.install = function(framework) {
    global.routes = global.routes || new Array();

    routes.forEach(function(route) {
        framework.route(route.path, route.action, route.flags || ['get']);
        global.routes[route.name] = route.path;
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
    var Post = MODEL('cmsPost').schema;
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
                        user: self.user,
                        content: data.content,
                        post: id,
                        type: data.type,
                        created: new Date()
                    });
                    newReply.save();
                    comment.replies.push(newReply);
                    comment.save();

                    self.view('~/home/'+thData.setting['frontendTemplate']+'/cms/comment/embed', {comments: [newReply]});
                }
            });
        } else {
            Post.getOne({_id: id}, function(err, post) {
                if (err || utils.isEmpty(post)) {
                    self.json(false);
                } else {
                    var newComment = new Comment({
                        user: self.user,
                        content: data.content,
                        type: data.type,
                        post: id,
                        created: new Date()
                    });
                    newComment.save();
                    self.view('~/home/'+thData.setting['frontendTemplate']+'/cms/comment/embed', {comments: [newComment]});
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
    var Comment = MODEL('cmsComment').schema;

    Comment.getOne({_id: id}, function(err, comment) {
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
