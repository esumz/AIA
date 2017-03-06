/**
 * Created by thaoha on 9/23/14.
 */

var fs = require('fs');

exports.install = function(framework) {

    framework.route('/install', oneAction);
    framework.route('/install', oneAction, ['post']);

    framework.route('/install/step-two', twoAction, ['post']);

    framework.route('/system/usage/', plainUsage);
    framework.route('/create-demo/user', createUserDemo, { flags: ['authorize'], timeout: 100000 });
    framework.route('/create-demo/product', createProductDemo, { flags: ['authorize'], timeout: 100000 });
};

function oneAction() {
    var self = this;
    var Setting = MODEL('setting').schema;
    var Country = MODEL('country').schema;
    var Currency = MODEL('currency').schema;
    var Region = MODEL('region').schema;
    var path = self.path.root('db');

    if (self.req.method !== 'POST') {
        mongoose.connection.db.dropDatabase(function(err) {
            async.parallel({
                countries: function(next) {

                    fs.readFile(path + '/country.json', function(err, data) {
                        data = JSON.parse(data);
                        async.each(data, function(country, fn) {
                            new Country(country).save(function(err) {
                                fn(err);
                            });

                        }, function(err) {
                            next(err, data);
                        });
                    });
                },
                currencies: function(next) {

                    fs.readFile(path + '/currency.json', function(err, data) {
                        data = JSON.parse(data);
                        async.each(data, function(currency, fn) {
                            new Currency(currency).save(function(err) {
                                fn(err);
                            });

                        }, function(err) {
                            next(err, data);
                        });
                    });
                },
                regions: function(next) {

                    fs.readFile(path + '/region.json', function(err, data) {
                        data = JSON.parse(data);
                        async.each(data, function(region, fn) {
                            new Region(region).save(function(err) {
                                fn(err);
                            });

                        }, function(err) {
                            next(err, data);
                        });
                    });
                }
            }, function(err, results) {
                self.view('stepOne', {
                    currencies: results.currencies
                });
            });
        });
    } else {
        var data = self.post;

        async.waterfall([
            function handle(next) {
                Currency.getOne({code: data.baseCurrency || null}, function(err, baseCurrency) {
                    if (err) {
                        next(err, data);
                    } else {
                        Currency.getOne({code: data.displayCurrency || null}, function(errr, displayCurrency) {
                            data.baseCurrency = baseCurrency;
                            data.displayCurrency = displayCurrency;
                            next(errr, data);
                        });
                    }
                });
            },
            function save(settingData, next) {
                Setting.update({}, settingData, {multi: false}, function(err, numAffected) {
                    if (err) {
                        next(err);
                    } else {
                        if (numAffected <= 0) {
                            new Setting(data).save(function(er) {
                                next(er);
                            });
                        } else {
                            next(null);
                        }
                    }
                });
            }
        ], function(err) {
            if (err) {
                self.view('stepOne', {
                    message: {
                        type: 'danger',
                        content: 'Have something wrong. Please try again!'
                    }
                });
            } else {
                self.view('stepTwo');
            }
        });
    }
}

function twoAction() {
    var self = this;
    var User = MODEL('user').schema;
    var data = self.post;

    async.parallel({
        createAdmin: function(next) {
            new User({
                firstName: data.firstName || 'Tommy',
                lastName: data.lastName || 'Ha',
                role: 'ROLE_ADMIN',
                email: data.email || 'thaohv@netbase.vn',
                password: framework.hash('sha256', data.password || '123'),
                isActive: true

            }).save(function(err) {
                next(err, true);
            });
        }
    }, function(err, results) {

        self.redirect('/');
    });
}

//====================================================//

function plainUsage() {
    var self = this;
    self.json(framework.usage(true));
}

function createUserDemo() {
    var self = this;
    var User = MODEL('user').schema;
    var numberOfUser = self.get.n || 10000;

    while (numberOfUser--) {
        new User({
            firstName: 'User',
            lastName: 'No. '+numberOfUser,
            role: 'ROLE_USER',
            email: 'UserNo'+numberOfUser+'@netbase.vn',
            password: framework.hash('sha256', '123'),
            isActive: true
        }).save();
    }
    self.json('Check in database');
}

function createProductDemo() {
    var self = this;
    var Product = MODEL('ecomProduct').schema;
    var Catalog = MODEL('ecomCatalog').schema;
    var numberOfProduct = self.get.n || 10000;

    async.waterfall([
        function initCatalogs(next) {
            var catalogs = new Array();
            var list = ['Mens', 'Kids', 'Ladies', 'Sports', 'Electronics', 'Accessories', 'Brands'];

            async.each(list, function(name, fn) {
                var catalog = new Catalog({
                    name: name,
                    alias: name.toLowerCase()
                });
                catalog.save(function(err) {
                    if (!err)
                        catalogs.push(catalog);
                    fn(err);
                })
            }, function(err) {
                next(err, catalogs);
            });
        },
        function initProducts(catalogs, next) {

            while (numberOfProduct--) {
                new Product({
                    name: 'Product No.'+numberOfProduct,
                    alias: 'product-no-'+numberOfProduct,
                    description: 'Lorem ipsum dolor ut sit ame dolore adipiscing elit, sed nonumy nibh sed euismod laoreet dolore magna aliquarm erat volutpat Nostrud duis molestie at dolore.',
                    price: 76.93 + Math.floor((Math.random() * 100) + 1),
                    user: self.user.id,
                    numberOfView:  Math.floor((Math.random() * 1000) + 1),
                    numberOfBuy:  Math.floor((Math.random() * 100) + 1),
                    published: true,
                    catalog: catalogs[Math.floor(Math.random() * 7)]
                }).save();
            }
            next(null, true);
        }
    ], function(err, results) {
        self.json({
            err: err,
            results: results
        });
    });
}