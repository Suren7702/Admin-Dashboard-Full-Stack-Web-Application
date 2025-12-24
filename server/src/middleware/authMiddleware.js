// middleware/authMiddleware.js
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Session from "../models/Session.js";

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const secret = process.env.JWT_SECRET?.trim();

      // 1. Verify JWT
      const decoded = jwt.verify(token, secret);

      // 2. Find Session (Check if token matches exactly)
      // We use .trim() on the token just in case there's whitespace
      const session = await Session.findOne({ 
        tokenId: token.trim(), 
        isActive: true 
      });

      if (!session) {
        console.warn(`Session not found for token starting with: ${token.substring(0, 10)}`);
        return res.status(401).json({ message: "Session expired or invalid" });
      }

      // 3. Attach User
      req.user = await User.findById(decoded.id).select("-password");
      
      if (!req.user) {
        return res.status(401).json({ message: "User not found" });
      }

      // 4. Update Session Heartbeat
      session.lastActive = new Date();
      await session.save();

      next();
    } catch (error) {
      console.error("Auth Error:", error.message);
      return res.status(401).json({ message: "Not authorized" });
    }
  } else {
    return res.status(401).json({ message: "No token, authorization denied" });
  }
};