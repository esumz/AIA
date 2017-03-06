/**
 * Created by HaThao on 7/21/14.
 */

var routes = [
    {name: 'product_checkout', path: '/checkout', action: checkoutAction},
    {name: 'product_checkout', path: '/checkout', action: checkoutAction, flags: ['post', 'xhr']},
    {name: 'product_order', path: '/order', action: orderAction, flags: ['post', 'xhr']},
    {name: 'paypal_callback', path: '/pay-pal/callback', action: paypalAction},
    {name: 'cart_view', path: '/view-cart', action: viewCartAction},
    {name: 'wish_list', path: '/wish-list', action: wishListAction}
];

exports.install = function(framework) {
    global.routes = global.routes || new Array();

    routes.forEach(function(route) {
        framework.route(route.path, route.action, route.flags || ['get']);
        global.routes[route.name] = route.path;
    });
}

/**
 * View cart
 */
function viewCartAction() {
    var self = this;

    self.view('~/home/'+thData.setting['frontendTemplate']+'/eCommerce/order/cart');
}

/**
 * Checkout action
 */
function checkoutAction() {
    var self = this;
    var Customer = MODEL('customer').schema;
    var Country = MODEL('country').schema;
    var Setting = MODEL('setting').schema;
    var Product = MODEL('ecomProduct').schema;

    if (!self.xhr) {
        Customer.getOne({user: self.user}, function(err, customer) {
            Country.getList({}, function(err, countries) {
                self.view('~/home/'+thData.setting['frontendTemplate']+'/eCommerce/order/checkout', {
                    customer: customer,
                    countries: countries
                });
            });
        });
    } else {
        var cartData = JSON.parse(self.post.cartData);
        var ids = [];
        var qtyInfo = [];
        for (var key in cartData) {
            ids.push(key);
            qtyInfo[key] = cartData[key].quantity;
        }
        async.waterfall([
            function setting(next) {
                Setting.get(function(err, setting) {
                    next(err, setting);
                });
            },
            function products(setting, next) {
                Product.getList({ids: ids}, 100, 1, function(err, list) {
                    next(err, setting, list);
                });
            },
            function(setting, products, next) {
                var shippingCost = 0;
                setting.deliveryMethods.forEach(function(method) {
                    if (method.name == self.post.deliveryMethod) {
                        shippingCost = method.cost;
                    }
                });
                var tax = setting.tax || 0
                ,   vat = setting.vat || 0
                ,   subTotal = 0
                ,   total = 0;

                products.forEach(function(pr) {
                    subTotal += (pr.price * qtyInfo[pr.id]);
                });
                subTotal *= setting.currencyRate;
                vat = Math.floor(vat * subTotal * 100) / 100;
                tax = Math.floor(tax * subTotal * 100) / 100;
                subTotal = Math.floor(subTotal * 100) / 100;
                total += subTotal + shippingCost + tax + vat;
                total = Math.floor(total * 100) / 100;

                next(null, {
                    products: products,
                    shippingCost: shippingCost,
                    tax: tax,
                    vat: vat,
                    subTotal: subTotal,
                    total: total,
                    setting: setting
                });
            }
        ], function(err, results) {
            results.qtyInfo = qtyInfo;
            self.view('~/home/'+thData.setting['frontendTemplate']+'/eCommerce/order/checkoutConfirm', results);
        });
    }
}

/**
 * Wish list action
 */
function wishListAction() {
    var self = this;

    self.view('wishlist');
}

/**
 * Create order
 */
