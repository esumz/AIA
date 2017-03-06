/**
 * Created by HaThao on 7/7/14.
 */
var Group = MODEL('group').schema;
var Role = MODEL('role').schema;

var UserSchema = mongoose.Schema({
    firstName: String,
    lastName: String,
    avatar: {
        type: String,
        default: '/images/user-default.gif'
    },
    group: {
        type: mongoose.Schema.ObjectId,
        ref: 'Group'
    },
    roles: [{
        type: mongoose.Schema.ObjectId,
        ref: 'Role'
    }],
    role: {
        type: String,
        default: 'ROLE_USER'
    },
    provider: String,
    uid: String,
    email: {
        type: String,
        unique: true
    },
    password: String,
    storageLimit: Number,
    storageUsed: Number,
    mobileNumber: String,
    address: String,
    occupation: String,
    about: String,
    website: String,
    skype: String,
    facebook: String,
    birthday: Date,
    interest: String,
    created: {
        type: Date,
        default: Date.now
    },
    modified: {
        type: Date,
        default: Date.now
    },
    isActive: {
        type: Boolean,
        default: false
    },
    lastLogin: {
        type: Date,
        default: Date.now
    }
});


/**
 * Methods
 */

UserSchema.statics.getList = function(data, limit, page, callback) {
    var query = this.find();

    if (typeof data.id != 'undefined' && data.id != '') {
        query = query.where('_id').equals(data.id);
    }
    if (typeof data.role != 'undefined' && data.role != '') {
        query = query.where('role').equals(data.role);
    }
    if (typeof data.group != 'undefined' && data.group != '') {
        query = query.where('group').equals(data.group);
    }
    if (typeof data.email != 'undefined' && data.email != '') {
        query = query.where('email').regex(new RegExp(data.email, "i"));
    }
    if (typeof data.isActive != 'undefined') {
        query = query.where('isActive').equals(data.isActive);
    }
    query = query.populate('group')
        .skip(limit*(page-1))
        .sort({created: -1})
        .limit(limit);

    query.exec(callback);
}

UserSchema.statics.getOne = function(data, callback) {
    this.findOne(data)
        .populate('group')
        .populate('roles')
        .exec(callback);
}

/**
 * Define model
 *
 * @type {*|Model}
 */
exports.schema = mongoose.model('User', UserSchema);
exports.name = 'user';