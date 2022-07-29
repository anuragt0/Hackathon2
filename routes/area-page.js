const express = require("express");
const User = require("../models/User");
const Area = require("../models/Area");
const Slot = require("../models/Slot");
const router = express.Router();
const { body, validationResult } = require("express-validator");
// const bcrypt = require("bcryptjs");
// var jwt = require("jsonwebtoken");
// var fetchuser = require("../middleware/fetchuser")

router.get("/getareas", async (req, res)=>{
    const allAreas = await Area.find();
    res.json(allAreas);
})
router.get("/getslots", async(req, res)=>{
    // only id of area will be given
    
    const areaID = req.body.areaID;
    const allSlots = await Slot.find({whichArea: areaID});
    res.json(allSlots);
})

router.post("/bookslot", async(req, res)=>{
    const slotNum = req.body.slotnumber;
    const areaID = req.body.areaID;
    console.log(areaID);
    // let slotToBeBooked = {
    //     name: "asdfas"
    // }

    const slotToBeBooked = await Slot.findOneAndUpdate({whichArea: areaID, number: slotNum}, {isBooked: true}, {new: true});
    res.json(slotToBeBooked);

})

router.post("/addarea",[
    body("name", "Name of the area must be atleast 4 characters long").isLength({min:3}),
    body("address", "Address of the area must be atleast 10 characters long").isLength({min: 10}),
    body("totalslots", "Enter valid number of slots").isNumeric({min: 2})
], async (req, res)=>{
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
        // Check whether the area with this name exists already
        let area = await Area.findOne({ name: req.body.name });
        if (area) {
            return res
            .status(400)
            .json({ error: "Sorry an area with this name already exists" });
        }
        const newArea = await Area.create({
            name: req.body.name,
            address: req.body.address,
            totalSlots: req.body.totalslots
        })

        const totalSlots = req.body.totalslots;
        let temp = 1;
        for (let i = 0; i < totalSlots; i++) {
            let slot1 = await Slot.create({
                number: temp++,
                whichArea: newArea._id
            })
        }
        
        res.json(newArea);
    } catch (error) {
        console.error("error name: ", error.message);
      res.status(500).send("Internal Server Error");
    }

})

module.exports = router;
