const express = require("express");
const {
  register,
  login,
  getMe,
  verifyEmail,
} = require("../controllers/authController");
const { protect } = require("../middleware/auth");

const authRoutes = express.Router();

authRoutes.post("/register", register);
authRoutes.post("/login", login);
authRoutes.get("/me/:id", protect, getMe);
authRoutes.get("/verify-email/:token", verifyEmail);

module.exports = authRoutes;
