/**
 * Created by HaThao on 7/11/14.
 */

var Product = MODEL('ecomProduct').schema;

var ecomReviewSchema = new mongoose.Schema({
    content: {
        type:       String,
        required:   true
    },
    user: {
        type:       mongoose.Schema.ObjectId,
        rel:        'User'
    },
    product: {
        type:       mongoose.Schema.ObjectId,
        ref:        'EcomProduct'
    },
    rate: {
        type:       Number,
        min:        0,
        max:        5,
        default:    0
    },
    created: {
        type:       Date,
        default:    Date.now
    }
});

/**
 * Methods
 */

ecomReviewSchema.statics.getList = function(data, limit, page, callback) {
    var query = this.find();

    if (typeof data.product != 'undefined' && data.product != '') {
        query = query.where('product').equals(data.product);
    }
    if (typeof data.user != 'undefined' && data.user != '') {
        query = query.where('user').equals(data.user);
    }
    query = query.populate('user', 'id firstName lastName avatar')
        .populate('product', 'id name alias')
        .sort({created: -1});

    if (limit && page) {
        query = query.skip(limit*(page-1)).limit(limit);
    }
    query.exec(callback);
}

ecomReviewSchema.statics.getOne = function(data, callback) {
    this.findOne(data)
        .populate('user', 'id firstName lastName avatar')
        .populate('product', 'id title alias')
        .exec(callback);
}

/**
 * Define model
 *
 * @type {*|Model}
 */
exports.schema = mongoose.model('EcomReview', ecomReviewSchema);
exports.name = 'ecomReview';