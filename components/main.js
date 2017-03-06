/**
 * Created by HaThao on 8/12/14.
 */

var fs = require('fs');

exports.install = function(framework) {
    framework.route('/component/assets/{fileName}');
};

/**
 * Get component info
 * Return Object
 */
exports.getInfo = function(callback) {
    var file = __dirname + '/info.json';
    fs.readFile(file, 'utf8', function(err, data) {
        callback(err, JSON.parse(data));
    });
};

/**
 * Add component
 *
 * @param name
 */
exports.addComponent = function(name) {

};

/**
 * Remove component
 *
 * @param name
 */
exports.removeComponent = function(name) {

};

/**
 * Render view of component
 *
 * @param moduleName
 * @param next
 * @param data
 */
exports.render = function(moduleName, next, data) {
    var self = this;
    var path = framework.path.components(moduleName) ;

    if (typeof data === 'undefined' || !data) {
        fs.readFile(path + '/demo.json', 'utf8', function(err, dataDemo) {
            if (typeof dataDemo !== 'undefined') {
                dataDemo = JSON.parse(dataDemo);
            }
            var tpl = swig.renderFile(path + '/index.html', {
                data: dataDemo
            });
            next(tpl);
        });
    } else {
        var tpl = swig.renderFile(path + '/index.html', {
            data: data
        });
        next(tpl);
    }
};


