const nodemailer = require("nodemailer")
require("dotenv").config()

const mailSender = async (email, body, title) => {
    try{

        const transporter = nodemailer.createTransport({
            host : process.env.MAIL_HOST,
            auth : {
                user : process.env.MAIL_USER,
                pass : process.env.MAIL_PASS,
            },
        })

        const info = await transporter.sendMail({
            from : 'Scholar Suite | Akshat Sharma',
            to : `${email}`,
            subject : `${title}`,
            html : `${body}`
        })

        console.log(info)

        return info;

    }catch( error ){
        console.log("error in mail sender utility")
        console.log(error.message);
    }
}

module.exports = mailSender;