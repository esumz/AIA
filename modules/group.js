/**
 * Created by HaThao on 7/8/14.
 */

exports.install = function(framework) {
    var User = framework.model('user');
}

/**
 * Find groups
 *
 * @param data
 * @param callback
 */
exports.find = function(data, callback) {
    framework.model('group')
        .find(data)
        .populate('admin')
        .exec(callback);
}

/**
 * Find one group
 *
 * @param data
 * @param callback
 */
exports.findOne = function(data, callback) {
    framework.model('group')
        .find(data)
        .populate('admin')
        .exec(callback);
}

/**
 * Update group
 *
 * @param data
 * @param callback
 */
exports.update = function(id, data, callback) {
    framework.model('group').update({_id: id}, data, callback);
}