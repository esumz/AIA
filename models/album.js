/**
 * Created by thaoha on 8/27/14.
 */

var AlbumSchema = new mongoose.Schema({
    name: String,
    description: String,
    user: {
        type: mongoose.Schema.ObjectId,
        rel: 'User'
    },
    images: [String],
    published: {
        type: Boolean,
        default: false
    },
    created: {
        type: Date,
        default: Date.now
    },
    modified: {
        type: Date,
        default: Date.now
    }
});

/**
 * Methods
 */

AlbumSchema.statics.getList = function(data, limit, page, callback) {
    var query = this.find();

    if (typeof data.user != 'undefined' && data.user != '') {
        query = query.where('user').equals(data.user);
    }
    if (typeof data.published != 'undefined') {
        query = query.where('published').equals(data.published);
    }
    if (typeof data.name != 'undefined' && data.name != '') {
        query = query.where('name').regex(new RegExp(data.name, "i"));
    }
    query = query.populate('user', 'id')
        .skip(limit*(page-1))
        .sort({created: 1})
        .limit(limit);

    query.exec(callback);
}

AlbumSchema.statics.getOne = function(data, callback) {
    this.findOne(data)
        .populate('user')
        .exec(callback);
}

/**
 * Define model
 *
 * @type {*|Model}
 */
exports.schema = mongoose.model('Album', AlbumSchema);
exports.name = 'album';