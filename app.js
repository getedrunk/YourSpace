const express = require("express");
const app = express();

//for put patch delete requests
const methodoverride = require("method-override");
app.use(methodoverride("_method"));



const path = require("path");
//for express,where to look for
app.set("views",path.join(__dirname,"views"));
//for ejs templetes
app.set("view engine","ejs");

//for logic and styling
app.use(express.static(path.join(__dirname,"/public")));

//for parsing data 
app.use(express.urlencoded({extended : true}));

const mongoose = require("mongoose");
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
//model
const Listing = require("./models/listing.js");
const Review = require("./models/review.js");

//error(hoppscoth)
const wrapAsync = require("./utils/wrapAsync.js")
const ExpressError = require("./utils/ExpressError.js")

//server validation for reviews
const {reviewSchema} = require("./schema.js")


const  ejsMate = require("ejs-mate");
app.engine('ejs',ejsMate);

app.listen(8080,()=>{
    console.log("server is runnig");
});

//function to be as middleware for review validation servers side

const validateReview = (req,res,next)=>{
    let {error} = reviewSchema.validate(req.body);
    if(error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400,errMsg);
    }else{
        next();
    }
}

//root directory
app.get("/",(req,res)=>{
    res.send("hello")
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


//index route-show all aviable listings
app.get("/listings",async (req,res)=>{
   const listings = await Listing.find({});
   res.render("listings/index.ejs",{listings});
});

//create  route 
app.get("/listings/new",(req,res)=>{
    res.render("listings/new.ejs");
});

//show route (Read)-for each individual
app.get("/listings/:id",(async(req,res)=>{
    let {id} = req.params;
    let obj = await Listing.findById(id);
    res.render("listings/show.ejs",{obj});
}));


    //adding to database from new.ejs form
app.post("/listings",wrapAsync(async(req,res,next)=>{
        const lis = req.body;
        const user = new Listing({
        title : lis.title,
        description : lis.description,
        image: lis.image,
        price : lis.price,
        location : lis.location,
        country : lis.country
        });
        if(!req.body){
            throw new ExpressError(400,"send valid data for listing")
        }
        const ans = await user.save();
        res.redirect("/listings");
}));

//edit route
app.get("/listings/:id/edit",wrapAsync(async(req,res)=>{
    let {id} = req.params;
    const obj = await Listing.findById(id);
    res.render("listings/edit.ejs",{obj})
}))
//updating the database
app.put("/listings/:id",wrapAsync(async (req,res)=>{
    let {id} = req.params;
    const updatedlis = req.body;
    if(!req.body.title){
        throw new ExpressError(400,"send valid data for listing")
    }
    await Listing.findByIdAndUpdate(id,updatedlis);
    res.redirect(`/listings/${id}`);
}))
//delete route
app.delete("/listings/:id",wrapAsync(async(req,res)=>{
    let {id} = req.params;
    await Listing.findByIdAndDelete(id);
    res.redirect("/listings");
}));


//adding review for individial listings
app.post("/listings/:id/reviews",validateReview,wrapAsync(async(req,res)=>{
    let lis = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);

    lis.reviews.push(newReview);

    await newReview.save();
    await lis.save();

    console.log("new review savd");
    res.redirect(`/listings/${lis._id}`);

}));

app.use((req,res,next)=>{
    next(new ExpressError(404,"page Not Found"));
})

app.use((err,req,res,next)=>{
    let{statusCode = 500,message = "Something went Wrong"} = err;
    res.status(statusCode).render("error.ejs",{message});
})