function orderAction() {
    var self = this;
    var User = MODEL('user').schema;
    var CustomerInfo = MODEL('customerInfo').schema;
    var Customer = MODEL('customer').schema;
    var Order = MODEL('order').schema;
    var Product = MODEL('ecomProduct').schema;
    var Setting = MODEL('setting').schema;
    var data = self.post;
    var ids = [];
    var systemSetting = {};

    for (var key in data) {
        data[key] = JSON.parse(data[key]);
    }
    for (var key in data.cartData) {
        ids.push(key);
    }
    async.waterfall([

        function setting(next) {
            Setting.get(function(err, setting) {
                systemSetting = setting;
                next(err);
            });
        },
        function user(next) {
            if (self.user) {
                next(null, self.user);

            } else if (data.account == 'register'){
                var newUser = new User({
                    firstName:      data.billingDetail['firstName'],
                    lastName:       data.billingDetail['lastName'],
                    email:          data.billingDetail['email'],
                    mobileNumber:   data.billingDetail['telephone'],
                    address:        data.billingDetail['address1'],
                    password:       data.billingDetail['password']
                });
                newUser.save(function(err) {
                    next(err, newUser);
                });
            }
        },
        function customerInfo(user, next) {
            var billingDetail = new CustomerInfo(data.billingDetail);

            billingDetail.save(function(err) {
                if (err) {
                    next(err, null);

                } else if (data.deliveryDetail == 'billingDetail') {
                    next(err, user, {
                        billingDetail: billingDetail,
                        deliveryDetail: billingDetail
                    });
                } else {
                    var deliveryDetail = new CustomerInfo(data.deliveryDetail);

                    deliveryDetail.save(function(err) {
                        next(err, user, {
                            billingDetail: billingDetail,
                            deliveryDetail: deliveryDetail
                        });
                    });
                }
            });
        },
        function customer(user, customerInfo, next) {

            Customer.getOne({user: user}, function(err, customer) {
                if (err || !customer) {
                    var customer = new Customer({
                        user: user
                    });
                }
                customer.billingDetail = customerInfo.billingDetail;
                customer.deliveryMethod = data.deliveryMethod['name'];
                customer.paymentMethod = data.paymentMethod['name'];
                customer.save(function(err) {
                    next(err, customer, customerInfo);
                });
            });
        },
        function product(customer, customerInfo, next) {
            var items = [];
            var dataPrice = {
                currency: systemSetting.baseCurrency['code'],
                shippingCost: 0,
                tax: systemSetting.tax || 0,
                vat: systemSetting.vat || 0,
                subTotal: 0,
                total: 0
            };
            systemSetting.deliveryMethods.forEach(function(method) {
                if (method.name == data.deliveryMethod['name']) {
                    dataPrice.shippingCost = method.cost;
                }
            });
            Product.getList({ids: ids}, 100, 1, function(err, list) {
                if (!err) {
                    list.forEach(function(product) {
                        items.push({
                            product: product,
                            quantity: data.cartData[product.id].quantity
                        });
                        dataPrice.subTotal += (product.price * data.cartData[product.id].quantity);
                    });
                    dataPrice.subTotal = dataPrice.subTotal * systemSetting.currencyRate;
                    dataPrice.vat = Math.floor(dataPrice.vat * dataPrice.subTotal * 100) / 100;
                    dataPrice.tax = Math.floor(dataPrice.tax * dataPrice.subTotal * 100) / 100;
                    dataPrice.subTotal = Math.floor(dataPrice.subTotal * 100) / 100;
                    dataPrice.total += dataPrice.subTotal + dataPrice.shippingCost + dataPrice.tax + dataPrice.vat;
                    dataPrice.total = Math.floor(dataPrice.total * 100) / 100;
                }
                next(err, customer, customerInfo, items, dataPrice);
            });
        },
        function order(customer, customerInfo, items, dataPrice, next) {

            var newOrder = new Order({
                customer: customer,
                items: items,
                billingDetail: customerInfo.billingDetail,
                deliveryDetail: customerInfo.deliveryDetail,
                deliveryMethod: data.deliveryMethod,
                paymentMethod: data.paymentMethod,
                dataPrice: dataPrice
            });
            newOrder.save(function(err) {
                if (data.paymentMethod['name'] == 'paypal') {
                    self.module('paypal').paymentCreate(newOrder, function(err, payment) {
                        if (payment) {
                            var link = payment.links;
                            for (var i = 0; i < link.length; i++) {
                                if (link[i].rel === 'approval_url') {
                                    next(err, link[i].href);
                                }
                            }
                        } else {
                            next(err, '/');
                        }
                    });
                } else {
                    next(err, '/');
                }
            });
        }
    ], function(err, url) {
        self.json({
            success: err ? false : true,
            url: url
        });
    });
}

/**
 * Paypal action
 */
function paypalAction() {
    var self = this;
    var Order = MODEL('order').schema;
    var action = self.get['orderAction'] || null;
    var orderId = self.get['orderId'] || null;
    var payerId = self.get['PayerID'] || null;

    Order.getOne({_id: orderId}, function(err, order) {
        if (err) {
            self.redirect('/');
            return;
        }
        switch (action) {
            case 'execute':
                self.module('paypal').paymentExecute(order, payerId, function(err, payment) {

                });
                break;
            case 'cancel':
                order.status = order.paypalPayment['state'] = 'cancel';
                order.save();
                break;
            default:
                break;
        }
    });

    self.redirect('/');
}