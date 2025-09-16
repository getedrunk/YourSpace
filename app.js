const express = require("express");
const app = express();
//for put patch delete requests
const methodoverride = require("method-override");
//for express,where to look for
const path = require("path");
//ejs-templetes
const  ejsMate = require("ejs-mate");
//for connecting to database
const mongoose = require("mongoose");
//error handling
const ExpressError = require("./utils/ExpressError.js")
//routes for listings and reviews
const listings = require("./routes/listing.js");
const review = require("./routes/review.js");
//for session
const session = require("express-session");
//for flash messages
const flash = require("connect-flash");




app.set("views",path.join(__dirname,"views"));
//for ejs templetes
app.set("view engine","ejs");
//for logic and styling(public files)
app.use(express.static(path.join(__dirname,"/public")));
//for parsing data 
app.use(express.urlencoded({extended : true}));
//method-override alias put,delete.patch
app.use(methodoverride("_method"));
//use ejs-mate when .ejs files are rendered(layouts);
app.engine('ejs',ejsMate);

const ses = {
    secret : "Pass123$",
    resave : false,
    saveUninitialized : true,
    cookie : {
        expires : Date.now()+7*24*60*1000,
        maxAge : 7*24*60*1000,
        httpOnly : true
    }
    
}

app.use(session(ses));
app.use(flash());

//flash then-> routes

app.use((req,res,next)=>{
    //for accesssing varianles in templetes
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    next();
})

//to use the routes
app.use("/listings",listings);
app.use("/listings/:id/reviews",review);



//connecting to database
const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";
async function main(){
    await mongoose.connect(MONGO_URL);
}
main().then(()=>{
    console.log("connection established with database");
}).catch((err)=>{
    console.log(err);
})
//root directory
app.get("/",(req,res)=>{
    res.send("hello")
});


app.listen(8080,()=>{
    console.log("server is runnig");
});

//testing connection with the database and wether data is  adding to db or not
// app.get("/testListing",async(req,res)=>{
//     let sample = new Listing({
//         title :"new villa",
//         description : "villa for a family",
//         //image:""
//         price: 3000,
//         location : "toystory",
//         country : "India"
//     });
//     await sample.save();
//     console.log("sample was saved");
//     res.send("sucefful testing");
// });


app.use((req,res,next)=>{
    next(new ExpressError(404,"page Not Found"));
})

app.use((err,req,res,next)=>{
    let{statusCode = 500,message = "Something went Wrong"} = err;
    res.status(statusCode).render("error.ejs",{message});
})





