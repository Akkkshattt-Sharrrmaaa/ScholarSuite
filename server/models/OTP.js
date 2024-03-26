const mongoose = require("mongoose")

const otpSchema = new mongoose.Schema({

    otp : {
        type : String,
        required : true,
    },

    createdAt : {
        type : Date,
        default : Date.now(),
        expires : 5*60,
    },

    email : {
        type : String,
        required : true,
    }

})

module.exports = mongoose.model("OTP", otpSchema)