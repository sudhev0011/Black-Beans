const mailSender = require('../nodemailer/mailSender');

const sendEmailResetMail = async (email, otp) => {
    console.log("sendEmailResetMail", email);
    try {
        const mailResponse = await mailSender(
            email,
            "☕ Black Beans - Reset Your Email",
            `
            <div style="font-family: 'Arial', sans-serif; max-width: 600px; margin: auto; background-color: #f7f7f7; padding: 25px; border-radius: 12px; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);">
                
                <!-- Logo -->
                <div style="text-align: center; padding-bottom: 20px;">
                    <img src="https://img.freepik.com/free-vector/coffee-shop-logo-food-business-template-branding-design-vector-espresso-yourself-text_53876-136278.jpg?t=st=1742745469~exp=1742749069~hmac=6df45cfbe1026423b15b97543c36adedbd398f2f18732e474454f43bc02b416b&w=1380" alt="Black Beans Logo" style="max-width: 150px;">
                </div>

                <!-- Heading -->
                <h2 style="color: #114639; text-align: center; font-size: 24px; font-weight: bold;">Welcome to Black Beans! ☕</h2>
                
                <!-- Message -->
                <p style="color: #333; font-size: 16px; text-align: center;">
                    Thank you for signing up with <strong>Black Beans</strong>! To complete your registration, please verify your email within the next <strong>60 seconds</strong> using the OTP below:
                </p>
                
                <!-- OTP Code -->
                <div style="text-align: center; margin: 20px 0;">
                    <span style="display: inline-block; background-color: #114639; color: #fff; font-size: 24px; font-weight: bold; padding: 12px 25px; border-radius: 8px; letter-spacing: 2px;">
                        ${otp}
                    </span>
                </div>

                <!-- Countdown Bar -->
                <div style="text-align: center; margin: 20px 0;">
                    <p style="font-size: 14px; color: #d9534f; font-weight: bold;">Expires in 1 minute</p>
                    <div style="width: 100%; background-color: #ddd; border-radius: 8px;">
                        <div style="width: 100%; height: 8px; background-color: #d9534f; border-radius: 8px; transition: width 60s linear;"></div>
                    </div>
                </div>

                <!-- Call-to-Action Button -->
                <div style="text-align: center; margin-top: 30px;">
                    <a href="https://yourwebsite.com/verify" 
                       style="background-color: #114639; color: #fff; padding: 12px 25px; text-decoration: none; font-size: 16px; border-radius: 6px; display: inline-block;">
                        Verify My Email
                    </a>
                </div>
                
                <!-- Footer -->
                <hr style="margin: 30px 0; border: none; border-top: 1px solid #ccc;">
                <p style="font-size: 12px; color: #777; text-align: center;">
                    ☕ Black Beans - Bringing you the best coffee experiences.<br>
                    This email was sent from an unmonitored address. Please do not reply.
                </p>
            </div>
            `
        );
        console.log("email sent for email reset");
    } catch (error) {
        console.log("Error in verification mail response", error);
    }
};

module.exports = sendEmailResetMail;
