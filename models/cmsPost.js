/**
 * Created by HaThao on 7/11/14.
 */
var Category = MODEL('cmsCategory').schema;
var Comment = MODEL('cmsComment').schema;
var Tag = MODEL('cmsTag').schema;

var CmsPostSchema = new mongoose.Schema({
    title: {
        type:       String,
        required:   true
    },
    alias: {
        type:       String,
        required:   true,
        unique:     true
    },
    description: {
        type:       String,
        required:   true
    },
    content: {
        type:       String,
        required:   true
    },
    avatar: {
        type:       String,
        required:   true
    },
    user: {
        type:       mongoose.Schema.ObjectId,
        ref:        'User'
    },
    category: {
        type:       mongoose.Schema.ObjectId,
        ref:        'CmsCategory'
    },
    tags: [{
        type:       mongoose.Schema.ObjectId,
        ref:        'CmsTag'
    }],
    tagNames:       [String],
    views: {
        type:       Number,
        default:    0
    },
    created: {
        type:       Date,
        default:    Date.now
    },
    modified: {
        type:       Date,
        default:    Date.now
    },
    published: {
        type:       Boolean,
        default:    false
    }

});


CmsPostSchema.pre('save', function(next) {
    var self = this;

    async.parallel({

        tags: function(fn) {
            var list = [];
            async.each(self.tagNames, function(name, fn2) {
                Tag.findOne({name: name}, function(err, tag) {
                    if (err || !tag) {
                        tag = new Tag({
                            name: name,
                            user: self.user
                        });
                    }
                    tag.save();
                    list.push(tag);
                    fn2(err);
                });
            }, function(err) {
                fn(err, list);
            });
        }
    }, function(err, results) {
        self.tags = results.tags;
        next();
    });
});

/**
 * Methods
 */

CmsPostSchema.statics.getList = function(data, limit, page, callback) {
    var query = this.find();

    if (typeof data.user != 'undefined' && data.user != '') {
        query = query.where('user').equals(data.user);
    }
    if (typeof data.category != 'undefined' && data.category != '') {
        query = query.where('category').equals(data.category);
    }
    if (typeof data.title != 'undefined' && data.title != '') {
        query = query.where('title').regex(new RegExp(data.title, "i"));
    }
    if (typeof data.published != 'undefined') {
        query = query.where('published').equals(data.published);
    }
    query = query.populate('category')
        .populate('user', 'id firstName lastName avatar')
        .populate('tags', 'id name')
        .sort({created: -1})
        .skip(limit*(page-1))
        .limit(limit);

    query.exec(callback);
}

CmsPostSchema.statics.getOne = function(data, callback) {
    this.findOne(data)
        .populate('category')
        .populate('user')
        .populate('tags')
        .exec(callback);
}

/**
 * Define model
 *
 * @type {*|Model}
 */
exports.schema = mongoose.model('CmsPost', CmsPostSchema);
exports.name = 'cmsPost';