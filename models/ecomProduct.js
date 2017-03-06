/**
 * Created by HaThao on 7/21/14.
 */
var Catalog = MODEL('ecomCatalog').schema;
var Attribute = MODEL('ecomAttribute').schema;
var Tag = MODEL('ecomTag').schema;
var Album = MODEL('album').schema;

var EcomProductSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    alias: {
        type: String,
        required: true,
        unique: true
    },
    avatar: String,
    description: String,
    price: Number,
    numberOfView: {
        type: Number,
        default: 0
    },
    numberOfBuy: {
        type: Number,
        default: 0
    },
    attribute: {
        type: mongoose.Schema.ObjectId,
        ref: 'EcomAttribute'
    },
    gallery: {
        type: mongoose.Schema.ObjectId,
        ref: 'Album'
    },
    catalog: {
        type: mongoose.Schema.ObjectId,
        ref: 'EcomCatalog'
    },
    tags: [{
        type: mongoose.Schema.ObjectId,
        ref: 'EcomTag'
    }],
    tagNames: [String],
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    },
    created: {
        type: Date,
        default: Date.now
    },
    modified: {
        type: Date,
        default: Date.now
    },
    published: {
        type: Boolean,
        default: true
    }
});


EcomProductSchema.pre('save', function(next) {
    var self = this;

    async.parallel({

        tags: function(fn) {
            var list = new Array();
            async.each(self.tagNames, function(name, fn2) {
                Tag.findOne({name: name}, function(err, tag) {
                    if (err || !tag) {
                        tag = new Tag({
                            name: name,
                            user: self.user
                        });
                    }
                    tag.save();
                    list.push(tag);
                    fn2(err);
                });
            }, function(err) {
                fn(err, list);
            });
        }
    }, function(err, results) {
        self.tags = results.tags;
        next();
    });
});

/**
 * Methods
 */

EcomProductSchema.statics.getList = function(data, limit, page, callback) {
    var query = this.find();

    if (typeof data.ids != 'undefined') {
        query = query.where('_id').in(data.ids);
    }
    if (typeof data.user != 'undefined') {
        query = query.where('user').equals(data.user);
    }
    if (typeof data.catalog != 'undefined' && data.catalog != '') {
        query = query.where('catalog').equals(data.catalog);
    }
    if (typeof data.name != 'undefined' && data.name != '') {
        query = query.where('name').regex(new RegExp(data.name, "i"));
    }
    if (typeof data.published != 'undefined') {
        query = query.where('published').equals(data.published);
    }
    query = query.populate('catalog')
        .populate('user', 'id firstName lastName avatar')
        .skip(limit*(page-1))
        .sort({created: -1})
        .limit(limit);

    query.exec(callback);
}

/**
 * Get top products buy numberOfBuy
 *
 * @param limit
 * @param callback
 * @returns {Promise|Array|{index: number, input: string}|*|Mixed}
 */
EcomProductSchema.statics.bestSellers = function(data, limit, callback) {
    return this.find(data)
        .sort({numberOfBuy: -1})
        .limit(limit || 10)
        .exec(callback);
}

/**
 * Get top products buy numberOfView
 *
 * @param limit
 * @param callback
 * @returns {Promise|Array|{index: number, input: string}|*|Mixed}
 */
EcomProductSchema.statics.bestViewers = function(data, limit, callback) {
    return this.find(data)
        .sort({numberOfView: -1})
        .limit(limit || 10)
        .exec(callback);
}

EcomProductSchema.statics.getOne = function(data, callback) {
    this.findOne(data)
        .populate('attribute')
        .populate('gallery')
        .populate('catalog')
        .populate('tags')
        .populate('user')
        .exec(callback);
}

/**
 * Define model
 *
 * @type {*|Model}
 */
exports.schema = mongoose.model('EcomProduct', EcomProductSchema);
exports.name = 'ecomProduct';