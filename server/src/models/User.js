// server/src/models/User.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["admin", "coordinator", "volunteer"],
      default: "admin",
    },
    // ✅ ADDED THIS FIELD (Critical for Approvals Page)
    isApproved: { 
      type: Boolean, 
      default: false 
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;