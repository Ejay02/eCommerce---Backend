/* eslint-disable no-console */
/* eslint-disable no-unused-vars */

const nodemailer = require('nodemailer');
const asyncHandler = require('express-async-handler');

const sendEmail = asyncHandler(async (data, req, res) => {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // Use `true` for port 465, `false` for all other ports
    auth: {
      user: process.env.EMAIL_ID,
      pass: process.env.EMAIL_PASSWORD
    }
  });

  async function main() {
    const info = await transporter.sendMail({
      from: '"BuyZone" <no-reply@gmail.com>',
      to: data.to,
      subject: data.subject,
      text: data.text,
      html: data.html
    });
  }

  main().catch(console.error);
});

module.exports = sendEmail;
