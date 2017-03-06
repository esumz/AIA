/**
 * Created by HaThao on 8/9/14.
 */

var module_name = '';

exports.install = function(framework, name, directory) {
    module_name = name;
};

exports.render = function(next, design) {
    var self = this;

    if (typeof design == 'boolean' && design) {
        thComponent.render(module_name, next);
    } else {
        framework.model('ecomProduct').getList({admin: self.user.id}, 10, 1, function(err, list) {
            thComponent.render(module_name, next, list);
        });
    }
};