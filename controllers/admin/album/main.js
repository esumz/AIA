/**
 * Created by thaoha on 8/27/14.
 */

var preAdminAlbumRoute = framework.config['admin-route'] + '/album';
var routes = [
    {name: 'adAlbum_list', path: preAdminAlbumRoute + '/list', action: indexAction, flags: ['authorize', 'get']},
    {name: 'adAlbum_list', path: preAdminAlbumRoute + '/list', action: indexAction, flags: ['authorize', 'xhr', 'post']},
    {name: 'adAlbum_search', path: preAdminAlbumRoute + '/search', action: searchAction, flags: ['authorize', 'xhr', 'post']},
    {name: 'adAlbum_create', path: preAdminAlbumRoute + '/create', action: addAction, flags: ['authorize', 'get']},
    {name: 'adAlbum_create', path: preAdminAlbumRoute + '/create', action: addAction, flags: ['authorize', 'xhr', 'post']},
    {name: 'adAlbum_update', path: preAdminAlbumRoute + '/update/{id}', action: updateAction, flags: ['authorize', 'xhr', 'post']},
    {name: 'adAlbum_delete', path: preAdminAlbumRoute + '/delete/{id}', action: deleteAction, flags: ['authorize', 'xhr', 'post']}
];

exports.install = function(framework) {
    global.routes = global.routes || new Array();

    routes.forEach(function(route) {
        framework.route(route.path, route.action, route.flags || ['get']);
        global.routes[route.name] = route.path;
    });
}

/**
 * Album manager index
 */
function indexAction() {
    var self = this;
    var dataFilter = self.post;
    var Album = MODEL('album').schema;
    var view = '../index';
    var data = {
        user: self.user
    }
    if (self.xhr) {
        view = '../list';
        if (dataFilter.name != '') {
            data.name = dataFilter.name;
        }
        if (dataFilter.published != 'all') {
            data.published = dataFilter.published == 1 ? true : false;
        }
    }
    Album.getList(data, 50, dataFilter.page || 1, function(err, listAlbum) {
        self.view(view, {
            albums: listAlbum
        });
    });
}

/**
 * Search album
 *
 * @param keyword
 */
function searchAction() {
    var self = this;
    var Album = MODEL('album').schema;
    var data = {
        name: self.post.keyword
    }
    Album.getList(data, 10, 1, function(err, listAlbum) {
        self.json({
            albums: listAlbum
        });
    });
}
/**
 * Album add
 */
function addAction() {
    var self = this;
    var data = self.post;
    var Album = MODEL('album').schema;

    data.published = (data.published == '1') ? true : false;
    data.user = self.user;

    if (!self.xhr) {
        self.view('../create');
    } else {
        var album = new Album(data);

        album.save(function(err) {
            if (err) {
                self.json(false);
            } else {
                // save album to one another object
                if (data.productId) {
                    var objectData = {
                        i: data.productId,
                        o: MODEL('ecomProduct').schema
                    };
                } else if (data.postId) {
                    var objectData = {
                        i: data.postId,
                        o: MODEL('cmsPost').schema
                    };
                }
                if (objectData) {
                    objectData.o.getOne({_id: objectData.i}, function(err, item) {
                        if (err || !item) {
                            self.json(false);
                        } else {
                            item.gallery = album;
                            item.save();
                            self.json(true);
                        }
                    });
                } else {
                    self.json(true);
                }
            }
        });
    }
}

/**
 * Album delete
 */
function deleteAction(id) {
    var self = this;
    var Album = MODEL('album').schema;

    Album.getOne({_id: id}, function(err, album) {
        if (err || !album) {
            self.json(false);
        } else {
            // delete images first
            deleteImages(self.user, album.images);

            album.remove();
            self.json(true);
        }
    });
}

/**
 * Update album
 *
 * @param id
 */
function updateAction(id) {
    var self = this;
    var data = self.post;
    var Album = MODEL('album').schema;
    data.published = (data.published == '1') ? true : false;

    Album.getOne({_id: id}, function(err, album) {
        if (err || !album) {
            self.json(false);
        } else {
            if (data.images.length) {
                data.images.forEach(function(img) {
                    var index = album.images.indexOf(img);
                    if (index !== -1) {
                        album.images.splice(index, 1);
                    }
                });
                deleteImages(self.user, album.images);
            }
            album.images = data.images;
            album.name = data.name || '';
            album.description = data.description || '';
            album.published = data.published;
            album.save(function(err) {
                self.json(err ? false : true);
            });
        }
    });
}

/**
 * Delete images
 *
 * @param images
 */
function deleteImages(user, images) {

    if (images.length > 0) {
        var ids = new Array();
        images.forEach(function(item) {
            var url = item.split("/");
            var id = (url[url.length - 1].match(/\d+/) || '').toString().parseInt();
            if (id > 0) {
                ids.push(id);
            }
        });
        framework.module('file').remove(user, 'album', ids);
    }
}