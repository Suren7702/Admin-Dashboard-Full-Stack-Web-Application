// server/src/routes/boothRoutes.js
import express from "express";
import Booth from "../models/boothModel.js";
import { protect } from "../middleware/authMiddleware.js"; // already irukum

const router = express.Router();

// GET /api/booths?district=Trichy
router.get("/", protect, async (req, res) => {
  try {
    const { district } = req.query;
    const query = {};
    if (district) query.district = district;

    const booths = await Booth.find(query);
    res.json(booths);
  } catch (error) {
    console.error("Error fetching booths", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
