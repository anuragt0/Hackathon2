const express = require("express");
const User = require("../models/User");
const Area = require("../models/Area");
const Slot = require("../models/Slot");
const Review = require("../models/Review");
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

router.get("/getslots", async(req, res)=>{
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


//  IMPLEMENT HOW MUCH IS THE AVERAGE RATING OF A PARTICULAR AREA 


// Login is required
router.post("/auth/review", fetchuser,[
    body("rating", "Rating should be in range of 1 to 5").isNumeric({min: 1, max: 5}),
    body("review", "Review of the area should be atleast 4 characters long").isLength({min: 4})
], async (req, res)=>{
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
        const areaID = req.body.areaid;
        const userID = req.user.id;
        const slotNumber = req.body.slotnumber;
        const foundArea = await Area.find({_id: areaID});
        
        console.log(foundArea);
        if(slotNumber>foundArea.totalSlots || slotNumber<=0){
            res.status(404).json({message: "Slot does not exist"});
        }
        else{
            const newReview = await Review.create({
                rating: req.body.rating,
                review: req.body.review,
                user: userID,
                whicharea: areaID,
                whichSlot: slotNumber
            })
            res.json(newReview);
        }
    } catch (error) {
        console.error("error name: ", error.message);
        res.status(500).send("Internal Server Error");
    }
})

router.get("/auth/getreviews", async(req, res)=>{
    // Login is required
    const areaID = req.body.areaid;
    // const userID = req.user.id;

    const allReviews = await Review.find({whicharea: areaID});
    res.json({allReviews});
})

//------------------------------- FOR ADMIN ---------------------------
router.get("/auth/admin", fetchuser, async (req, res)=>{
    // Only admin can access this route
    const userID = req.user.id;
    const loggedInUser = await User.findOne({_id: userID});
    console.log("here1", loggedInUser);
    if(loggedInUser.role==="user"){
        res.status(401).send({ error: "Access denied, please login with correct credentials" })
    }
    else{
        const allUsers = await User.find();
        const allAreas = await Area.find();
        const allSlots = await Slot.find();
        res.json({allUsers, allAreas, allSlots});
    }

})

module.exports = router;
