const Listing = require("./models/listing");
const Review = require("./models/review.js")
const {reviewSchema} = require("./schema.js");
const {listingSchema} = require("./schema.js");
const expressError = require("./utils/expressError.js");

module.exports.isLoggedIn = (req,res,next)=>{
    // console.log(req.session);
    // console.log(res.locals)//once res has been sent then res also resets
    if(!req.isAuthenticated()){
        req.session.redirectUrl = req.originalUrl;
        // console.log(req.session); //passport after logging in will reset req.session
        // console.log(res.locals);
        req.flash("error","User must be logged in!")
        return res.redirect("/login")
    }
    next();
};
//for brushing up req,res just comment out above console.logs
module.exports.saveRedirectUrl = (req,res,next)=>{
    if(req.session.redirectUrl){
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
}

module.exports.isOwner = async(req,res,next)=>{
    let {id} =req.params;
    let listing= await Listing.findById(id);
    if(!res.locals.currUser._id.equals(listing.owner._id)){
        req.flash("error","Permission Denied!");
        return res.redirect(`/listings/${id}`);
    }
    next();
}

module.exports.validateListing = (req,res,next)=>{
    let {error} = listingSchema.validate(req.body);
    if(error){
        let errmsg = error.details.map((el)=>el.message).join(",");
        throw new expressError(400,errmsg);
    }else{
        next();
    }
}

module.exports.validateReview = (req,res,next)=>{
    let {error}=reviewSchema.validate(req.body);
    if(error){
        let errmsg = error.details.map((el)=>el.message).join(",");
        throw new expressError(400,errmsg)
    }else{
        next();
    }
}

module.exports.isReviewAuthor = async(req,res,next)=>{
    let {id,reviewId} = req.params;
    let review = await Review.findById(reviewId);
    if(!review.author.equals(req.user._id)){
        req.flash("error","Permission Denied");
        return res.redirect(`/listings/${id}`);
    }
    next();
}