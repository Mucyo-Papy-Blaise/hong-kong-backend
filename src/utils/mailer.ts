import nodemailer from 'nodemailer';

// Make sure dotenv is loaded
import dotenv from 'dotenv';
dotenv.config();

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST, // smtp.gmail.com
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false, // true for 465, false for 587
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS, // Gmail App Password
  },
  tls: {
    rejectUnauthorized: false, // ignore self-signed certs (optional)
  },
});

// Test the connection once on startup
transporter.verify((err, success) => {
  if (err) {
    console.error('SMTP connection error:', err);
  } else {
    console.log('SMTP connected successfully');
  }
});

// Function to send email
export const sendEmail = async (to: string, subject: string, html: string) => {
  try {
    const info = await transporter.sendMail({
      from: `"Your Company" <${process.env.MAIL_FROM}>`,
      to,
      subject,
      html,
    });
    console.log('Email sent: ', info.messageId);
    return info;
  } catch (err) {
    console.error('Error sending email:', err);
    throw err; // propagate to caller
  }
};
