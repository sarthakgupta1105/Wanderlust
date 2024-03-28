const mongoose = require("mongoose");
let MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust"
const Listing = require("../models/listing.js");
let initData = require("./data.js");

async function main(){
    await mongoose.connect(MONGO_URL);
}
main()
    .then(()=>{console.log("connection to db successful")})
    .catch(err=>console.log(err));

async function initDB(){
    await Listing.deleteMany({});
    initData.data = initData.data.map((obj)=>({...obj,owner:"65f65ca2c677bc759e077a85"}))
    await Listing.insertMany(initData.data);
    console.log("Data Saved");
};

initDB();