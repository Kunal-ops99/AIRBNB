const express = require("express");
const router = express.Router({mergeParams:true});
const wrapAsync=require("../utils/wrapsync.js");
const ExpressError=require("../utils/expressError.js");
const {listingSchema}=require("../schema.js");
const Review = require("../models/review.js");
const Listing = require("../models/listing");
const {isLoggedIn,isReviewAuthor}=require("../middleware.js");


const reviewController=require("../controllers/review.js");

 validateListing=(req,res,next)=>{
    let{error}=listingSchema.validate(req.body);
    if(error){
        let errMsg=error.details.map((el)=>el.message).join(",");
        throw new ExpressError(400,errMsg);
    }else{
        next();
    }
}

//Reviews
//Post Route
router.post("/",isLoggedIn,wrapAsync(reviewController.createReview))

//Delete Review Route
router.delete("/:reviewId",isLoggedIn,wrapAsync(reviewController.destroyReview))

module.exports=router;