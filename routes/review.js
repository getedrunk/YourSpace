const express = require("express");
const router = express.Router({mergeParams: true});//for params

//error
const wrapAsync = require("../utils/wrapAsync.js")
const ExpressError = require("../utils/ExpressError.js")

//model
const Review = require("../models/review.js");
const Listing = require("../models/listing.js");// listing model is required for post

//server validation for reviews(hoppscoth)
const {reviewSchema} = require("../schema.js")


//function to be as middleware for review validation servers side
const validateReview = (req,res,next)=>{
    let {error} = reviewSchema.validate(req.body);
    if(error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400,errMsg);
    }else{
        next();
    }
}



//adding review for individial listings
router.post("/",validateReview,wrapAsync(async(req,res)=>{
    let lis = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);

    lis.reviews.push(newReview);

    await newReview.save();
    await lis.save();

    res.redirect(`/listings/${lis._id}`);

}));


//deleing a review

router.delete("/:reviewId",wrapAsync(async(req,res) =>{
    let {id,reviewId} = req.params;
    await Listing.findByIdAndUpdate(id,{$pull : {reviews : reviewId}});
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/listings/${id}`)
}))


module.exports = router;
