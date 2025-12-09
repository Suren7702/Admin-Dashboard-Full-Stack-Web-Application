// server/src/routes/boothRoutes.js
import express from "express";
import Booth from "../models/boothModel.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// POST /api/booths  – add new booth
router.post("/", protect, async (req, res) => {
  try {
    const {
      name,
      code,
      district,
      taluk,
      village,
      latitude,
      longitude,
      votersCount,
      inchargeName,
      phone,
    } = req.body;

    if (!name || !code || !district || latitude == null || longitude == null) {
      return res
        .status(400)
        .json({ message: "name, code, district, latitude, longitude required" });
    }

    const booth = await Booth.create({
      name,
      code,
      district,
      taluk,
      village,
      latitude,
      longitude,
      votersCount: votersCount || 0,
      inchargeName,
      phone,
    });

    res.status(201).json(booth);
  } catch (err) {
    console.error("Create booth error:", err);
    res.status(500).json({ message: "Server error creating booth" });
  }
});

// GET /api/booths?district=Trichy – list booths
router.get("/", protect, async (req, res) => {
  try {
    const { district } = req.query;
    const query = {};
    if (district) query.district = district;

    const booths = await Booth.find(query).sort({ createdAt: -1 });
    res.json(booths);
  } catch (err) {
    console.error("Get booths error:", err);
    res.status(500).json({ message: "Server error fetching booths" });
  }
});

export default router;
