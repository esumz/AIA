/**
 * Created by HaThao on 7/7/14.
 */

var MenuSchema = new mongoose.Schema({
    name: String,
    order: {
        type: Number,
        default: 0
    },
    parent: {
        type: mongoose.Schema.ObjectId,
        ref: 'Menu'
    },
    subMenus: [{
        type: mongoose.Schema.ObjectId,
        ref: 'Menu'
    }],
    value: String
});

/**
 * Methods
 */
MenuSchema.statics.getList = function(data, callback) {
    this.find(data)
        .populate('parent', 'id name')
        .populate('subMenus', 'id name value order')
        .exec(callback);
}

MenuSchema.statics.getOne = function(data, callback) {
    this.findOne(data)
        .populate('parent')
        .populate('subMenus')
        .exec(callback);
}

/**
 * @type {*|Model}
 */
exports.schema = mongoose.model('Menu', MenuSchema);
exports.name = 'menu';