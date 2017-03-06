/**
 * Created by HaThao on 7/11/14.
 */

var CmsTagSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: String,
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    }
});

/**
 * Methods
 */

CmsTagSchema.statics.getList = function(data, limit, page, callback) {
    var query = this.find(data);

    query = query.populate('user', 'id firstName lastName avatar')
        .sort({created: -1});

    query.exec(callback);
}

CmsTagSchema.statics.getOne = function(data, callback) {
    this.findOne(data)
        .populate('user')
        .exec(callback);
}

/**
 * Define model
 *
 * @type {*|Model}
 */
exports.schema = mongoose.model('CmsTag', CmsTagSchema);
exports.name = 'cmsTag';