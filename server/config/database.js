const mongoose = require("mongoose")
require("dotenv").config()

exports.connectDb = () => {

    mongoose.connect( process.env.DATABASE_URL, {
        useNewUrlParser : true,
        useUnifiedTopology : true,
    })
    .then( ()=>{
        console.log("Db connection successful")
    })
    .catch( (error)=>{
        console.log("Db connection failed")
        console.error(error)
        process.exit(1)
    })
}