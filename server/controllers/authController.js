import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";
import transporter from "../config/nodemailer.js";
import { EMAIL_VERIFY_TEMPLATE, PASSWORD_RESET_TEMPLATE } from "../config/emailTemplates.js";

// -------------------- Public Routes -------------------- //

// Register User
export const register = async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password)
    return res.json({ success: false, message: "Missing Details" });

  try {
    const existingUser = await userModel.findOne({ email });
    if (existingUser)
      return res.json({ success: false, message: "User already exists!" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new userModel({ name, email, password: hashedPassword });
    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    await transporter.sendMail({
      from: process.env.SENDER_EMAIL,
      to: email,
      subject: "Welcome to MERN Auth App",
      text: `Hello ${name},\n\nWelcome! Your account has been created with email: ${email}`,
    });

    res.json({ success: true, message: "User Registered Successfully" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// Login User
export const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.json({ success: false, message: "Email and Password are required" });

  try {
    const user = await userModel.findOne({ email });
    if (!user)
      return res.json({ success: false, message: "User/Email does not exist!" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.json({ success: false, message: "Incorrect Password" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({ success: true, message: "Login Successful" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// Logout User
export const logout = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    });
    res.json({ success: true, message: "Logout Successful" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// Send Password Reset OTP (public route)
export const sendResetOtp = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.json({ success: false, message: "Email is required" });

  try {
    const user = await userModel.findOne({ email });
    if (!user) return res.json({ success: false, message: "User does not exist" });

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    user.resetOtp = otp;
    user.resetOtpExpireAt = Date.now() + 15 * 60 * 1000; // 15 mins
    await user.save();

    await transporter.sendMail({
      from: process.env.SENDER_EMAIL,
      to: email,
      subject: "Password Reset OTP",
      // text: `Hello ${user.name},\n\nYour OTP is: ${otp}\nValid for 15 minutes.`,
      html: PASSWORD_RESET_TEMPLATE.replace("{{otp}}", otp).replace("{{email}}", user.email)
    });

    res.json({ success: true, message: "Password Reset OTP sent to email" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// Reset Password (public route)
export const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;
  if (!email || !otp || !newPassword)
    return res.json({ success: false, message: "Email, OTP and New Password are required" });

  try {
    const user = await userModel.findOne({ email });
    if (!user) return res.json({ success: false, message: "User does not exist" });

    if (!user.resetOtp || user.resetOtp !== otp)
      return res.json({ success: false, message: "Invalid OTP" });

    if (user.resetOtpExpireAt < Date.now())
      return res.json({ success: false, message: "OTP Expired" });

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetOtp = "";
    user.resetOtpExpireAt = 0;
    await user.save();

    res.json({ success: true, message: "Password has been reset successfully!" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// -------------------- Protected Routes -------------------- //

// Send Verification OTP (requires token)
export const sendVerifyOtp = async (req, res) => {
  try {
    const user = await userModel.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    if (user.isAccountVerified)
      return res.json({ success: false, message: "Account already verified" });

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    user.verifyOtp = otp;
    user.verifyOtpExpireAt = Date.now() + 24 * 60 * 60 * 1000; // 1 day
    await user.save();

    await transporter.sendMail({
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: "Account Verification OTP",
      // text: `Hello ${user.name},\n\nYour OTP is: ${otp}\nValid for 24 hours.`,
      html: EMAIL_VERIFY_TEMPLATE.replace("{{otp}}", otp).replace("{{email}}", user.email)
    });

    res.json({ success: true, message: "Verification OTP sent to email" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// Verify Email (requires token)
export const verifyEmail = async (req, res) => {
  try {
    const { otp } = req.body;
    if (!otp) return res.json({ success: false, message: "Missing OTP" });

    const user = await userModel.findById(req.user.id);
    if (!user) return res.json({ success: false, message: "User does not exist" });

    if (!user.verifyOtp || user.verifyOtp !== otp)
      return res.json({ success: false, message: "Invalid OTP" });

    if (user.verifyOtpExpireAt < Date.now())
      return res.json({ success: false, message: "OTP Expired" });

    user.isAccountVerified = true;
    user.verifyOtp = "";
    user.verifyOtpExpireAt = 0;
    await user.save();

    res.json({ success: true, message: "Account Verified Successfully" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// Check Authenticated User (requires token)
export const isAuthenticated = async (req, res) => {
  res.json({ success: true, message: "User is Authenticated" });
};

// Verify Reset OTP
export const verifyResetOtp = async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.json({ success: false, message: "Email and OTP are required" });
  }

  try {
    const user = await userModel.findOne({ email });
    if (!user) return res.json({ success: false, message: "User does not exist" });

    if (!user.resetOtp || user.resetOtp !== otp) {
      return res.json({ success: false, message: "Invalid OTP" });
    }

    if (user.resetOtpExpireAt < Date.now()) {
      return res.json({ success: false, message: "OTP Expired" });
    }

    res.json({ success: true, message: "OTP verified" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

