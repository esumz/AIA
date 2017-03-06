/**
 * Created by HaThao on 7/7/14.
 */
var Post = MODEL('cmsPost').schema;

var CmsCategorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    alias: {
        type: String,
        required: true,
        unique: true
    },
    description:  String,
    order: {
        type:     Number,
        default:  0
    }
});

/**
 * Methods
 */
CmsCategorySchema.statics.getListCount = function(data, next) {
    var results = [];

    this.find(data)
        .exec(function(err, list) {
            if (!err) {
                async.each(list, function(category, fn) {
                    Post.count({category: category, published: true}, function(err, count) {
                        results.push({
                            name: category.name,
                            alias: category.alias,
                            description: category.description,
                            order: category.order,
                            count: count
                        });
                        fn(err);
                    });
                }, function(err) {
                    next(err, results);
                });
            }
        });
}

CmsCategorySchema.statics.getList = function(data, callback) {
    this.find(data)
        .exec(callback);
}

CmsCategorySchema.statics.getOne = function(data, callback) {
    this.findOne(data)
        .exec(callback);
}

/**
 * @type {*|Model}
 */
exports.schema = mongoose.model('CmsCategory', CmsCategorySchema);
exports.name = 'cmsCategory';