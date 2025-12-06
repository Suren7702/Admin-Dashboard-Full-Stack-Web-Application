import express from "express";
import { 
  loginUser, 
  registerUser, 
  verifySecret,
  getPendingUsers, // 👈 Import these
  approveUser,
  rejectUser
} from "../controllers/authController.js";

const router = express.Router();

router.post("/login", loginUser);
router.post("/register", registerUser);
router.post("/verify-secret", verifySecret);

// ✅ NEW ROUTES FOR APPROVALS
router.get("/pending", getPendingUsers); 
router.put("/approve/:id", approveUser);
router.delete("/reject/:id", rejectUser);

export default router;