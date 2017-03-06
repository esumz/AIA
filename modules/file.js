/**
 * Created by HaThao on 7/12/14.
 */

exports.getAllFile = function(user, folder, callback) {
    framework.filestorage(user.id  + '/' + folder).listing(function(err, arr) {
        var files = [];
        arr.forEach(function(directory) {
            directory.split('\n').forEach(function(file) {
                if (file != '') {
                    try {
                        var parsedFile = JSON.parse(file);
                        files.push(parsedFile);
                    } catch (ex) {}
                }
            });
        });
        callback(err, files);
    });
}

/**
 * Get all folder of user
 *
 * @param user
 * @param callback
 */
exports.getAllFolder = function(user, callback) {
    var path = framework.path.root('upload') + '/' + user.id;

    if (!fs.existsSync(path)) {
        fs.mkdir(path, function() {
            callback(null);
        });
    } else {
        fs.readdir(path, function (err, files) {
            if (err) {
                callback(null);
            } else {
                callback(files);
            }
        });
    }
}

/**
 * Upload file
 *
 * @param user
 * @param file
 * @param callback
 */
exports.upload = function(user, file, folder, isImage, callback) {
    isImage = (typeof isImage === 'boolean') ? isImage : false;
    checkValid(file, isImage);

    var path = framework.path.root('upload') + '/' + user.id + '/' + folder;
    fsExtra.ensureDir(path, function(err) {
        framework.filestorage(user.id + '/' + folder).insert(file.filename, file.path, callback);
    });
}

/**
 * Remove file
 *
 * @param user
 * @param folder
 * @param filesId
 */
exports.remove = function(user, folder, ids, next) {
    var removedList = new Array();

    async.each(ids, function(id, fn) {
        framework.filestorage(user.id + '/' + folder).remove(id, function(er) {
            if (!er) {
                removedList.push(id);
            }
            fn(er);
        }, 'remove file [' + id + '] in folder [' + folder + ']');

    }, function(err) {
        next(err, removedList);
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
exports.fileHandle = function(req, res, isValidation) {
    var self = this;

    if (isValidation)
        return req.url.indexOf('/uploads/') !== -1;

    var url = req.url.split("/");
    var data = {
        id: (url[url.length - 1].match(/\d+/) || '').toString().parseInt(),
        folder: url[url.length - 2],
        user: url[url.length - 3]
    }
    if (data.id === 0) {
        self.response404(req, res);
        return false;
    }
    self.filestorage(data.user + '/' + data.folder).pipe(data.id, req, res);
}

/**
 * Check file valid
 *
 * @param file
 * @param arrExtension | array
 * @param size | byte
 */
var checkValid = exports.checkValid = function(file, isImage) {

    var sFileName = file.filename;
    var sFileExtension = sFileName.split('.')[sFileName.split('.').length - 1].toLowerCase();
    var iFileSize = file.size;
    isImage = (typeof isImage === 'boolean') ? isImage : false;

    // get config
    var arrExtension = isImage ? framework.config['image-extension-accept'] : framework.config['file-extension-accept'];
    var maxSize = isImage ? framework.config['max-image-upload'] : framework.config['max-file-upload'];

    maxSize = maxSize.toString().parseInt() || 10000;
    arrExtension = (arrExtension == 'all') ? 'all' : arrExtension.split(",");

    if (iFileSize > maxSize) {
        return false;
    }
    if (arrExtension != 'all' && arrExtension.indexOf(sFileExtension) < 0) {
        return false;
    }
    return true;
}
