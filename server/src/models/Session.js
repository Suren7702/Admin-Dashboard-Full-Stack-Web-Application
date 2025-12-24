import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  role: String,

  ipAddress: String,

  device: {
    type: String, // desktop / mobile / tablet
  },
  os: String,
  browser: String,

  location: {
    city: String,
    region: String,
    country: String,
  },

  tokenId: String, // JWT id
  loginAt: {
    type: Date,
    default: Date.now,
  },
  lastActive: {
    type: Date,
    default: Date.now,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
});

export default mongoose.model("Session", sessionSchema);
