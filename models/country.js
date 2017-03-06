/**
 * Created by thaoha on 9/23/14.
 */

var CountrySchema = new mongoose.Schema({
    name: String,
    code: String,
    requireState: {
        type: Boolean,
        default: false
    }
});


CountrySchema.statics.getList = function(data, callback) {
    this.find(data).exec(callback);
}

CountrySchema.statics.getOne = function(data, callback) {
    this.findOne(data).exec(callback);
}

exports.schema = mongoose.model('Country', CountrySchema);
exports.name = 'country';