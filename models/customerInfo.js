/**
 * Created by thaoha on 9/16/14.
 */

var CustomerInfoSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    telephone: {
        type: String,
        required: true
    },
    fax: String,
    company: String,
    address1: String,
    address2: String,
    city: {
        type: String,
        required: true
    },
    postCode: {
        type: Number,
        required: true
    },
    country: {
        type: String,
        required: true
    },
    state: String
});

exports.schema = mongoose.model('CustomerInfo', CustomerInfoSchema);
exports.name = 'customerInfo';