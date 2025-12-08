import express from "express";
import Kizhai from "../models/Kizhai.js"; 

const router = express.Router();

// ...அது இங்கே "/" ஆக வரும். 
// அதாவது "/api/kizhais" + "/" = "/api/kizhais"

// GET ALL
router.get("/", async (req, res) => {
  try {
    const kizhais = await Kizhai.find().sort({ createdAt: -1 });
    res.json(kizhais);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// CREATE NEW
router.post("/", async (req, res) => {
  try {
    const newKizhai = new Kizhai(req.body);
    const savedKizhai = await newKizhai.save();
    res.status(201).json(savedKizhai);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// UPDATE
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

// DELETE
router.delete("/:id", async (req, res) => {
  try {
    await Kizhai.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;