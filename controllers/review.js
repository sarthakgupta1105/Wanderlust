const Review = require("../models/review");
const Listing = require("../models/listing")

module.exports.createReview = async(req,res)=>{
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);
    listing.reviews.push(newReview);
    newReview.author = req.user._id;
    await newReview.save();
    await listing.save();
    // console.log("review added");
    req.flash("success","Review Added!")
    res.redirect(`/listings/${listing._id}`)
};

module.exports.destroyReview = async(req,res)=>{
    let {id,reviewId} = req.params;
    await Listing.findByIdAndUpdate(id,{$pull:{reviews: reviewId}})
    await Review.findByIdAndDelete(reviewId)
    req.flash("success","Review Deleted!")
    res.redirect(`/listings/${id}`)
};