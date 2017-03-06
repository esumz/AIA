/**
 * Created by thaoha on 9/16/14.
 */
var Customer = MODEL('customer').schema;
var Product = MODEL('ecomProduct').schema;
var CustomerInfo = MODEL('customerInfo').schema;

var OrderSchema = new mongoose.Schema({

    customer: {
        type: mongoose.Schema.ObjectId,
        ref: 'Customer',
        required: true
    },
    items: [{
        product: {
            type: mongoose.Schema.ObjectId,
            ref: 'ecomProduct'
        },
        quantity: {
            type: Number,
            required: true
        }
    }],
    billingDetail: {
        type: mongoose.Schema.ObjectId,
        ref: 'CustomerInfo'
    },
    deliveryDetail: {
        type: mongoose.Schema.ObjectId,
        ref: 'CustomerInfo'
    },
    deliveryMethod: {
        name: String,
        comment: String
    },
    paymentMethod: {
        name: String,
        comment: String
    },
    created: {
        type:       Date,
        default:    Date.now
    },
    modified: {
        type:       Date,
        default:    Date.now
    },
    status: {
        type: String,
        default: 'pending'
    },
    dataPrice: {
        currency: String,
        subTotal: Number,
        shippingCost: Number,
        tax: Number,
        vat: Number,
        total: Number
    },
    paypalPayment: {
        id: String,
        state: String
    }
});

/**
 * Methods
 */
OrderSchema.statics.getList = function(data, limit, page, callback) {
    var query = this.find();

    if (typeof data.status != 'undefined') {
        query = query.where('status').equals(data.status);
    }
    query.populate('customer', 'id')
        .populate('billingDetail')
        .populate('deliveryDetail')
        .skip(limit*(page-1))
        .sort({created: -1})
        .limit(limit)
        .exec(callback);
}

OrderSchema.statics.getOne = function(data, callback) {
    this.findOne(data)
        .populate('billingDetail', 'firstName lastName address country')
        .populate('deliveryDetail')
        .populate('customer')
        .exec(callback);
}

exports.schema = mongoose.model('Order', OrderSchema);
exports.name = 'order';