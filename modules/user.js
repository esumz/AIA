/**
 * Created by HaThao on 7/8/14.
 */

var User = MODEL('user').schema;

exports.install = function(framework) {

}

/**
 * Check login
 *
 * @param data
 * @param callback
 */
exports.checkLogin = function(data, callback) {
    data.password = framework.hash('sha256', data.password);

    User.getOne(data, callback);
}

/**
 * Generate password
 *
 * @param password
 * @returns {{hashCode: string, password: string}}
 */
exports.generatePassword = function(password) {
    password = framework.hash('sha256', password);

    return password;
}

/**
 * Create new user
 *
 * @param data
 * @param next
 */
exports.createNew = function(data, next) {

    if (data.password !== data.confirmPassword) {
        next(true, null);

    } else {
        data.password = framework.hash('sha256', data.password);

        User.getOne({email: data.email}, function(err, user) {
            if (!utils.isEmpty(user)) {
                next(true, null);

            } else {
                var newUser = new User({
                    firstName: data.firstName,
                    lastName: data.lastName,
                    email: data.email,
                    password: data.password,
                    group: data.group || null,
                    isActive: data.isActive || true
                });
                newUser.save(function(err) {
                    next(err, newUser);
                });
            }
        });
    }
}

/**
 * Update user
 *
 * @param data
 * @param callback
 */
exports.updateInfo = function(data, next) {

    // check pass first
    User.update({_id: data.id || null}, data, {multi: false}, next);
}
