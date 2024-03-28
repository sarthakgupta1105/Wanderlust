const User = require("../models/user");

module.exports.renderSignUpForm = (req,res)=>{
    res.render("./user/signup.ejs");
};

module.exports.signUpUser = async(req,res)=>{
    try{
        let {username,email,password}=req.body;
        let newUser = new User({
        username:username,
        email:email,
        })
        let registeredUser = await User.register(newUser,password);//passing of pw
        // console.log(registeredUser);
        req.login(registeredUser,((err)=>{//used to signup and login simultaneously
            if(err){
                return next(err);
            }
            req.flash("success","Welcome to WanderLust!");
            res.redirect("/listings");
        }))
    }catch(err){//for error handling if user already exists
        req.flash("error","Username already exist");
        res.redirect("/signup");
    }
    
};

module.exports.renderLoginForm =(req,res)=>{
    res.render("./user/login.ejs");
};

module.exports.logInUser = async(req,res)=>{
    // console.log(req.session);//after logging(authenticate) in passport will reset req.session
    // console.log(res.locals);
    req.flash("success","Welcome back to WanderLust");
    let redirectUrl = res.locals.redirectUrl || "/listings"//isLoggedIn cannot be used here if 
    res.redirect(redirectUrl);//used then to login we have to be loggedin
} ;

module.exports.logOutUser = (req,res,next)=>{
    req.logOut((err)=>{
        if(err){
            return next(err);
        }
        req.flash("success","Logged Out!")
        res.redirect("/listings")
    })
} 