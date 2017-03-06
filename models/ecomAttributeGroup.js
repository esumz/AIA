/**
 * Created by HaThao on 7/21/14.
 */
var attributeTypes = [
    {name: 'Short Text',        value: 'shortText'},
    {name: 'Long Text',         value: 'longText'},
    {name: 'Multiple Select',   value: 'multiSelect'},
    {name: 'Single Select',     value: 'singleSelect'},
    {name: 'Select List',       value: 'selectList'}
];

var FieldSchema = new mongoose.Schema({
    name:           String,
    description:    String,
    type: {
        type:       mongoose.Schema.Types.Mixed,
        default:    attributeTypes[0]
    },
    default:        String,
    required:       Boolean,
    values:         Array
});

var EcomAttributeGroupSchema = new mongoose.Schema({
    name:           String,
    description:    String,
    fields:         [FieldSchema]
});


/**
 * Methods
 */
EcomAttributeGroupSchema.statics.getList = function(data, callback) {
    this.find(data)
        .exec(callback);
}

EcomAttributeGroupSchema.statics.getOne = function(data, callback) {
    this.findOne(data)
        .exec(callback);
}

/**
 * @type {*|Model}
 */
exports.attributeTypes = attributeTypes;
exports.schema = mongoose.model('EcomAttributeGroup', EcomAttributeGroupSchema);
exports.name = 'ecomAttributeGroup';