import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  getMembers,
  createMember,
  updateMember,
  deleteMember,
  getTeamNames,
  getMemberStats,
  getMaanaduMembers,
} from "../controllers/memberController.js";

const router = express.Router();

router.get("/", protect, getMembers);
router.post("/", protect, createMember);
router.put("/:id", protect, updateMember);
router.delete("/:id", protect, deleteMember);

router.get("/teams", protect, getTeamNames);
router.get("/stats", protect, getMemberStats);
router.get("/maanadu", protect, getMaanaduMembers); // 🔥

export default router;
