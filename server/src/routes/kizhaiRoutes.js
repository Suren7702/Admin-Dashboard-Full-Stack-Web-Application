import express from "express";
import Kizhai from "../models/Kizhai.js";

const router = express.Router();

/*  
===========================================================
 🔓 PUBLIC ROUTE – Google Form Style (NO LOGIN REQUIRED)
  -> used by: POST /api/kizhais/public
===========================================================
*/
router.post("/public", async (req, res) => {
  try {
    const {
      name,
      area,
      village,
      taluk,
      district,
      memberCount,
      targetCount,
      presidentName,
      contactNumber,
    } = req.body;

    // Basic validation
    if (!name || !area || !village || !taluk || !district) {
      return res.status(400).json({
        message: "Name, area, village, taluk, district are required.",
      });
    }

    const newKizhai = await Kizhai.create({
      name,
      area,
      village,
      taluk,
      district,
      memberCount: Number(memberCount) || 0,
      targetCount: Number(targetCount) || 0,
      presidentName,
      contactNumber,
      source: "public-form", // optional tracking
    });

    return res.status(201).json({
      success: true,
      message: "Kizhai Kazhagam added successfully!",
      kizhai: newKizhai,
    });
  } catch (err) {
    console.error("Public Kizhai Error:", err);
    return res.status(400).json({ message: err.message });
  }
});

/*  
===========================================================
 🔒 NORMAL CRUD ROUTES (Dashboard / Admin use)
  -> base path: /api/kizhais
===========================================================
*/

// GET ALL – GET /api/kizhais
router.get("/", async (req, res) => {
  try {
    const kizhais = await Kizhai.find().sort({ createdAt: -1 });
    res.json(kizhais);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// CREATE NEW (Dashboard) – POST /api/kizhais
router.post("/", async (req, res) => {
  try {
    const newKizhai = new Kizhai(req.body);
    const savedKizhai = await newKizhai.save();
    res.status(201).json(savedKizhai);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// UPDATE – PUT /api/kizhais/:id
router.put("/:id", async (req, res) => {
  try {
    const updatedKizhai = await Kizhai.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updatedKizhai);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE – DELETE /api/kizhais/:id
router.delete("/:id", async (req, res) => {
  try {
    await Kizhai.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
