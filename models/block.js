/**
 * Created by HaThao on 8/4/14.
 */
var Product = MODEL('ecomProduct').schema;

var BlockTypes = [
    {name: 'product',   display: 'Product',   styles: ['default', 'productStyleOne', 'productStyleTwo']},
    {name: 'catalog',   display: 'Catalog',   styles: ['default', 'catalogStyleOne', 'catalogStyleTwo']},
    {name: 'slide',     display: 'Slide',     styles: ['default', 'slideStyleOne', 'slideStyleTwo']},
    {name: 'menu',      display: 'Menu',      styles: ['default', 'menuStyleOne', 'menuStyleTwo']},
    {name: 'html',      display: 'Html',      styles: ['default', 'htmlStyleOne', 'htmlStyleTwo']}
];

var BlockSchema = new mongoose.Schema({
    name:         String,
    style: {
        type:     String,
        default:  'default'
    },
    order:        Number,
    column:       Number,
    height:       Number,
    type:         String,
    admin: {
        type:     mongoose.Schema.ObjectId,
        ref:      'User'
    },
    display: {
        type:     Boolean,
        default:  true
    },
    data:         String
});

/**
 * Methods
 */
BlockSchema.statics.getList = function(data, callback) {
    this.find(data)
        .populate('admin', 'id')
        .populate('subBlocks')
        .sort({top: 1})
        .exec(callback);
}

BlockSchema.statics.getOne = function(data, callback) {
    this.findOne(data)
        .populate('admin', 'id')
        .populate('subBlocks')
        .exec(callback);
}
/**
 * @type {*|Model}
 */
exports.blockTypes = BlockTypes;
exports.schema = mongoose.model('Block', BlockSchema);
exports.name = 'block';