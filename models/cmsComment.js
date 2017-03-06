/**
 * Created by HaThao on 7/11/14.
 */

var Post = MODEL('cmsPost').schema;

var CmsCommentSchema = new mongoose.Schema({
    content: {
        type:       String,
        required:   true
    },
    user: {
        type:       mongoose.Schema.ObjectId,
        rel:        'User'
    },
    post: {
        type:       mongoose.Schema.ObjectId,
        ref:        'CmsPost'
    },
    type: {
        type:       String,
        default:    'comment'
    },
    replies: [{
        type:       mongoose.Schema.ObjectId,
        ref:        'CmsComment'
    }],
    created: {
        type:       Date,
        default:    Date.now
    }
});

/**
 * Methods
 */

CmsCommentSchema.statics.getList = function(data, limit, page, callback) {
    var query = this.find();

    if (typeof data.post != 'undefined' && data.post != '') {
        query = query.where('post').equals(data.post);
    }
    if (typeof data.type != 'undefined' && data.type != '') {
        query = query.where('type').equals(data.type);
    }
    if (typeof data.user != 'undefined' && data.user != '') {
        query = query.where('user').equals(data.user);
    }
    query = query.populate('post', 'id title alias')
        .populate('replies')
        .populate('user', 'id firstName lastName avatar')
        .sort({created: -1})
        .skip(limit*(page-1))
        .limit(limit);

    query.exec(callback);
}

CmsCommentSchema.statics.getOne = function(data, callback) {
    this.findOne(data)
        .populate('user', 'id firstName lastName avatar')
        .populate('post', 'id title alias')
        .populate('replies')
        .exec(callback);
}

/**
 * Define model
 *
 * @type {*|Model}
 */
exports.schema = mongoose.model('CmsComment', CmsCommentSchema);
exports.name = 'cmsComment';