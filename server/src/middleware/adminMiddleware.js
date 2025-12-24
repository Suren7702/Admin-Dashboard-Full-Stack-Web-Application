const adminOnly = (req, res, next) => {
  // authMiddleware MUST run first
  if (!req.user) {
    return res.status(401).json({
      message: "Not authenticated",
    });
  }

  // 🔐 Only Super Admin allowed
  if (req.user.role !== "superadmin") {
    return res.status(403).json({
      message: "Access denied. Super Admin only.",
    });
  }

  next();
};

export default adminOnly;
