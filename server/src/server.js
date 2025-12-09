import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";

// Routes Imports
import authRoutes from "./routes/authRoutes.js";
import memberRoutes from "./routes/memberRoutes.js";
import kizhaiRoutes from "./routes/kizhaiRoutes.js";// ✅ New Route

// Middleware Imports
import { errorHandler, notFound } from "./middleware/errorMiddleware.js";

import boothRoutes from "./routes/boothRoutes.js";

dotenv.config();
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes Configuration
app.use("/api/auth", authRoutes);
app.use("/api/members", memberRoutes);

// ✅ இங்கே "/api/kizhais" என்று சொன்னால்...
app.use("/api/kizhais", kizhaiRoutes); 
app.use("/api/booths", boothRoutes);

// Error Handling
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});