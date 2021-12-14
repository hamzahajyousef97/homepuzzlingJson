const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const youKnowSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    }
},{
    timestamps: true
});

var YouKnow = mongoose.model('YouKnow', youKnowSchema);

module.exports = YouKnow;
