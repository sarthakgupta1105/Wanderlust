if(process.env.NODE_ENV != "production"){
    require('dotenv').config()
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
// let MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust"
let dbUrl = process.env.ATLAS_URL;
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const expressError = require("./utils/expressError.js");
const session = require("express-session");
const MongoStore = require("connect-mongo");//session mongo
const flash = require("connect-flash");
const passport = require("passport");//passport
const LocalStrategy = require("passport-local");//strategy
const User = require("./models/user.js");
const listingRouter = require("./routes/listings.js")
const reviewRouter = require("./routes/review.js")
const userRouter = require("./routes/user.js");

async function main(){
    await mongoose.connect(dbUrl);
}
main()
    .then(()=>{console.log("connection to db successful")})
    .catch(err=>console.log(err));

app.set("viewengine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.engine('ejs',ejsMate);//new
app.use(express.static(path.join(__dirname,"public")));

const store = MongoStore.create({
    mongoUrl:dbUrl,
    crypto:{
        secret:process.env.SECRET,
    },
    touchAfter:24*3600,
})

const sessionOptions = {
    store:store,
    secret: process.env.SECRET,
    resave:false,
    saveUninitialized:true,
    cookie:{
        expires:Date.now()+7*24*60*60*1000,
        maxAge:7*24*60*60*1000,
        httpOnly:true,
    }
};

store.on("error",()=>{
    console.log("SOME ERROR IN SESSIONS",error);
})

//Home Route
// app.get("/",(req,res)=>{
//     res.send("Hi,I am root");
// })    


app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());//
app.use(passport.session());//

passport.use(new LocalStrategy(User.authenticate()));//here we define the
passport.serializeUser(User.serializeUser());//static functions for 
passport.deserializeUser(User.deserializeUser());//passport-local-mongoose using strategy constructor

//very-important reference for working of flash<---flash are always used with redirect--->
//this middleware send successMsg with every request/route with value acquired
//from previous route req.flash("success","------") before redirect
//this successMsg is sent to flash.ejs because it is inlcuded in boilerplate
//boilerplate is included everywhere so flash occurs if successMsg has some length 
//& it exists 
app.use((req,res,next)=>{
    res.locals.successMsg = req.flash("success");
    res.locals.errorMsg = req.flash("error");
    res.locals.currUser = req.user;
    next();
})

// app.get("/demouser",async(req,res)=>{
//     fakeUser ={
//         email:"student@gmail.com",
//         username:"delta-student",
//     }

//     let registeredUser = await User.register(fakeUser,"helloworld");
//     res.send(registeredUser);
// })

app.use("/listings",listingRouter);
app.use("/listings/:id/reviews",reviewRouter)
app.use("/",userRouter)


// No matching
app.all("*",(req,res,next)=>{
    next(new expressError(404,"Page not found!"));
})

//Error Handling Middleware
app.use((err,req,res,next)=>{
    let {statuscode=500,message="Something went Wrong!"}=err;
    res.status(statuscode).render("error.ejs",{message});
})

app.listen(8080,()=>{
    console.log("app is listening to port 8080");
})


