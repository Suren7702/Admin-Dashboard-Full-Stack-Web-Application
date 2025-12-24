import express from "express";
import { 
  loginUser, 
  registerUser, 
  verifySecret,
  getPendingUsers,
  approveUser,
  rejectUser,
  getMySessions,   // 👈 Add this
  logoutSession    // 👈 Add this
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js"; // 👈 Import your middleware

const router = express.Router();

// Public/Semi-Public Routes
router.post("/login", loginUser);
router.post("/register", registerUser);
router.post("/verify-secret", verifySecret);

// ✅ NEW ROUTES FOR APPROVALS
router.get("/pending", getPendingUsers); 
router.put("/approve/:id", approveUser);
router.delete("/reject/:id", rejectUser);

// ✅ NEW ROUTES FOR SESSION MANAGEMENT
// These must be PROTECTED so we know whose sessions to fetch
router.get("/sessions", protect, getMySessions); 
router.delete("/sessions/:id", protect, logoutSession);
// routes/authRoutes.js
router.delete("/sessions/purge-others", protect, terminateOtherSessions);
export default router;