const mongoose = require("mongoose")
const mailSender = require("../utils/mailSender")

const otpSchema = new mongoose.Schema({

    email : {
        type : String,
        required : true,
    },

    otp : {
        type : String,
        required : true,
    },

    createdAt : {
        type : Date,
        default : Date.now(),
        expires : 5*60,
    }
})

async function sendVerificationEmail(email, otp){
    try{

        const mailResponse = await mailSender(email, otp , "Verification Mail" )
        console.log(mailResponse)

    }catch(error){
        console.log("Error in sending mail");
        console.log(error)
    }
}

otpSchema.pre("save", async function(next){
    sendVerificationEmail(this.email , this.otp);
    next();
})

module.exports = mongoose.model("OTP", otpSchema)