import Session from "../models/Session.js";

export const trackSession = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return next();

  await Session.updateOne(
    { tokenId: token },
    { lastActive: new Date(), isActive: true }
  );

  next();
};
