const mongoose = require('mongoose');
const {Schema} = require('mongoose');

const ReviewSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true,
    },
    rating: {
        type: Number,
    },
    review: {
        type: String
    },
    whicharea: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'area',
    },
    whichSlot: {
        type: Number
    }

    
})
const Review = mongoose.model("review", ReviewSchema);
Review.createIndexes();
module.exports = Review;

