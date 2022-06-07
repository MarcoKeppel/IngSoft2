var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// set up a mongoose model
const imageFileSchema = new Schema({
    filename: String,
    image: {
        data: Buffer,
        contentType: String
    }
});

const imageFile = mongoose.model('ImageFile', imageFileSchema);

module.exports = imageFile;
