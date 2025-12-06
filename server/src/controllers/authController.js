// server/src/controllers/authController.js
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";

// ------------------------------------------------------------------
// 1. REGISTER USER
// ------------------------------------------------------------------
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

    // Note: By default, isApproved is false (defined in User model)
    const user = await User.create({
      name,
      email,
      password: hashed,
      role: role || "admin",
      isApproved: false // Explicitly setting false for safety
    });

    const token = generateToken(user._id);

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isApproved: user.isApproved,
      token,
    });
  } catch (err) {
    console.error("Register error:", err.message);
    res.status(500).json({ message: "Server error during registration" });
  }
};

// ------------------------------------------------------------------
// 2. LOGIN USER (Updated with Approval Check)
// ------------------------------------------------------------------
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // ✅ NEW: Check if user is approved
    if (user.isApproved === false) {
      return res.status(403).json({ 
        message: "Account pending approval. Please contact the Super Admin." 
      });
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

// ------------------------------------------------------------------
// 3. VERIFY SECRET (For Secret Register Page)
// ------------------------------------------------------------------
export const verifySecret = (req, res) => {
  try {
    const { secretKey } = req.body;
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

// ------------------------------------------------------------------
// 4. GET PENDING USERS (For Approvals Page)
// ------------------------------------------------------------------
export const getPendingUsers = async (req, res) => {
  try {
    // Find all users where isApproved is false (or undefined)
    const users = await User.find({ isApproved: false }).select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    console.error("Error fetching pending users:", error);
    res.status(500).json({ message: "Error fetching pending users" });
  }
};

// ------------------------------------------------------------------
// 5. APPROVE USER
// ------------------------------------------------------------------
export const approveUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.isApproved = true;
    await user.save();

    res.json({ message: "User approved successfully", user });
  } catch (error) {
    console.error("Error approving user:", error);
    res.status(500).json({ message: "Error approving user" });
  }
};

// ------------------------------------------------------------------
// 6. REJECT USER (Delete)
// ------------------------------------------------------------------
export const rejectUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ message: "User rejected and removed" });
  } catch (error) {
    console.error("Error rejecting user:", error);
    res.status(500).json({ message: "Error rejecting user" });
  }
};