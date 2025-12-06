// server/src/scripts/importMembers.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import xlsx from "xlsx";
import path from "path";
import { fileURLToPath } from "url";

import connectDB from "../config/db.js";
import Member from "../models/Member.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Tamil column name → internal field name
const TAMIL_FIELD_MAP = {
  "வ/எண்": "serialNo",
  "பெயர்": "name",
  "பொறுப்பு": "role",
  "பரிந்துரை செய்த நபர்": "referencePerson",
  "தொலைபேசி எண்": "phone",
  "பிறந்த தேதி": "dob",
  "தந்தை பெயர்": "fatherName",
  "கல்வி தகுதி": "education",
  "தொழில்": "occupation",
  "சமூகம்": "community",
  "மெயில்": "email",
  "ஆதார் எண்": "aadharNo",
  "வாக்காளர் எண்": "voterId",
  "இரத்த வகை": "bloodGroup",
};

// helper: trim Tamil header keys safely
const getValueByTamil = (row, label) => {
  const key = Object.keys(row).find((k) => k && k.toString().trim() === label);
  return key ? row[key] : undefined;
};

const run = async () => {
  try {
    await connectDB();

    const filePath = path.join(
      __dirname,
      "..",
      "..",
      "data",
      "pro_team_members.xlsx" // change if you used another file name
    );

    console.log("📂 Reading workbook:", filePath);
    const workbook = xlsx.readFile(filePath);

    const allDocs = [];

    workbook.SheetNames.forEach((sheetName) => {
      const sheet = workbook.Sheets[sheetName];

      // Skip first 3 rows: title + blank + blank -> make row 4 as header
      const rows = xlsx.utils.sheet_to_json(sheet, { range: 3 });

      console.log(`➡ Processing sheet: ${sheetName} | rows: ${rows.length}`);

      rows.forEach((row) => {
        // Sometimes header row repeats as first row -> skip if column names appear again
        const maybeHeader = getValueByTamil(row, "வ/எண்");
        if (maybeHeader === "வ/எண்") {
          return;
        }

        const name = getValueByTamil(row, "பெயர்");
        const phone = getValueByTamil(row, "தொலைபேசி எண்");

        // ignore completely empty rows
        if (!name && !phone) return;

        const doc = {
          teamName: sheetName.trim(),
          serialNo: getValueByTamil(row, "வ/எண்")
            ? Number(getValueByTamil(row, "வ/எண்"))
            : undefined,
          name: name ? String(name).trim() : "",
          role: (() => {
            const v = getValueByTamil(row, "பொறுப்பு");
            return v ? String(v).trim() : undefined;
          })(),
          referencePerson: (() => {
            const v = getValueByTamil(row, "பரிந்துரை செய்த நபர்");
            return v ? String(v).trim() : undefined;
          })(),
          phone: phone ? String(phone).trim() : undefined,
          dob: (() => {
          const v = getValueByTamil(row, "பிறந்த தேதி");
          return v ? String(v).trim() : undefined;  // ✅ Just string, no new Date()
          })(),
          fatherName: (() => {
            const v = getValueByTamil(row, "தந்தை பெயர்");
            return v ? String(v).trim() : undefined;
          })(),
          education: (() => {
            const v = getValueByTamil(row, "கல்வி தகுதி");
            return v ? String(v).trim() : undefined;
          })(),
          occupation: (() => {
            const v = getValueByTamil(row, "தொழில்");
            return v ? String(v).trim() : undefined;
          })(),
          community: (() => {
            const v = getValueByTamil(row, "சமூகம்");
            return v ? String(v).trim() : undefined;
          })(),
          email: (() => {
            const v = getValueByTamil(row, "மெயில்");
            return v ? String(v).trim() : undefined;
          })(),
          aadharNo: (() => {
            const v = getValueByTamil(row, "ஆதார் எண்");
            return v ? String(v).trim() : undefined;
          })(),
          voterId: (() => {
            const v = getValueByTamil(row, "வாக்காளர் எண்");
            return v ? String(v).trim() : undefined;
          })(),
          bloodGroup: (() => {
            const v = getValueByTamil(row, "இரத்த வகை");
            return v ? String(v).trim() : undefined;
          })(),
        };

        if (!doc.name) return; // ensure name present
        allDocs.push(doc);
      });
    });

    console.log(`🧹 Clearing existing members collection...`);
    await Member.deleteMany({});

    console.log(`💾 Inserting ${allDocs.length} members...`);
    await Member.insertMany(allDocs);

    console.log("✅ Import complete!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Import failed:", err);
    process.exit(1);
  }
};

run();
