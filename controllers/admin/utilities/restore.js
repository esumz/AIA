/**
 * Created by HaThao on 7/25/14.
 */

var preAdminRestoreRoute = framework.config['admin-route'] + '/restore';
var routes = [
    {name: 'adRestore_product', path: preAdminRestoreRoute + '/product', action: productAction, flags: ['authorize'], timeout: 300000},
    {name: 'adRestore_user', path: preAdminRestoreRoute + '/user', action: userAction, flags: ['authorize'], timeout: 300000}
];

exports.install = function(framework) {
    global.routes = global.routes || new Array();

    routes.forEach(function(route) {
        framework.route(route.path, route.action, {flags: route.flags || ['get'], timeout: route.timeout || 10000});
        global.routes[route.name] = route.path;
    });
}

/**
 * Restore product
 */
function productAction() {
    var self = this;
    var backupFolder = 'upload/' + self.user.id + '/backup';
    var zip = new admZip(backupFolder + '/backup_product.zip');
    var Product = MODEL('ecomProduct').schema;

    // extract file backup and remove all old document
    zip.extractAllTo(backupFolder, true);
    var list = fs.readFileSync(backupFolder + '/backup_product.th').toString().split("\n");
    Product.remove().exec();

    // insert document
    list.forEach(function(item) {
        if (item != '') {
            new Product(JSON.parse(item)).save();
        }
    });
    fs.unlink(backupFolder + '/backup_product.th');
    self.json(true);
}

/**
 * Restore user
 */
function userAction() {
    var self = this;
    var backupFolder = 'upload/' + self.user.id + '/backup';
    var zip = new admZip(backupFolder + '/backup_user.zip');
    var User = MODEL('user').schema;

    // extract file backup and remove all old document
    zip.extractAllTo(backupFolder, true);
    var list = fs.readFileSync(backupFolder + '/backup_user.th').toString().split("\n");
    User.remove().exec();

    // insert document
    list.forEach(function(item) {
        if (item != '') {
            new User(JSON.parse(item)).save();
        }
    });
    fs.unlink(backupFolder + '/backup_user.th');
    self.json(true);
}