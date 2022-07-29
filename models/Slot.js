const mongoose = require('mongoose');
const {Schema} = require('mongoose');

const SlotSchema = mongoose.Schema({
    number: {
        type: Number,
        required: true,
        
    },
    isBooked: {
        type: Boolean,
        default: false
    },
    whichArea: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'area'
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    date: {
        type: Date,
        default: Date.now(),
    }
})

const Slot = mongoose.model("slot", SlotSchema);
Slot.createIndexes();
module.exports = Slot;

