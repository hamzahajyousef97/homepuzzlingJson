const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const informationSchema = new Schema({
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

var Information = mongoose.model('Information', informationSchema);

module.exports = Information;
