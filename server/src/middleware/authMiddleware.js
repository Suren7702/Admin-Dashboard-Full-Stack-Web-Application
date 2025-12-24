import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Session from "../models/Session.js";

export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // 🔑 Extract token
      token = req.headers.authorization.split(" ")[1];

      const secret = process.env.JWT_SECRET?.trim();
      if (!secret) {
        console.error("❌ ERROR: JWT_SECRET is missing from .env");
        return res.status(500).json({ message: "Server misconfiguration" });
      }

      // 🔐 Verify JWT
      const decoded = jwt.verify(token, secret);

      // 🚫 IMPORTANT: Check if this session is still ACTIVE
      const session = await Session.findOne({
        tokenId: token,
        isActive: true,
      });

      if (!session) {
        return res.status(401).json({
          message: "Session expired or logged out",
        });
      }

      // 👤 Attach user to request
      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        return res.status(401).json({
          message: "Not authorized, user not found",
        });
      }

      // 🔄 Update last active time (heartbeat)
      session.lastActive = new Date();
      await session.save();

      next();
    } catch (error) {
      console.error("JWT verify failed:", error.message);
      return res.status(401).json({
        message: "Not authorized, token failed",
      });
    }
  } else {
    return res.status(401).json({
      message: "Not authorized, no token",
    });
  }
};
