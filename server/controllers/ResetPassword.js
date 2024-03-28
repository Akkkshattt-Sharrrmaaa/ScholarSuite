const { PassThrough } = require("nodemailer/lib/xoauth2");
const User = require("../models/User")
const mailSender = require("../utils/mailSender")
const bcrypt = require("bcrypt")

// reset password token
exports.resetPassToken = async ( req, res ) => {
    try{

        const {email} = req.body;

        const user = await User.findOne({email})
        if( !user ){
            return res.status(401).json({
                success : false,
                message : "User not registered"
            })
        }

        const token = crypto.randomUUID()
        const updatedUser = await User.findOneAndReplace({email},
                                                            {
                                                                token : token,
                                                                resetPassExpires : Date.now() + 5*60*1000,
                                                            }, {new : true})

        const url = `http://localhost:3000/update-password/${token}`

        await mailSender(email,
            `Password reset link : ${url}`,
            'Reset Passwork | Scholar Suite')

        return res.json({
            success : true,
            message : "Kindly check your email for the reset link "
        })

    }catch( error ){
        return res.status(500).json({
            success : false,
            message : "Something went wrong while sending reset password link"
        })
    }
}

exports.resetPass = async ( req, res ) => {
    try{
        // 1. get the data
        // note that we sent the token in url and not in body so the task of puting it in body is done by the frontend
        const {token, resetPassword, confirmResetPassword} = res.body;

        // 2. perform validation
        if(!token || !resetPassword || !confirmResetPassword){
            return res.status(403).json({
                success : false,
                message : "All the fields are required"
            })
        }
        if( resetPassword != confirmResetPassword ){
            return res.status(401).json({
                success : false,
                message : "Reset password and confirm password do not match"
            })
        }

        // 3. get the user who's password is to be changed
        const user = await User.findOne({token})

        // 4. what if user does not exist
        if ( !user ){
            return res.status(400).json({
                success : false,
                message : "User not found / token invalid"
            })
        }

        // 5. check if reset time is valid
        if( user.resetPassExpires < Date.now()){
            return res.status(400).json({
                success : false,
                message : "Token expired, please regenerate the reset token"
            })
        }

        // 6. hash the password
        const hashedPassword = await bcrypt.hash(resetPassword , 10)

        // 7. replace and store the password
        const updatedUser = await User.findOneAndReplace({token}, {password : hashedPassword}, {new: true})

        return res.status(200).json({
            success : true,
            message : "Password changed successfully, use your new password to log in"
        })

    }catch ( error ){
        return res.status(500).json({
            success : false,
            message : "Unable to reset password, please try again" 
        })
    }
}