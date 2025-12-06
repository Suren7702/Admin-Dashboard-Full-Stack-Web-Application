// server/src/routes/authRoutes.js
import express from "express";
import { 
  loginUser, 
  registerUser, 
  verifySecret // 👈 Import the new function
} from "../controllers/authController.js";

const router = express.Router();

router.post("/login", loginUser);
router.post("/register", registerUser);

// ✅ Add this route to fix the error
router.post("/verify-secret", verifySecret);

export default router;