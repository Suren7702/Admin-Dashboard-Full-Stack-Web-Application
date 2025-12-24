import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";

// Models
import Kizhai from "./models/Kizhai.js";

// Routes Imports
import authRoutes from "./routes/authRoutes.js";
import memberRoutes from "./routes/memberRoutes.js";
import kizhaiRoutes from "./routes/kizhaiRoutes.js";
import boothRoutes from "./routes/boothRoutes.js";
import sessionRoutes from "./routes/sessionRoutes.js";
// Middleware Imports
import { errorHandler, notFound } from "./middleware/errorMiddleware.js";

dotenv.config();
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes Configuration
app.use("/api/auth", authRoutes);
app.use("/api/members", memberRoutes);
app.use("/api/kizhais", kizhaiRoutes);
app.use("/api/booths", boothRoutes);
app.use("/api/sessions", sessionRoutes);
/* 
   🟣 PUBLIC KIZHAI FORM ROUTE (NO LOGIN REQUIRED)
   Used by: POST /api/kizhais/public  (PublicKizhaiForm.jsx)
*/
app.post("/api/kizhais/public", async (req, res) => {
  try {
    const {
      name,
      ward,
      area,
      secretaryName,
      phone,
      memberCount,
      targetCount,
    } = req.body;

    const newKizhai = await Kizhai.create({
      name,
      ward,
      area,
      secretaryName,
      phone,
      memberCount: Number(memberCount) || 0,
      targetCount: Number(targetCount) || 0,
      source: "public-form",
    });

    return res.status(201).json({
      success: true,
      message: "Kizhai Kazhagam added successfully!",
      kizhai: newKizhai,
    });
  } catch (err) {
    console.error("Public Kizhai Error (server.js):", err);
    return res
      .status(400)
      .json({ message: err.message || "Failed to save kizhai" });
  }
});

// Error Handling
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
