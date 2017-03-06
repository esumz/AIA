/**
 * Created by HaThao on 7/29/14.
 */

var EComSettingSchema = new mongoose.Schema({

    tax: {
        type: Number,
        default: 0
    },
    deliveryMethods: [{
        name: String,
        title: String,
        cost: Number,
        default: false
    }],
    paymentMethods: [{
        name: String,
        title: String,
        default: false
    }]
});

EComSettingSchema.statics.get = function(data, callback) {
    this.findOne(data)
        .exec(callback);
}

exports.schema = mongoose.model('EComSetting', EComSettingSchema);
exports.name = 'eComSetting';