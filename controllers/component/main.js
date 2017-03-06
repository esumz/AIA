/**
 * Created by HaThao on 8/11/14.
 */
var componentManager =  require(framework.path.root('components') + '/main.js');

var routes = [
    {name: 'component_manager_page', path: framework.config['admin-route'] + '/component/index', action: 'indexAction', flags: ['authorize']},
    {name: 'component_get_content', path: '/component/get/{name}', action: 'getAction', flags: ['authorize']},
    {name: 'component_export_content', path: '/component/export/{name}', action: 'exportAction', flags: ['authorize']},
    {name: 'component_import_content', path: '/component/import', action: 'importAction', flags: ['authorize', 'xhr', 'post']},
    {name: 'component_delete', path: '/component/delete/{name}', action: 'deleteAction', flags: ['authorize', 'xhr', 'post']}
];

exports.install = function(framework) {
    global.routes = global.routes || new Array();

    routes.forEach(function(route) {
        framework.route(route.path, eval(route.action), route.flags || ['get']);
        global.routes[route.name] = route.path;
    });
}

/**
 * Manager component page
 */
function indexAction() {
    var self = this;

    componentManager.getInfo(function(err, data) {
        self.view('../../admin/component/index', {
            components: data.components
        });
    });
}

/**
 * Get component html content
 *
 * @param name
 */
function getAction(name) {
    var self = this;

    if (self.user.role !== 'ROLE_USER') {
        self.component(name, function(tpl) {
            self.plain(tpl);
        }, true);
    } else {
        self.plain('');
    }
}

/**
 * Export component
 *
 * @param name
 */
function exportAction(name) {
    var self = this;
    var zip = new admZip();
    var rootPath = self.path.root();

    zip.addLocalFolder(rootPath + '/components/' + name, null);
    zip.addLocalFolder(rootPath + '/public/assets/components/' + name, 'public');
    zip.writeZip(rootPath + '/components/' + name + '.zip');

    var stream = fs.createReadStream(rootPath + '/components/' + name + '.zip');
    self.res.setHeader('Content-type', 'application/zip');
    stream.pipe(self.res);

    // delete file after done
    stream.on('end', function() {
        fs.unlink(rootPath + '/components/' + name + '.zip');
    });
}

/**
 * Import component
 */
function importAction() {
    var self = this;
    var file = self.files[0];

    var zip = new admZip(file.path);
    var name = file.filename.split(".")[0];

    // read component info
    zip.readFileAsync('info.json', function(componentInfo) {
        if (!componentInfo) {
            self.json({
                error: true,
                message: 'Could not read your component info'
            });
            return;
        }
        componentInfo = JSON.parse(componentInfo);
        name = componentInfo.name || name;

        // check component name exist
        var globalInfo = fs.readFileSync(self.path.components() + '/info.json');
        globalInfo = JSON.parse(globalInfo);
        for (var key in globalInfo.components) {
            if (globalInfo.components[key].name == name) {
                self.json({
                    error: true,
                    message: 'Component name is already exist'
                });
                return;
            }
        }
        // extract
        var path = self.path.components() + '/' + name;
        zip.extractAllTo(path, true);
        fs.rename(path + '/public', self.path.root('public') + '/assets/components/' + name, function(err) {
            if (err) {
                self.json({
                    error: true,
                    message: 'Could not extract your component'
                });
            } else {
                globalInfo.components.push(componentInfo);
                fs.writeFile(self.path.components() + '/info.json', JSON.stringify(globalInfo), function(err) {
                    if (err) {
                        self.json({
                            error: true,
                            message: 'Could not added your component info'
                        });
                    } else {
                        self.json({
                            error: false
                        });
                    }
                });
            }
        });
    });
}

/**
 * Delete component
 *
 * @param name
 */
function deleteAction(name) {
    var self = this;

    // remove info
    var globalInfo = fs.readFileSync(self.path.components() + '/info.json');
    globalInfo = JSON.parse(globalInfo);
    for (var key in globalInfo.components) {
        if (globalInfo.components[key].name == name) {
            globalInfo.components.splice(key, 1);
        }
    }
    fs.writeFile(self.path.components() + '/info.json', JSON.stringify(globalInfo), function(err) {
        if (err) {
            self.json(false);
            return;
        } else {
            self.json(true);
            return;
        }
    });

    // remove folder
    fsExtra.remove(self.path.components(name), function(err) {});
    fsExtra.remove(self.path.root('public') + '/assets/components/' + name, function(err) {});
    self.json(true);
    return;
}