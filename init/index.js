const mongoose = require("mongoose");
const initdata =require("./data.js");

const Listing = require("../models/listing.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";
async function main(){
    await mongoose.connect(MONGO_URL);
}
main().then(()=>{
    console.log("connection established with database");
}).catch((err)=>{
    console.log(err);
})

//adding random data to db
const initDB = async()=>{
    await Listing.deleteMany({});
    Listing.insertMany(initdata.data);
}

initDB();