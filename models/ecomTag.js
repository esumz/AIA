/**
 * Created by HaThao on 7/11/14.
 */

var EcomTagSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
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

EcomTagSchema.statics.getList = function(data, limit, page, callback) {
    var query = this.find(data);

    query = query.populate('user', 'id firstName lastName avatar')
        .sort({created: -1});

    query.exec(callback);
}

EcomTagSchema.statics.getOne = function(data, callback) {
    this.findOne(data)
        .populate('user')
        .exec(callback);
}

/**
 * Define model
 *
 * @type {*|Model}
 */
exports.schema = mongoose.model('EcomTag', EcomTagSchema);
exports.name = 'ecomTag';