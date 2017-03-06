/**
 * Created by HaThao on 7/21/14.
 */

var preAdminEcomRoute = framework.config['admin-route'] + '/cms';
var routes = [
    {name: 'adMenu_list', path: preAdminEcomRoute + '/menu-list', action: indexAction, flags: ['authorize', 'get']},
    {name: 'adMenu_create', path: preAdminEcomRoute + '/menu-create', action: addAction, flags: ['authorize', 'post', 'xhr']},
    {name: 'adMenu_delete', path: preAdminEcomRoute + '/menu-delete/{id}', action: deleteAction, flags: ['authorize', 'xhr', 'post']}
];

exports.install = function(framework) {
    global.routes = global.routes || new Array();

    routes.forEach(function(route) {
        framework.route(route.path, route.action, route.flags || ['get']);
        global.routes[route.name] = route.path;
    });
}

/**
 * Get list menu
 */
function indexAction() {
    var self = this;
    var Menu = MODEL('menu').schema;
    var Page = MODEL('page').schema;

    Menu.getList({}, function(err, list) {
        Page.getList({}, function(err, listPage) {
            if (self.req.method == 'GET') {
                self.view('index', {
                    menus: list,
                    pages: listPage
                });
            } else {
                self.json(list);
            }
        });
    });
}

/**
 * Create menu
 */
function addAction() {
    var self = this;
    var Menu = MODEL('menu').schema;
    var data = self.post;

    data.parent = data.parent == 'none' ? null : data.parent;
    global.thData['menus'] = null;

    // Update action
    if (data.id != '') {
        Menu.getOne({_id: data.id}, function(err, menu) {
            if (!err && menu) {
                // If have parent -> remove parent
                if (menu.parent) {
                    var index = menu.parent.subMenus.indexOf(menu);
                    menu.parent.subMenus.splice(index, 1);
                    menu.parent.save();
                }
                // If data.parent != none -> add menu to parent.subMenus
                if (data.parent) {
                    Menu.getOne({_id: data.parent}, function(err, parentMenu) {
                        if (!err && parentMenu) {
                            parentMenu.subMenus.push(menu);
                            parentMenu.save();
                        }
                    });
                }
                // Update menu
                Menu.update({_id: data.id}, data, {multi: false}, function(err, numAffected) {
                    if (!err && numAffected > 0) {
                        self.json(true);
                    } else {
                        self.json(false);
                    }
                });
            } else {
                self.json(false);
            }
        });
    } else {
        // Create new action
        var newMenu = new Menu(data);
        newMenu.save(function(err) {
            if (!err) {
                // If data.parent != none -> add menu to parent.subMenus
                if (data.parent) {
                    Menu.getOne({_id: data.parent}, function(err, parentMenu) {
                        if (!err && parentMenu) {
                            parentMenu.subMenus.push(newMenu);
                            parentMenu.save();
                            self.json(true);
                        } else {
                           self.json(false);
                        }
                    });
                } else {
                    self.json(true);
                }
            } else {
                self.json(false);
            }
        });
    }
}

/**
 * Delete menu
 *
 * @param id
 */
function deleteAction(id) {
    var self = this;
    global.thData['menus'] = null;

    MODEL('menu').schema.getOne({_id: id}, function(err, menu) {
        if (!err && !utils.isEmpty(menu)) {
            // Remove all subMenu
            if (menu.subMenus.length > 0) {
                menu.subMenus.forEach(function(item) {
                    item.remove();
                });
            }
            // Remove from parent.subMenus
            if (menu.parent) {
                var index = menu.parent.subMenus.indexOf(menu);
                menu.parent.subMenus.splice(index, 1);
                menu.parent.save();
            }
            menu.remove();
            self.json(true);
        } else {
            self.json(false);
        }
    });
}
