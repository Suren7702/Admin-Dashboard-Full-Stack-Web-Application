// server/src/server.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";

// if config/db.js is also inside src/config
import connectDB from "./config/db.js";

// ✅ NOTE: we are already inside src/, so use "./routes/...", NOT "./src/routes/..."
import authRoutes from "./routes/authRoutes.js";
import memberRoutes from "./routes/memberRoutes.js";

import { errorHandler, notFound } from "./middleware/errorMiddleware.js";

dotenv.config();
const app = express();

connectDB();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/members", memberRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
