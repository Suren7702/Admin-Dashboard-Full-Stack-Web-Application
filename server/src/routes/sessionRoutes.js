import express from "express";
import Session from "../models/Session.js";
import protect from "../middleware/authMiddleware.js"; // your JWT middleware
import adminOnly from "../middleware/adminMiddleware.js"; // super admin check

const router = express.Router();

/**
 * GET /api/sessions
 * Super Admin → View all sessions
 */
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

/**
 * GET /api/sessions/active
 * Super Admin → Only active sessions
 */
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

/**
 * PUT /api/sessions/:id/logout
 * Super Admin → Force logout a session
 */
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
