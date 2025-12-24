import express from "express";
import Session from "../models/Session.js";
import { protect } from "../middleware/authMiddleware.js";
import adminOnly from "../middleware/adminMiddleware.js";

const router = express.Router();

// 🔍 Get ALL sessions (Super Admin only)
router.get("/", protect, adminOnly, async (req, res) => {
  try {
    const sessions = await Session.find()
      .populate("user", "name email role")
      .sort({ lastActive: -1 });

    res.json(sessions);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch sessions" });
  }
});

// 🟢 Get ACTIVE sessions only
router.get("/active", protect, adminOnly, async (req, res) => {
  try {
    const sessions = await Session.find({ isActive: true })
      .populate("user", "name email role")
      .sort({ lastActive: -1 });

    res.json(sessions);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch active sessions" });
  }
});

// ❌ Force logout a session
router.put("/:id/logout", protect, adminOnly, async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    session.isActive = false;
    await session.save();

    res.json({ message: "Session logged out successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to logout session" });
  }
});

export default router;
