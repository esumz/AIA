/**
 * Created by thaoha on 9/16/14.
 */

var CustomerInfo = MODEL('customerInfo').schema;

var CustomerSchema = new mongoose.Schema({

    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    billingDetail: {
        type: mongoose.Schema.ObjectId,
        ref: 'CustomerInfo'
    },
    deliveryMethod: String,
    paymentMethod: String,
    creditCard: {
        type: String,
        number: Number,
        expire_month: Number,
        expire_year: Number,
        cvv2: Number
    }
});


/**
 * Methods
 */
CustomerSchema.statics.getList = function(data, callback) {
    this.find(data)
        .populate('user', 'id lastName firstName')
        .exec(callback);
}

CustomerSchema.statics.getOne = function(data, callback) {
    this.findOne(data)
        .populate('user', 'id firstName lastName avatar')
        .populate('billingDetail')
        .exec(callback);
}

exports.schema = mongoose.model('Customer', CustomerSchema);
exports.name = 'customer';