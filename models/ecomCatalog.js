/**
 * Created by HaThao on 7/21/14.
 */
var AttributeGroup = MODEL('ecomAttributeGroup').schema;
var Product = MODEL('ecomProduct').schema;

var EcomCatalogSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    alias: {
        type: String,
        required: true,
        unique: true
    },
    description: String,
    order: {
        type:     Number,
        default:  0
    },
    attributeGroup: {
        type: mongoose.Schema.ObjectId,
        ref: 'EcomAttributeGroup'
    }
});

/**
 * Methods
 */

EcomCatalogSchema.statics.getListCount = function(data, next) {
    var results = [];

    this.find(data)
        .populate('attributeGroup')
        .exec(function(err, list) {
            if (!err) {
                async.each(list, function(catalog, fn) {
                    Product.count({catalog: catalog, published: true}, function(err, numberOfProduct) {
                        results.push({
                            name: catalog.name,
                            alias: catalog.alias,
                            description: catalog.description,
                            order: catalog.order,
                            attributeGroup: catalog.attributeGroup,
                            count: numberOfProduct
                        });
                        fn(err);
                    });
                }, function(err) {
                    next(err, results);
                });
            }
        });
}

EcomCatalogSchema.statics.getList = function(data, callback) {
    this.find(data)
        .populate('attributeGroup')
        .exec(callback);
}

EcomCatalogSchema.statics.getOne = function(data, callback) {
    this.findOne(data)
        .populate('attributeGroup')
        .exec(callback);
}

/**
 * @type {*|Model}
 */
exports.schema = mongoose.model('EcomCatalog', EcomCatalogSchema);
exports.name = 'ecomCatalog';