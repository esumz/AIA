/**
 * Created by HaThao on 7/18/14.
 */

var preAdminFileRoute = framework.config['admin-route'] + '/file';
var routes = [
    {name: 'upload_file', path: '/upload-small-file', action: uploadSmallFile, flags: ['authorize', 'xhr', 'post']},
    {name: 'adFile_manager', path: preAdminFileRoute + '/manager', action: indexAction, flags: ['authorize']},
    {name: 'adFolder_view', path: preAdminFileRoute + '/folder-view/{folder}', action: folderView, flags: ['authorize', 'xhr', 'post']},
    {name: 'adFile_delete', path: preAdminFileRoute + '/delete/{type}', action: fileDelete, flags: ['authorize', 'xhr', 'post']},
    {name: 'adFolder_create', path: preAdminFileRoute + '/create-folder/{name}', action: folderCreate, flags: ['authorize', 'xhr', 'post']}
];

exports.install = function(framework) {
    global.routes = global.routes || new Array();

    routes.forEach(function(route) {
        framework.route(route.path, route.action, route.flags || ['get']);
        global.routes[route.name] = route.path;
    });
    framework.file('File handler', fileHandle);
}

/**
 * File manager
 */
function indexAction() {
    var self = this;

    self.module('file').getAllFolder(self.user, function(listFolder) {
        self.view('index', {
            folders: listFolder,
            currentUser: self.user
        });
    });
}

/**
 * View folder
 *
 * @param folder
 */
function folderView(folder) {
    var self = this;

    self.module('file').getAllFile(self.user, folder, function(err, listFile) {
        self.view('list', {
            folder: folder,
            files: listFile,
            currentUser: self.user
        });
    });
}

/**
 * Upload small file
 */
function uploadSmallFile() {
    var self = this;
    var user = self.user;
    var fileUpload = self.files[0];
    var folder = self.post.folder || 'privacy';

    self.module('file').upload(user, fileUpload, folder, false, function(err, id, stat) {
        if (err) {
            self.json(false);
        } else {
            var urlImage = user.id + '/' + folder + '/' + id +'.' + stat.extension;
            self.json(urlImage);
        }
    });
}

/**
 * Delete file | [1,2,3,4]
 */
function fileDelete(type) {
    var self = this;
    var data = self.post;
    var ids = data.files.split(",");
    type = type || 'file';

    if (type == 'file') {
        self.module('file').remove(self.user, data.folder || 'privacy', ids, function(err, list) {
            self.json(true);
        });

    } else if (type == 'folder') {
        self.json(true);

    } else {
        self.json(false);
    }
}

/**
 * Create folder
 *
 * @param name
 */
function folderCreate(name) {
    var self = this;
    var path = framework.path.root('upload') + '/' + self.user.id + '/' + name;

    fsExtra.ensureDir(path, function(err) {
        if (err) {
            self.json(false);
        } else {
            self.json(true);
        }
    });
}

/**
 * Handle file from url
 *
 * @param req
 * @param res
 * @param isValidation
 * @returns {boolean}
 */
function fileHandle(req, res, isValidation) {
    var self = this;

    if (isValidation)
        return req.url.indexOf('/uploads/') !== -1;

    var url = req.url.split("/");
    var data = {
        id: (url[url.length - 1].match(/\d+/) || '').toString().parseInt(),
        folder: url[url.length - 2],
        user: url[url.length - 3]
    };
    if (data.id === 0) {
        self.response404(req, res);
        return false;
    }
    self.filestorage(data.user + '/' + data.folder).pipe(data.id, req, res);
}