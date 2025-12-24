import express from "express";
import { 
  loginUser, 
  registerUser, 
  verifySecret,
  getPendingUsers,
  approveUser,
  rejectUser,
  getMySessions,
  logoutSession,
  terminateOtherSessions 
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// ------------------------------------------------------------------
// 1. PUBLIC ROUTES
// ------------------------------------------------------------------
router.post("/login", loginUser);
router.post("/register", registerUser);
router.post("/verify-secret", verifySecret);

// ------------------------------------------------------------------
// 2. ADMIN APPROVAL ROUTES
// ------------------------------------------------------------------
router.get("/pending", getPendingUsers); 
router.put("/approve/:id", approveUser);
router.delete("/reject/:id", rejectUser);

// ------------------------------------------------------------------
// 3. SESSION MANAGEMENT ROUTES (PROTECTED)
// ------------------------------------------------------------------
router.get("/sessions", protect, getMySessions); 

/** * ⚠️ IMPORTANT: "purge-others" MUST come BEFORE ":id" 
 * Otherwise Express treats "purge-others" as a session ID
 */
router.delete("/sessions/purge-others", protect, terminateOtherSessions);

router.delete("/sessions/:id", protect, logoutSession);

export default router;