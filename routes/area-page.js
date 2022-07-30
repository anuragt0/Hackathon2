const express = require("express");
const User = require("../models/User");
const Area = require("../models/Area");
const Slot = require("../models/Slot");
const fetchuser = require('../middleware/fetchuser');
const router = express.Router();
const { body, validationResult } = require("express-validator");
// const bcrypt = require("bcryptjs");
// var jwt = require("jsonwebtoken");
// var fetchuser = require("../middleware/fetchuser")

router.get("/getareas", async (req, res)=>{
    // No login is required
    const allAreas = await Area.find();
    res.json(allAreas);
})

router.post("/getslots", async(req, res)=>{
    // No login is required
    // only id of area will be given
    
    const areaID = req.body.areaID;
    const allSlots = await Slot.find({whichArea: areaID});
    res.json(allSlots);
})

router.post("/bookslot",fetchuser, async(req, res)=>{
    // login and authentication is required
    try {
        const userID = req.user.id;
        console.log("here", req.user);
        const slotNum = req.body.slotnumber;
        const areaID = req.body.areaID;
        const slotToBeBooked = await Slot.findOne({whichArea: areaID, number: slotNum});
        if(slotToBeBooked.isBooked==true){
            res.json({messase: "Slot is already booked, kindly pick another slot.."})
        }
        else{
            const slotToBeBooked1 = await Slot.findOneAndUpdate({whichArea: areaID, number: slotNum}, {isBooked: true, user: userID, date: Date.now()}, {new: true});
            res.json(slotToBeBooked1);
        }

    } catch (error) {
        res.json(error);
    }
})

// Login and authentication is required
router.post("/auth/addarea",fetchuser, [
    body("name", "Name of the area must be atleast 4 characters long").isLength({min:3}),
    body("address", "Address of the area must be atleast 10 characters long").isLength({min: 10}),
    body("totalslots", "Enter valid number of slots").isNumeric({min: 2})
], async (req, res)=>{
    // Only admin has the privilege to add the area 
    const userID = req.user.id;
    const loggedInUser = await User.findOne({_id: userID});
    console.log("here1", loggedInUser);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
        if(loggedInUser.role==="user"){
            res.status(401).send({ error: "Access denied, please login with correct credentials" })
        }
        else{
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

        }
    } catch (error) {
        console.error("error name: ", error.message);
      res.status(500).send("Internal Server Error");
    }

})

//------------------------------- FOR ADMIN ---------------------------
router.get("/auth/admin", fetchuser, async (req, res)=>{
    // Only admin can access this route
    const allUsers = await User.find();
    const allAreas = await Area.find();
    const allSlots = await Slot.find();
    res.json({allUsers, allAreas, allSlots});
})

module.exports = router;
