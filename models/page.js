/**
 * Created by HaThao on 8/9/14.
 */

var PageSchema = new mongoose.Schema({
    name: {
        type: String,
        default: 'default'
    },
    link: {
        type: String,
        unique: true
    },
    layout: String,
    rows: [{
        components: [{
            name: String,
            attributes: {
                height: String,
                width: String,
                padding: String,
                margin: String
            }
        }],
        attributes: {
            height: String,
            padding: String,
            margin: String
        }
    }]
});

/**
 * Methods
 */
PageSchema.statics.getList = function(data, callback) {
    this.find(data)
        .exec(callback);
}

PageSchema.statics.getOne = function(data, callback) {
    this.findOne(data)
        .exec(callback);
}

/**
 * @type {*|Model}
 */
exports.schema = mongoose.model('Page', PageSchema);
exports.name = 'page';