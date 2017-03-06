var dbPort 		= framework.config['db-port'];
var dbHost 		= framework.config['db-host'];
var dbName 		= framework.config['db-name'];
var dbUsername  = framework.config['db-username'];
var dbPassword  = framework.config['db-password'];

framework.on('load', function() {
    var self = this;

    /**
     * Mongoose
     * @type {*}
     */
    mongoose.connect('mongodb://' + dbUsername + ':' + dbPassword + '@' + dbHost + ':' + dbPort + '/' + dbName);

    mongoose.connection.on('open', function (ref) {
        console.log('open connection to mongo server.');
    });

    mongoose.connection.on('connected', function (ref) {
        console.log('connected to mongo server.');

        if (typeof global.thData === 'undefined') {
            global.thData = {
                setting: null,
                menus: null,
                catalogs: null,
                categories: null,
                user: null
            };
        }
        if (!thData.setting) {
            var Setting = MODEL('setting').schema;
            Setting.get(function (err, setting) {
                thData.setting = setting;
            });
        }

        // get language
        var transFolder = framework.path.root('translator');

        global.translations = {
            frontend: {},
            backend: {}
        };
        fs.readdir(transFolder + '/frontend', function (err, files) {
            if (!err) {
                files.forEach(function (name) {
                    fsExtra.readJson(transFolder + '/frontend/' + name, function (err, data) {
                        if (err) return;
                        try {
                            translations.frontend[name.split('.')[0]] = data;
                        } catch (ex) {}
                    });
                });
            }
        });
        fs.readdir(transFolder + '/backend', function (err, files) {
            if (!err) {
                files.forEach(function (name) {
                    fsExtra.readJson(transFolder + '/backend/' + name, function (err, data) {
                        if (err) return;
                        try {
                            translations.backend[name.split('.')[0]] = data;
                        } catch (ex) {}
                    });
                });
            }
        });
    });

    mongoose.connection.on('disconnected', function (ref) {
        console.log('disconnected from mongo server.');
    });

    mongoose.connection.on('close', function (ref) {
        console.log('close connection to mongo server');
    });

    mongoose.connection.on('error', function (err) {
        console.log('error connection to mongo server!');
        framework.log('[ error connection to mongo server ] ' + err);
    });

    mongoose.connection.db.on('reconnect', function (ref) {
        console.log('reconnect to mongo server.');
    });

    /**
     * Authorization
     */
    var auth = self.module('authorization');
    var User = MODEL('user').schema;

    auth.onAuthorization = function (id, callback) {

        User.findOne({_id: id}, function (err, user) {
            if (!err && !utils.isEmpty(user)) {
                callback(user);
            } else {
                callback(null);
            }
        });
        // this is cached
        // read user information from database
        // into callback insert the user object (this object is saved to session/cache)
        // this is an example

        // if user not exist then
        // callback(null);
    };

    // social login
    var verifyHandler = function (token, tokenSecret, profile, done) {
        process.nextTick(function () {

            User.getOne({uid: profile.id}, function (err, user) {
                if (user) {
                    return done(null, user);
                } else {
                    var data = {
                        provider: profile.provider,
                        uid: profile.id,
                        name: profile.displayName
                    };
                    if (profile.emails && profile.emails[0] && profile.emails[0].value) {
                        data.email = profile.emails[0].value;
                    }
                    if (profile.name && profile.name.givenName) {
                        data.firstName = profile.name.givenName;
                    }
                    if (profile.name && profile.name.familyName) {
                        data.lastName = profile.name.familyName;
                    }
                    var newUser = new User(data);
                    newUser.save(function (err) {
                        return done(err, newUser);
                    });
                }
            });
        });
    };

    passport.use(new facebookStrategy({
            clientID: '262019430661077',
            clientSecret: '675c8a48d70e9d2382281260d72c097d',
            callbackURL: 'http://localhost:3000/auth/facebook/callback'
        },
        verifyHandler
    ));

//    passport.use(new googleStrategy({
//            clientID: '201701044825.apps.googleusercontent.com',
//            clientSecret: '0wC_1qWHDwYwYH_2mMb6K1yO',
//            callbackURL: 'http://localhost:1337/auth/google/callback'
//        },
//        verifyHandler
//    ));

    global.passport = passport;
});

