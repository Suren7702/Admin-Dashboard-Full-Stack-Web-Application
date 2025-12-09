// server/src/models/boothModel.js
import mongoose from "mongoose";

const boothSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },        // Booth name
    code: { type: String, required: true },        // Booth code/ID
    district: { type: String, required: true },    // eg: "Trichy"
    taluk: { type: String },
    village: { type: String },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    votersCount: { type: Number, default: 0 },
    inchargeName: { type: String },
    phone: { type: String },
  },
  { timestamps: true }
);

const Booth = mongoose.model("Booth", boothSchema);
export default Booth;
