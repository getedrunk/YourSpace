const express = require("express");
const router = express.Router();

//error
const wrapAsync = require("../utils/wrapAsync.js")
const ExpressError = require("../utils/ExpressError.js")

//model
const Listing = require("../models/listing.js");


// missng listing validation from server side





//index route-show all aviable listings
router.get("/",wrapAsync(async (req,res)=>{
   const listings = await Listing.find({});
   res.render("listings/index.ejs",{listings});
}));

//create  route 
router.get("/new",wrapAsync(async(req,res)=>{
    res.render("listings/new.ejs");
}));

//show route (Read)-for each individual
router.get("/:id",wrapAsync(async(req,res)=>{
    let {id} = req.params;
    let obj = await Listing.findById(id).populate("reviews");
    if(!obj){
        req.flash("error","Listing you requested does not Exist");
        return res.redirect("/listings");
    }
    res.render("listings/show.ejs",{obj});
}));

//adding to database from new.ejs form
router.post("/",wrapAsync(async(req,res,next)=>{
        const lis = req.body;
        const user = new Listing({
        title : lis.title,
        description : lis.description,
        image: lis.image,
        price : lis.price,
        location : lis.location,
        country : lis.country
        });
        if(!req.body){
            throw new ExpressError(400,"send valid data for listing")
        }
        const ans = await user.save();
        req.flash("success","New Listing Created")
        res.redirect("/listings");
}));

//edit route
router.get("/:id/edit",wrapAsync(async(req,res)=>{
    let {id} = req.params;
    const obj = await Listing.findById(id);
    if(!obj){
        req.flash("error","Listing you requested does not Exist");
        return res.redirect("/listings");
    }
    res.render("listings/edit.ejs",{obj})
}))
//updating the database
router.put("/:id",wrapAsync(async (req,res)=>{
    let {id} = req.params;
    const updatedlis = req.body;
    if(!req.body.title){
        throw new ExpressError(400,"send valid data for listing")
    }
    await Listing.findByIdAndUpdate(id,updatedlis);
    req.flash("success","Updated Listing")
    res.redirect(`/listings/${id}`);
}))
//delete route
router.delete("/:id",wrapAsync(async(req,res)=>{
    let {id} = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("success","Listing is Deleted")
    res.redirect("/listings");
}));

module.exports = router;