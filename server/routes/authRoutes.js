import express from "express";
import {
  register,
  login,
  logout,
  sendResetOtp,
  resetPassword,
  sendVerifyOtp,
  verifyEmail,
  isAuthenticated,
  verifyResetOtp
} from "../controllers/authController.js";
import { userAuth } from "../middleware/userAuth.js";

const router = express.Router();

// Public routes
router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.post("/send-reset-otp", sendResetOtp);   // ✅ public
router.post("/reset-password", resetPassword);  // ✅ public

router.post("/reset-password-verify-otp", verifyResetOtp);

// Protected routes
router.post("/send-verify-otp", userAuth, sendVerifyOtp);
router.post("/verify-account", userAuth, verifyEmail);
router.get("/is-auth", userAuth, isAuthenticated);

export default router;
