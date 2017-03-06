/**
 * Created by thaoha on 8/25/14.
 */

var Permissions = [
    {
        name: 'product',
        display: 'Product',
        actions: [
            {name: 'create', display: 'Create'},
            {name: 'edit', display: 'Edit'},
            {name: 'delete', display: 'Delete'}
        ]
    },
    {
        name: 'post',
        display: 'Post',
        actions: [
            {name: 'create', display: 'Create'},
            {name: 'edit', display: 'Edit'},
            {name: 'delete', display: 'Delete'}
        ]
    },
    {
        name: 'user',
        display: 'User',
        actions: [
            {name: 'create', display: 'Create'},
            {name: 'edit', display: 'Edit'},
            {name: 'delete', display: 'Delete'}
        ]
    },
    {
        name: 'component',
        display: 'Component',
        actions: [
            {name: 'create', display: 'Create'},
            {name: 'edit', display: 'Edit'},
            {name: 'delete', display: 'Delete'}
        ]
    },
    {
        name: 'page',
        display: 'Page',
        actions: [
            {name: 'create', display: 'Create'},
            {name: 'edit', display: 'Edit'},
            {name: 'delete', display: 'Delete'}
        ]
    }
];

var RoleSchema = new mongoose.Schema({
    name: String,
    description: String,
    permissions: mongoose.Schema.Types.Mixed
});

/**
 * Methods
 */
RoleSchema.statics.getList = function(data, callback) {
    this.find(data)
        .exec(callback);
}

RoleSchema.statics.getOne = function(data, callback) {
    this.findOne(data)
        .exec(callback);
}

/**
 * @type {*|Model}
 */
exports.permissions = Permissions;
exports.schema = mongoose.model('Role', RoleSchema);
exports.name = 'role';