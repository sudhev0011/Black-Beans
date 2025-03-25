const mailSender = require('../nodemailer/mailSender');

const sendResetPasswordMail = async (email, otp) => {
    try {
        await mailSender(
            email,
            "☕ Black Beans - Password Reset Request",
            `
            <div style="font-family: 'Arial', sans-serif; max-width: 600px; margin: auto; background-color: #f7f7f7; padding: 25px; border-radius: 12px; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);">
                
                <!-- Logo -->
                <div style="text-align: center; padding-bottom: 20px;">
                    <img src="https://img.freepik.com/free-vector/coffee-shop-logo-food-business-template-branding-design-vector-espresso-yourself-text_53876-136278.jpg?t=st=1742745469~exp=1742749069~hmac=6df45cfbe1026423b15b97543c36adedbd398f2f18732e474454f43bc02b416b&w=1380" alt="Black Beans Logo" style="max-width: 150px;">
                </div>

                <!-- Heading -->
                <h2 style="color: #114639; text-align: center; font-size: 24px; font-weight: bold;">Reset Your Password</h2>
                
                <!-- Message -->
                <p style="color: #333; font-size: 16px; text-align: center;">
                    We received a request to reset your password for your <strong>Black Beans</strong> account.
                    Please use the OTP code below to proceed:
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
                    <a href="https://yourwebsite.com/reset-password" 
                       style="background-color: #114639; color: #fff; padding: 12px 25px; text-decoration: none; font-size: 16px; border-radius: 6px; display: inline-block;">
                        Reset Password
                    </a>
                </div>

                <!-- Footer -->
                <hr style="margin: 30px 0; border: none; border-top: 1px solid #ccc;">
                <p style="font-size: 12px; color: #777; text-align: center;">
                    ☕ Black Beans - Crafted with passion for coffee lovers.<br>
                    This email was sent from an unmonitored address. Please do not reply.
                </p>
            </div>
            `
        );
        console.log("Reset password email sent"); 
    } catch (error) {
        console.log("Error in sending reset password email", error);
    }
};

module.exports = sendResetPasswordMail;
