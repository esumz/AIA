/**
 * Created by HaThao on 7/22/14.
 */

var preAdminEComRoute = framework.config['admin-route'] + '/e-commerce';
var routes = [
    {name: 'adAttr_form', path: preAdminEComRoute + '/attr-generate-form/{id}', action: generateAttributeAction, flags: ['authorize', 'xhr', 'post']},
    {name: 'adAttr_product_save', path: preAdminEComRoute + '/attr-product-save/{productId}', action: saveAttributeAction, flags: ['authorize', 'xhr', 'post']},
    {name: 'adAttr_group_list', path: preAdminEComRoute + '/attr-group-list', action: indexGroupAction, flags: ['authorize', 'get']},
    {name: 'adAttr_group_create', path: preAdminEComRoute + '/attr-group-create', action: addGroupAction, flags: ['authorize', 'xhr', 'post']},
    {name: 'adAttr_group_delete', path: preAdminEComRoute + '/attr-group-delete/{id}', action: deleteGroupAction, flags: ['authorize', 'xhr', 'post']},
    {name: 'adAttr_field_add', path: preAdminEComRoute + '/attr-group-add-field/{id}', action: addFieldGroupAction, flags: ['authorize', 'xhr', 'post']},
    {name: 'adAttr_field_remove', path: preAdminEComRoute + '/attr-group-remove-field/{groupId}/{fieldId}', action: removeFieldGroupAction, flags: ['authorize', 'xhr', 'post']}
];

exports.install = function(framework) {
    global.routes = global.routes || new Array();

    routes.forEach(function(route) {
        framework.route(route.path, route.action, route.flags || ['get']);
        global.routes[route.name] = route.path;
    });
}

/**
 * Generate form for product attribute
 *
 * @param catalogId
 */
function generateAttributeAction(id) {
    var self = this;
    var data = self.post;

    if (data.catalog == 'true') {
        MODEL('ecomCatalog').schema.getOne({_id: id}, function(err, catalog) {
            self.view('form', {attributeGroup: catalog.attributeGroup});
        });
    } else if (data.attrGroup == 'true') {
        MODEL('ecomAttributeGroup').schema.getOne({_id: id}, function(err, attributeGroup) {
            self.view('form', {attributeGroup: attributeGroup});
        });
    } else {
        self.view('form');
    }
}

/**
 * Save attribute for product
 *
 * @param productId
 */
function saveAttributeAction(productId) {
    var self = this;
    var Attribute = MODEL('ecomAttribute').schema;
    var data = self.post;

    // create list attribute from post data
    var fields = new Array();
    for (var name in data) {
        fields.push({
            name: name,
            value: data[name]
        });
    }
    // create new attribute
    var newAttribute = new Attribute({
        fields: fields
    });
    newAttribute.save(function(err) {
        if (err) {
            self.json(false);
        } else {
            // find product to save
            MODEL('ecomProduct').schema.getOne({_id: productId}, function(err, product) {
                if (err || utils.isEmpty(product)) {
                    self.json(false);
                } else {
                    // save attribute for product
                    product.attribute = newAttribute;
                    product.save(function(err) {
                        if (err) {
                            self.json(false);
                        } else {
                            self.json(true);
                        }
                    });
                }
            });
        }
    });
}

/**
 * View group page manager
 */
function indexGroupAction() {
    var self = this;

    MODEL('ecomAttributeGroup').schema.getList({}, function(err, list) {
        self.view('index', {
            attributeGroups: list,
            attributeTypes: MODEL('ecomAttributeGroup').attributeTypes
        });
    });
}

/**
 * Add group attribute
 */
function addGroupAction() {
    var self = this;
    var Group = MODEL('ecomAttributeGroup').schema;
    var data = self.post;

    data.admin = self.user.id;

    if (data.id != '') {
        Group.update({_id: data.id}, data, {multi: false}, function(err, numAffected) {
            if (!err && numAffected > 0) {
                self.json(true);
            } else {
                self.json(false);
            }
        });
    } else {
        var newGroup = new Group(data);
        newGroup.save(function(err) {
            if (err) {
                self.json(false);
            } else {
                self.json(true);
            }
        });
    }
}

/**
 * Add field to group
 *
 * @param id
 */
function addFieldGroupAction(id) {
    var self = this;
    var data = self.post;
    var attributeGroup = MODEL('ecomAttributeGroup').schema;
    var attributeTypes = attributeGroup.attributeTypes;

    data.required = data.required == '1' ? true : false;
    // trim and push values to array
    if (data.values != '') {
        var values = data.values.split(",");
        for (var key in values) {
            values[key] = utils.trim(values[key]);
        }
        data.values = values;
    }
    attributeTypes.forEach(function(type) {
        if (type.name == data.type) {
            data.type = type;
        }
    });
    attributeGroup.getOne({_id: id}, function(err, group) {
         if (err || utils.isEmpty(group)) {
             self.json(false);
         } else {
             group.fields.push(data);
             group.save(function(err) {
                 if (err) {
                     self.json(false);
                 } else {
                     self.json(true);
                 }
             });
         }
    });
}

/**
 * Remove field in group
 *
 * @param groupId
 * @param fieldId
 */
function removeFieldGroupAction(groupId, fieldId) {
    var self = this;

    MODEL('ecomAttributeGroup').schema.getOne({_id: groupId}, function(err, group) {
        if (err || utils.isEmpty(group)) {
            self.json(false);
        } else {
            group.fields.id(fieldId).remove();
            group.save(function(err) {
                if (err) {
                    self.json(false);
                } else {
                    self.json(true);
                }
            });
        }
    });
}

/**
 * Delete group
 *
 * @param id
 */
function deleteGroupAction(id) {
    var self = this;

    MODEL('ecomAttributeGroup').schema.getOne({_id: id}, function(err, group) {
        if (!err && !utils.isEmpty(group)) {
            group.remove();
            self.json(true);
        } else {
            self.json(false);
        }
    });
}