/**
 * Created by HaThao on 7/29/14.
 */

var Currency = MODEL('currency').schema;

var SettingSchema = mongoose.Schema({

    title:        String,
    description:  String,
    keywords:     String,
    active: {
        type:     Boolean,
        default:  true
    },
    baseCurrency: {
        type: mongoose.Schema.ObjectId,
        ref: 'currency'
    },
    displayCurrency: {
        type: mongoose.Schema.ObjectId,
        ref: 'currency'
    },
    currencyRate: {
        type: Number,
        default: 1
    },
    tax: {
        type: Number,
        default: 0
    },
    vat: {
        type: Number,
        default: 0
    },
    deliveryMethods: [{
        name: String,
        title: String,
        cost: Number
    }],
    paymentMethods: [{
        name: String,
        title: String
    }],
    frontendLanguage: {
        type: String,
        default: 'en'
    },
    backendLanguage: {
        type: String,
        default: 'en'
    },
    frontendTemplate: {
        type: String,
        default: 'default'
    },
    backendTemplate: {
        type: String,
        default: 'default'
    }
});

SettingSchema.statics.get = function(data, callback) {
    this.findOne(data)
        .populate('baseCurrency')
        .populate('displayCurrency')
        .exec(callback);
}

exports.schema = mongoose.model('Setting', SettingSchema);
exports.name = 'setting';