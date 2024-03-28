const jwt = require("jsonwebtoken")
require("dotenv").config()
const User = require("../models/User")

// auth
exports.auth = async ( req, res, next ) => {
    try{

        // 1. get the token
        const token = req.cookeis.token || req.body.token || req.header("Authorisation").replace("Bearer ", "")

        if( !token ){
            return res.status(401).json({
                success : false,
                message : "Token not found, please try again"
            })
        }

        // 2. decode/verify the token
        try{

            const decode = await jwt.verify( token , process.env.JWT_SECRET )
            req.user = decode

        }catch( error ){
            return res.status(401).json({
                success : false,
                message : "Token verification failed, please try again"
            })
        }

        //  call the next middleware
        next();

    }catch (error ){
        return res.status(500).json({
            success : false,
            message : "Authentication failed, please try again"
        })
    }
}

// is Student
exports.isStudent = async ( req, res, next ) => {
    try{

        const role = req.user.role
        if( role != "Student"){
            return res.status(401).json({
                success : false,
                message : "You are not authorised to access this students route"
            })
        }

        next();

    }catch( error ){
        return res.status(401).json({
            success : false,
            message : "This is protected route for students, you cannot access it."
        })
    }
}

// is Instructor
exports.isInstructor = async ( req, res, next ) => {
    try{
        const role = req.user.role
        if( role != "Instructor"){
            return res.status(401).json({
                success : false,
                message : "You are not authorised to access this instrctors route"
            })
        }

        next();

    }catch( error ){
        return res.status(401).json({
            success : false,
            message : "This is protected route for instructors, you cannot access it."
        })
    }
}

// is Admin
exports.isAdmin = async ( req, res, next ) => {
    try{
        const role = req.user.role
        if( role != "Admin"){
            return res.status(401).json({
                success : false,
                message : "You are not authorised to access this admin route"
            })
        }

        next();

    }catch( error ){
        return res.status(401).json({
            success : false,
            message : "This is protected route for admins, you cannot access it."
        })
    }
}