/**
 * Created by HaThao on 8/9/14.
 */

var module_name = '';

exports.install = function(framework, name, directory) {
    module_name = name;
};

exports.render = function(next, design) {
    var self = this;
    thComponent.render(module_name, next, !design || false);
};