// server/src/routes/authRoutes.js
import express from "express";
import { loginUser, registerUser } from "../controllers/authController.js";

const router = express.Router();

router.post("/login", loginUser);
router.post("/register", registerUser); // not used yet on frontend, but ok

export default router;
