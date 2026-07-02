const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// TEST EMAIL ROUTE — admin only, sends a test email to verify credentials
router.post('/email', protect, adminOnly, async (req, res) => {
  try {
    const { to } = req.body;
    if (!to) return res.status(400).json({ message: 'to email required' });

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      return res.status(500).json({
        message: 'EMAIL_USER or EMAIL_PASS not set in environment variables',
        EMAIL_USER_SET: !!process.env.EMAIL_USER,
        EMAIL_PASS_SET: !!process.env.EMAIL_PASS
      });
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
    });

    await transporter.verify();
    await transporter.sendMail({
      from: `"CineVerse Test" <${process.env.EMAIL_USER}>`,
      to,
      subject: '✅ CineVerse Email Test',
      html: '<h2 style="color:#ff004f">Email is working!</h2><p>Your email configuration is correct.</p>'
    });

    res.json({ message: `Test email sent to ${to}`, success: true });
  } catch (error) {
    res.status(500).json({
      message: 'Email test failed',
      error: error.message,
      hint: error.message.includes('Invalid login') || error.message.includes('Username and Password')
        ? 'Wrong Gmail App Password. Generate a new one at myaccount.google.com/apppasswords'
        : error.message.includes('Less secure')
        ? 'Enable 2FA and use App Password, not regular password'
        : 'Check EMAIL_USER and EMAIL_PASS in Render environment variables'
    });
  }
});

module.exports = router;
