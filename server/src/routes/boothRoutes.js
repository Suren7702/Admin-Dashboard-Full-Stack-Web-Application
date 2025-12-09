// server/src/routes/boothRoutes.js
import express from "express";
import Booth from "../models/boothModel.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// CREATE – POST /api/booths
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

// READ (LIST) – GET /api/booths?district=&taluk=
router.get("/", protect, async (req, res) => {
  try {
    const { district, taluk } = req.query;
    const query = {};
    if (district) query.district = district;
    if (taluk) query.taluk = taluk;

    const booths = await Booth.find(query).sort({ createdAt: -1 });
    res.json(booths);
  } catch (err) {
    console.error("Get booths error:", err);
    res.status(500).json({ message: "Server error fetching booths" });
  }
});

// READ (ONE) – GET /api/booths/:id (optional)
router.get("/:id", protect, async (req, res) => {
  try {
    const booth = await Booth.findById(req.params.id);
    if (!booth) return res.status(404).json({ message: "Booth not found" });
    res.json(booth);
  } catch (err) {
    console.error("Get booth by id error:", err);
    res.status(500).json({ message: "Server error fetching booth" });
  }
});

// UPDATE – PUT /api/booths/:id
router.put("/:id", protect, async (req, res) => {
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

    const booth = await Booth.findById(req.params.id);
    if (!booth) {
      return res.status(404).json({ message: "Booth not found" });
    }

    booth.name = name ?? booth.name;
    booth.code = code ?? booth.code;
    booth.district = district ?? booth.district;
    booth.taluk = taluk ?? booth.taluk;
    booth.village = village ?? booth.village;
    booth.latitude = latitude ?? booth.latitude;
    booth.longitude = longitude ?? booth.longitude;
    booth.votersCount = votersCount ?? booth.votersCount;
    booth.inchargeName = inchargeName ?? booth.inchargeName;
    booth.phone = phone ?? booth.phone;

    const updated = await booth.save();
    res.json(updated);
  } catch (err) {
    console.error("Update booth error:", err);
    res.status(500).json({ message: "Server error updating booth" });
  }
});

// DELETE – DELETE /api/booths/:id
router.delete("/:id", protect, async (req, res) => {
  try {
    const booth = await Booth.findById(req.params.id);
    if (!booth) {
      return res.status(404).json({ message: "Booth not found" });
    }

    await booth.deleteOne();
    res.json({ message: "Booth deleted successfully" });
  } catch (err) {
    console.error("Delete booth error:", err);
    res.status(500).json({ message: "Server error deleting booth" });
  }
});

export default router;
