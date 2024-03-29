const Listing = require("../models/listing");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });


module.exports.index = async (req,res)=>{
    let listings = await Listing.find({});
    res.render("listings/index.ejs",{listings})
};

module.exports.renderNewForm = (req,res)=>{
    res.render("listings/new.ejs")
};

module.exports.createListing = async(req,res,next)=>{
    try{
        let response= await geocodingClient
    .forwardGeocode({
        query: req.body.listing.location,
        limit: 1
      })
    .send();
    let url = req.file.path;
    let filename = req.file.filename;
    let listing =new Listing(req.body.listing);
    listing.owner = req.user._id;
    listing.image = {url,filename}
    listing.geometry = response.body.features[0].geometry;
    let savedListing = await listing.save();
    console.log(savedListing)
    req.flash("success","New Listing Added!");
    res.redirect("/listings");
    }catch(err){
        console.log(err)
    }
};

module.exports.show = async(req,res)=>{
    // console.log(req.user);
    let {id}=req.params;
    let listing =await Listing.findById(id)
    .populate(//nest populate
        {path:"reviews",
        populate:{
            path:"author"
        }
    })
    .populate("owner");
    if(!listing){
        req.flash("error","Listing you requested for does not exist!");
        res.redirect("/listings");
    }
    // res.send("success")
    // console.log(listing);//has owner expanded
    res.render("listings/show.ejs",{listing});
};

module.exports.renderEditForm = async (req,res)=>{
    let {id} = req.params;
    let listing = await Listing.findById(id);
    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload","/upload/w_250/e_blur:100");
    if(!listing){
        req.flash("error","Listing you requested for does not exist!");
        res.redirect("/listings");
    }
    res.render("listings/edit.ejs",{listing,originalImageUrl});
};

module.exports.updateListing = async(req,res)=>{
    if(!req.body.listing){
        throw new expressError(400,"Please Enter valid details")
    }
    let {id} =req.params;
    let listing = await Listing.findByIdAndUpdate(id,{...req.body.listing}) ;
    if(typeof(req.file) !== "undefined"){
        let url = req.file.path;
        let filename = req.file.filename;
        listing.image = {url,filename};
        await listing.save();
    }
    req.flash("success","Listing Updated!")
    res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async(req,res)=>{
    let {id}=req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success","Listing Deleted!")
    res.redirect("/listings");
};