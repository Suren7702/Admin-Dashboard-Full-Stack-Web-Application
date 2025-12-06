// server/src/models/Member.js
import mongoose from "mongoose";

// 🟢 Sub-schema for Maanadu support
const maanaduSupportSchema = new mongoose.Schema(
  {
    enabled: { type: Boolean, default: false }, // member maanadu-ku support pannaraana?
    eventName: { type: String, trim: true },    // e.g. "TVK Maanadu 2025"
    vehicleType: { type: String, trim: true },  // e.g. "Van", "Mini Bus"
    amountSpent: { type: Number, default: 0 },  // total amount
    date: { type: Date },                       // date of support
    notes: { type: String, trim: true },        // extra details
  },
  { _id: false }
);

// 🟢 Main Member schema
const memberSchema = new mongoose.Schema(
  {
    // Basic info (old schema)
    teamName: {
      type: String,
      required: true,
      trim: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    role: {
      type: String,
      trim: true,
      default: "",
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    community: {
      type: String,
      trim: true,
      default: "",
    },

    bloodGroup: {
      type: String,
      trim: true,
      default: "",
    },

    // 🆕 Maanadu support info
    maanaduSupport: {
      type: maanaduSupportSchema,
      default: () => ({}),
    },
  },
  {
    timestamps: true, // createdAt, updatedAt auto add aagum
  }
);

// Nodemon reload issue avoid panna:
const Member =
  mongoose.models.Member || mongoose.model("Member", memberSchema);

export default Member;
