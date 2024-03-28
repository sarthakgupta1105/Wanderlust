const express = require("express");
const router = express.Router({mergeParams:true});
const Listing = require("../models/listing.js")
const Review = require("../models/review.js")
const wrapAsync = require("../utils/wrapAsync.js");
const {validateReview, isLoggedIn,isReviewAuthor}=require("../middlewares.js");
const reviewController = require("../controllers/review.js");

//Review
//POST review route
router.post("/",isLoggedIn,validateReview,wrapAsync(reviewController.createReview))

//DELETE review route
router.delete("/:reviewId",isReviewAuthor,wrapAsync(reviewController.destroyReview))

module.exports = router;