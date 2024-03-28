const User = require("../models/User")
const OTP = require("../models/OTP")
const Profile = require("../models/Profile")
const otpGenerator = require("otp-generator")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")

// ==================== login handler ========================
exports.logIn = async ( req , res ) => {
    try{

        // 1. get the data
         const {email, password} = req.body;

        // 2. validate the data
        if( !email || !password){
            return res.status(403).json({
                success : false,
                message : "All fields are required",
            })
        }

        // 3. find if user exists or not
        const user = await User.findOne({email}).populate("additionalDetails")
        if( !user ){
            return res.status(401).json({
                success : false,
                message : "User does not exist, please sign up first",
            })
        }

        // 4. check if password is correct
        if( await bcrypt.compare( password , user.password )){
            //  if passwords match create a jwt token
            const payload = {
                id : user._id,
                email : user.email,
                role : user.accountType
            }
            const token = jwt.sign(payload , process.env.JWT_SECRET , {
                expiresIn : "2h",
            })
            user.token = token
            user.password = undefined

            //  create a cookie
            const options = {
                expires : new Date(Date.now() + 3*24*60*60*1000 ),
                httpOnly : true,
            }
            res.cookie("token", token, options).status(200).json({
                 success : true,
                 message : "Logged in successfully",
                 token,
                 user,
            })
        }else{
            return res.status(401).json({
                success : false,
                message : "Password incorrect"
            })
        }

    }catch (error){
        console.log("error");
        return res.status(500).json({
            success : false,
            message : "Unable to login , please try again",
        })
    }
}


// ==================== signup handler =======================
exports.signUp = async ( req, res ) => {
    try{
        // 1. get the data
        const {
            firstName,
            lastName,
            email,
            password,
            confirmPassword,
            accountType,
            contactNumber,
            otp,
        } = req.body;

        // 2. validate the data
        if( !firstName || !lastName || !email || !password || !confirmPassword || !contactNumber || !otp){
            return res.status(403).json({
                success : false,
                message : "All fields are required",
            })
        }
        if( password != confirmPassword ){
            return res.status(400).json({
                success : false,
                message : "Your password and confirm password does not match",
            })
        }

        // 3. check for existing user
        const findExistingUser = await User.findOne({email})
        if( findExistingUser ){
            return res.status(401).json({
                success : false,
                message : "User already exists, please sign in."
            })
        }

        // 4. find the most recent otp
        const recentOtp = await OTP.find({email}).sort({createdAt : -1}).limit(1)

        // 5. validate otp
        if( recentOtp.length == 0 ){
            return res.status(400).json({
                success : false,
                message : "Otp not found"
            })
        }else if ( opt != recentOtp ){
            return res.status(400).json({
                success : false,
                message : "Opt in invalid"
            })
        }

        // 5. hash the password
        const hashedPassword = await bcrypt.hash(password, 10)
        // 6. store in db

        const profileDetails = await Profile.create({
            gender : null,
            dateOfBirth : null,
            about : null,
            contactNumber : null,
        })

        const user = await User.create({
            firstName,
            lastName,
            email,
            password : hashedPassword,
            accountType,
            additionalDetails : profileDetails._id,
            image : `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`
        })

        return res.status(200).json({
            success : true,
            message : "Sign up successful",
            user
        })

    }catch ( error ){
        console.log(error)
        return res.status(500).json({
            success : false,
            message : "Signup failed, try again"
        })
    }
}


// ================ send otp handler =========================-
// ====== this is the second section of the signUp process =====
exports.sendOtp = async ( req, res ) => {
    try{
        // 1. get the email
        const {email} = req.body;

        // 2. check if email already registered
        const findExistingUser = await User.findOne({email})
        if( findExistingUser ){
            return res.status(401).json({
                success : false,
                message : "User already exists"
            })
        }

        // 3. generate the otp
        const otp = otpGenerator.generate(6 , {
            upperCaseAlphabets : false,
            lowerCaseAlphabets : false,
            specialChars : false,
        })

        // 4. check if otp is unique or not
        const findExistingOtp = await OTP.findOne({otp : otp})
        if( findExistingOtp ){
            return res.status(401).json({
                success : false,
                message : "Otp generated was not unique",
            })
        }

        // 5. create otp entry in db
        const otpPayload = {email , otp}
        const otpResponse = await OTP.create(otpPayload)
        console.log(otpResponse)

        return res.status(200).json({
            success : true,
            message : "OTP sent successfully",
            otp,
        })

    }catch( error ){
        console.log(error)
        return res.status(500).json({
            success : false,
            message : error.message,
        })
    }
}


// =============== change password ========================
exports.changePassword = async ( req, res ) => {
    try{

        // 1. get the details from req
        const {email, password, newPassword, confirmPassword} = req.body;

        // 2. validate the information
        if( !email || !password || !newPassword || !confirmPassword ){
            return res.status(403).json({
                success :false,
                message : "All fields are required",
            })
        }

        const user = await User.findOne({email})
        if( !bcrypt.compare( password, user.password)){
            return res.status(401).json({
                success : false,
                message : "Password incorrect, please try again",
            })
        }

        // 3. check if new and confirm password is same or not
        if( newPassword != confirmPassword ){
            return res.status(401).json({
                success : false,
                message : "Your new password does not match confirm password"
            })
        }

        // 4. update the password
        const update = {
            password : newPassword
        }
        const updateUser = await User.findOneAndUpdate({email}, update)
        const updatedUser = await User.findOne({email})

        res.status(200).json({
            success : true,
            message : "Password update successful, you can now login with the new password",
        })

    }catch( error ){
        return res.status(500).json({
            success : false,
            message : "Password change failed, please try again",
        })
    }
}