const nodemailer = require('nodemailer')
const dotenv= require('dotenv')
dotenv.config()

const mailSender = async(email,title, body)=>{
    console.log("entered the mailsender");
    
    try {
        //create a transporter to send emails
        let transporter = nodemailer.createTransport({
            host: process.env.MAIL_HOST,
            secure: false,
            port: 587,
            auth:{
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS
            }
        })
        console.log("about to sent the mail to", email);
        
        //SEND EMAIL TO USERS
        let info = await transporter.sendMail({
            from: "sudhevsureshae@gmail.com",
            to: email,
            subject: title,
            html: body
        });

        console.log('Email sent:', info.messageId);
        
       
        return info
    } catch (error) {
        console.log("this is the error from mailsender");
        
        console.log(error.message);
        
    }
}

module.exports = mailSender