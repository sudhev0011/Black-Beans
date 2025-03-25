const nodemailer = require('nodemailer');

const testEmail = async () => {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: 'sudhevsureshae@gmail.com',
      pass: 'ugqq pind zrmp zvra',
    },
  });

  try {
    const info = await transporter.sendMail({
      from: '"Black Beans" <sudhevsureshae@gmail.com>',
      to: 'sudhevsuresh0011@gmail.com',
      subject: 'Test Email',
      text: 'This is a test email from Nodemailer',
    });
    console.log('Email sent:', info.messageId);
  } catch (error) {
    console.error('Error:', error);
  }
};

testEmail();