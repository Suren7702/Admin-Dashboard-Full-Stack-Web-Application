import mongoose from "mongoose";

const kizhaiSchema = new mongoose.Schema({
  name: { type: String, required: true },
  ward: { type: String, required: true },
  secretaryName: { type: String, required: true },
  phone: { type: String, required: true },
  area: { type: String },
  memberCount: { type: Number, default: 0 },
  targetCount: { type: Number, default: 100 },
}, { timestamps: true });

export default mongoose.model("Kizhai", kizhaiSchema);