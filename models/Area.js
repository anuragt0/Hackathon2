const mongoose = require('mongoose');
const {Schema} = require('mongoose');

const AreaSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    address: {
        type: String,
        required: true,
    },
    totalSlots: {
        type: Number,
        required: true
    },
    avgRating: {
        type: Number,
        default: null,
    },
    totalReviews: {
        type: Number,
        default: null
    }
    
})
const Area = mongoose.model("area", AreaSchema);
Area.createIndexes();
module.exports = Area;

