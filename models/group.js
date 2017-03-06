/**
 * Created by HaThao on 7/7/14.
 */

var GroupSchema = new mongoose.Schema({
    name: String,
    description: String,
    roles: [{
        type: mongoose.Schema.ObjectId,
        ref: 'Role'
    }]
});

/**
 * Methods
 */
GroupSchema.statics.getList = function(data, callback) {
    this.find(data)
        .exec(callback);
}

GroupSchema.statics.getOne = function(data, callback) {
    this.findOne(data)
        .exec(callback);
}
/**
 * @type {*|Model}
 */
exports.schema = mongoose.model('Group', GroupSchema);
exports.name = 'group';