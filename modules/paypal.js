/**
 * Created by thaoha on 9/19/14.
 */

var paypal = require('paypal-rest-sdk');

var testConfig = {
    "host" : "api.sandbox.paypal.com",
    "client_id" : "ATc4iRCyP-BiWlVZfqn7wIvBGvS5gQJ0Ps2QRaTsPcvs6QTNTcGy0mUAmhdq",
    "client_secret" : "EJN4fxD2WlcC9ICMIxawKHl-MnyAc57LQXz4QHgpIoQ_MMO3lVaj-j35lk5N"
};

var config = {
    "host" : "api.paypal.com",
    "client_id" : "ATc4iRCyP-BiWlVZfqn7wIvBGvS5gQJ0Ps2QRaTsPcvs6QTNTcGy0mUAmhdq",
    "client_secret" : "EJN4fxD2WlcC9ICMIxawKHl-MnyAc57LQXz4QHgpIoQ_MMO3lVaj-j35lk5N"
};

/**
 * Create payment
 */
exports.paymentCreate = function(order, next) {

    var paypalPayment = {
        "intent": "sale",
        "payer": {
            "payment_method": "paypal"
        },
        "redirect_urls": {
            "return_url": "http://localhost:3000" + "/pay-pal/callback?orderAction=execute&orderId=" + order.id,
            "cancel_url": "http://localhost:3000" + "/pay-pal/callback?orderAction=cancel&orderId=" + order.id
        },
        "transactions": [{
            "amount": {
                "currency": order.dataPrice['currency'],
                "total": order.dataPrice['total']
            },
            "description": "Pay for " + order.items.length + ' products'
        }]
    };

    paypal.payment.create(paypalPayment, testConfig, function (err, payment) {
        if (payment) {
            order.paypalPayment['id'] = payment.id;
            order.paypalPayment['state'] = order.status = payment.state;
            order.save();
        }
        next(err, payment);
    });
}

/**
 * Execute payment
 *
 * @param next
 */
exports.paymentExecute = function(order, payerId, next) {
    var payer = { payer_id : payerId };
    paypal.payment.execute(order.paypalPayment['id'], payer, testConfig, function (err, payment) {
        if (payment) {
            order.paypalPayment['state'] = order.status = payment.state;
            order.save();
        }
        next(err, payment);
    });
}