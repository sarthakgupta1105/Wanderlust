const express = require("express");
const router = express.Router();
const Listing = require("../models/listing.js")
const wrapAsync = require("../utils/wrapAsync.js");
const expressError = require("../utils/expressError.js");
const {isLoggedIn,isOwner}=require("../middlewares.js");
const{validateListing}=require("../middlewares.js")
const listingController = require("../controllers/listing.js");
const multer = require("multer")
const {storage} = require("../cloudConfig.js");
const upload = multer({ storage });

router.route("/")
    .get(listingController.index) //Index Route
    .post(isLoggedIn,upload.single("listing[image]"),validateListing, wrapAsync(listingController.createListing))//Create Route
    // .post(upload.single("listing[image]"),(req,res)=>{
    //     res.send(req.file);
    // })

//New Route
router.get("/new",isLoggedIn,listingController.renderNewForm);

router.route("/:id")
    .get(wrapAsync(listingController.show))//Show Route
    .put(isOwner,upload.single("listing[image]"),validateListing,wrapAsync(listingController.updateListing))//Update Route
    .delete(isLoggedIn,isOwner,wrapAsync(listingController.destroyListing))//Delete Route

//Edit Route
router.get("/:id/edit",isLoggedIn,isOwner,wrapAsync(listingController.renderEditForm));

module.exports = router;