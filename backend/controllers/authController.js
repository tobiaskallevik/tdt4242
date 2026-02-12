// Auth controller – handles register, login, password reset
// Solves Req 1 (account creation), Req 2 (secure login), Req 3 (password reset)
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { Op } = require('sequelize');
const { User, PasswordResetToken } = require('../models');
const nodemailer = require('nodemailer');
require('dotenv').config();

// Solves Req 1 – Student account creation linked to university email
const register = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate university email domain
    if (!email || !email.endsWith('.edu') && !email.endsWith('.no') && !email.includes('.ac.')) {
      return res.status(400).json({
        error: 'A valid university email address is required',
      });
    }

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const password_hash = await bcrypt.hash(password, 12);
    const user = await User.create({ email, password_hash });

    return res.status(201).json({
      id: user.id,
      email: user.email,
      role: user.role,
    });
  } catch (err) {
    next(err);
  }
};

// Solves Req 2 – Secure login functionality
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
    );

    return res.json({ token, user: { id: user.id, email: user.email, role: user.role } });
  } catch (err) {
    next(err);
  }
};

// Solves Req 3 – Password reset – request a reset token via email
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) {
      // Return 200 even if user not found to prevent email enumeration
      return res.json({ message: 'If the email exists, a reset link has been sent.' });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expires_at = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await PasswordResetToken.create({ user_id: user.id, token, expires_at });

    // Send email with reset link
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });

    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${token}`;

    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: email,
      subject: 'AI Guidebook – Password Reset',
      text: `Reset your password using this link (valid for 1 hour): ${resetUrl}`,
    });

    return res.json({ message: 'If the email exists, a reset link has been sent.' });
  } catch (err) {
    next(err);
  }
};

// Solves Req 3 – Password reset – apply new password with valid token
const resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;

    const record = await PasswordResetToken.findOne({
      where: { token, expires_at: { [Op.gt]: new Date() } },
    });

    if (!record) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    const password_hash = await bcrypt.hash(newPassword, 12);
    await User.update({ password_hash }, { where: { id: record.user_id } });

    // Remove used token
    await PasswordResetToken.destroy({ where: { id: record.id } });

    return res.json({ message: 'Password has been reset successfully' });
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, forgotPassword, resetPassword };
