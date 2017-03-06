/**
 * Created by thaoha on 9/23/14.
 */

var RegionSchema = new mongoose.Schema({
    name: String,
    code: String,
    countryCode: String
});


RegionSchema.statics.getList = function(data, callback) {
    this.find(data).exec(callback);
}

RegionSchema.statics.getOne = function(data, callback) {
    this.findOne(data).exec(callback);
}

exports.schema = mongoose.model('Region', RegionSchema);
exports.name = 'region';