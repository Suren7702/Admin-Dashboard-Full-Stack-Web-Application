// server/src/utils/generateToken.js
import jwt from "jsonwebtoken";

const generateToken = (userId) => {
  const secret = process.env.JWT_SECRET?.trim();

  if (!secret) {
    console.error("❌ ERROR: JWT_SECRET is missing from .env");
    throw new Error("JWT_SECRET is not defined");
  }

  console.log("🔐 SIGN using JWT_SECRET =", secret);

  return jwt.sign(
    { id: userId },
    secret,
    { expiresIn: "7d" }
  );
};

export default generateToken;
