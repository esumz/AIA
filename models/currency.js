/**
 * Created by thaoha on 9/23/14.
 */

var CurrencySchema = new mongoose.Schema({
    name: String,
    code: String,
    symb: String
});


CurrencySchema.statics.getList = function(data, callback) {
    this.find(data).exec(callback);
}

CurrencySchema.statics.getOne = function(data, callback) {
    this.findOne(data).exec(callback);
}

exports.schema = mongoose.model('currency', CurrencySchema);
exports.name = 'currency';