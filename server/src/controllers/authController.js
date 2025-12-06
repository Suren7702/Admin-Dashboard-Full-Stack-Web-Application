// server/src/controllers/authController.js
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";

// POST /api/auth/register
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashed,
      role: role || "admin",
    });

    const token = generateToken(user._id);

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token,
    });
  } catch (err) {
    console.error("Register error:", err.message);
    res.status(500).json({ message: "Server error during registration" });
  }
};

// POST /api/auth/login
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = generateToken(user._id);

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token,
    });
  } catch (err) {
    console.error("Login error:", err.message);
    res.status(500).json({ message: "Server error during login" });
  }
};

// ✅ ADD THIS FUNCTION AT THE BOTTOM
// POST /api/auth/verify-secret
export const verifySecret = (req, res) => {
  try {
    const { secretKey } = req.body;

    // Make sure this matches the variable name in your .env file
    // If .env is missing, it falls back to the string on the right (for testing)
    const ADMIN_SECRET = process.env.ADMIN_SECRET_KEY || "tvk_admin_secret_123";

    if (secretKey === ADMIN_SECRET) {
      return res.status(200).json({ valid: true, message: "Key Verified" });
    } else {
      return res.status(401).json({ valid: false, message: "Invalid Secret Key" });
    }
  } catch (error) {
    console.error("Secret verification error:", error);
    res.status(500).json({ message: "Server error verifying key" });
  }
};