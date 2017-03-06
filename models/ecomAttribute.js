/**
 * Created by HaThao on 7/21/14.
 */
var FieldSchema = new mongoose.Schema({
    name:       String,
    value:      String
});

var EcomAttributeSchema = new mongoose.Schema({
    fields:     [FieldSchema],
    order: {
        type: Number,
        default: 0
    }
});


/**
 * Methods
 */
EcomAttributeSchema.statics.getList = function(data, callback) {
    this.find(data)
        .exec(callback);
}

EcomAttributeSchema.statics.getOne = function(data, callback) {
    this.findOne(data)
        .exec(callback);
}

/**
 * @type {*|Model}
 */
exports.schema = mongoose.model('EcomAttribute', EcomAttributeSchema);
exports.name = 'ecomAttribute';