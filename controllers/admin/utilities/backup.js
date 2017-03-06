/**
 * Created by HaThao on 7/25/14.
 */


var preAdminBackupRoute = framework.config['admin-route'] + '/backup';
var routes = [
    {name: 'adBackup_download', path: preAdminBackupRoute + '/download/{filename}', action: downloadAction, flags: ['authorize'], timeout: 300000},
    {name: 'adBackup_product', path: preAdminBackupRoute + '/product', action: productAction, flags: ['authorize'], timeout: 300000},
    {name: 'adBackup_user', path: preAdminBackupRoute + '/user', action: userAction, flags: ['authorize'], timeout: 300000}
];

exports.install = function(framework) {
    global.routes = global.routes || new Array();

    routes.forEach(function(route) {
        framework.route(route.path, route.action, {flags: route.flags || ['get'], timeout: route.timeout || 10000});
        global.routes[route.name] = route.path;
    });
}


function downloadAction(filename) {
    var self = this;
    var res = self.res;

    var backupFolder = 'upload/' + self.user.id + '/backup';
    var stream = fs.createReadStream(backupFolder + '/' + filename + '.zip');
    res.setHeader('Content-type', 'application/zip');
    stream.pipe(self.res);
}

/**
 * Backup product
 */
function productAction() {
    var self = this;
    var backupFolder = self.path.root('upload') + '/' + self.user.id + '/backup';
    var file = backupFolder + '/backup_product.th';
    var stream = fs.createWriteStream(file, {flags: 'w'});

    // check exist folder first
    fsExtra.ensureDirSync(backupFolder);

    stream.once('open', function(fd) {
        MODEL('ecomProduct').schema.find({admin: self.user.id}, function(err, list) {
            if (err) {
                self.json({error: true});
            } else {
                var count = 1;
                var len = list.length;
                list.forEach(function(item) {
                    stream.write(JSON.stringify(item)+'\n');
                    if (++count > len) {
                        stream.end();
                    }
                });
            }
        });
    });
    stream.on('finish', function() {
        var zip = new admZip();
        zip.addLocalFile(file);
        zip.writeZip(backupFolder + '/backup_product.zip');
        fs.unlink(file);
        self.json({error: false, url: self.req.host + '/admin/backup/download/backup_product'});
    });
    stream.on('error', function() {
        self.json({error: true});
    });
}

/**
 * Backup user
 */
function userAction() {
    var self = this;
    var backupFolder = self.path.root('upload') + '/' + self.user.id + '/backup';
    var stream = fs.createWriteStream(backupFolder + '/backup_user.th');

    // check exist folder first
    fsExtra.ensureDirSync(backupFolder);

    stream.once('open', function(fd) {
        MODEL('user').schema.find({admin: self.user.id}, function(err, list) {
            if (err) {
                self.json({error: true});
            } else {
                var count = 1;
                var len = list.length;
                list.forEach(function(item) {
                    stream.write(JSON.stringify(item)+'\n');
                    if (++count > len) {
                        stream.end();
                    }
                });
            }
        });
    });
    stream.on('finish', function() {
        var zip = new admZip();
        zip.addLocalFile(backupFolder + '/backup_user.th');
        zip.writeZip(backupFolder + '/backup_user.zip');
        fs.unlink(backupFolder + '/backup_user.th');
        self.json({error: false, url: self.req.host + '/admin/backup/download/backup_user'});
    });
    stream.on('error', function() {
        self.json({error: true});
    });
}
