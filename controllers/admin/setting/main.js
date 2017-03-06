/**
 * Created by HaThao on 8/1/14.
 */

var routes = [
    {name: 'adSetting_page', path: framework.config['admin-route'] + '/setting/index', action: indexAction, flags: ['authorize']},
    {name: 'adSetting_save', path: framework.config['admin-route'] + '/setting/save', action: saveAction, flags: ['authorize', 'xhr', 'post']},
    {name: 'adSetting_cache', path: framework.config['admin-route'] + '/clear-cache', action: clearCache, flags: ['authorize', 'post', 'xhr']}
];

exports.install = function(framework) {
    global.routes = global.routes || new Array();

    routes.forEach(function(route) {
        framework.route(route.path, route.action, route.flags || ['get']);
        global.routes[route.name] = route.path;
    });
}

function indexAction() {
    var self = this;

    async.parallel({
        countries: function(next) {
            MODEL('country').schema.getList({}, function(err, list) {
                next(err, list);
            });
        },
        currencies: function(next) {
            MODEL('currency').schema.getList({}, function(err, list) {
                next(err, list);
            });
        }
    }, function(err, results) {
        self.view('index', results);
    });
}

/**
 * Save setting
 */
function saveAction() {
    var self = this;
    var Setting = MODEL('setting').schema;
    var Currency = MODEL('currency').schema;
    var data = self.post;
    thData.setting = null;

    async.waterfall([

        function handle(next) {
            data.active = data.active == '1' ? true : false;
            data.deliveryMethods = JSON.parse(data.deliveryMethods);
            data.paymentMethods = JSON.parse(data.paymentMethods);

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
        self.json(err ? false : true);
    });
}


/**
 * Clear cache
 */
function clearCache() {
    var self = this;
    var data = self.post;

    if (typeof data.assets !== 'undefined' && data.assets == 'on') {
        var root = self.path.root();

        fsExtra.remove(root + '/public/dist/js', function(err) {
            if (err) console.log(err);
        });

        fs.readdir(root + '/public/dist/css', function(err, files) {
            files.forEach(function(file) {
                var type = file.split('.').pop();
                if (type === 'css') {
                    fs.unlink(root + '/public/dist/css/' + file);
                }
            });
        });

        fsExtra.remove(root + '/tmp', function(err) {
            if (err) console.log(err);
        });
    }

    self.json(true);
}