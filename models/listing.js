const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review.js")

//model Schema
const listingSchema = new Schema({
    title : {
        type :String,
        required : true
    },
    description : String,
    image : {
        type : String,
        default : "https://images.unsplash.com/photo-1580477667995-2b94f01c9516?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjB8fG5hcnV0b3xlbnwwfHwwfHx8MA%3D%3D",
        set : (v) => v===""?"https://images.unsplash.com/photo-1580477667995-2b94f01c9516?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjB8fG5hcnV0b3xlbnwwfHwwfHx8MA%3D%3D" : v
    },
    price: Number,
    location : String,
    country : String,
    reviews : [
        {
            type : Schema.Types.ObjectId,
            ref : "Review"
        },
    ]
});



listingSchema.post("findOneAndDelete",async(a)=>{
    if(a){
        await Review.deleteMany({_id : {$in : a.reviews}});
    }
})

//model
const Listing = mongoose.model("Listing",listingSchema);


//exportin model
module.exports = Listing;