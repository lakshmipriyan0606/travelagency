import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const protectRoute = async (req, res, next) => {
  try {
    const token = req.cookies.access_token;

    if (!token)
      return res.status(401).json({ message: "Unauthorized: No Token" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('decoded: ', decoded);

    req.user = await User.findById(decoded.id).select("-password");

    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid or expired token" });
  }
};

export const adminOnly = (req, res, next) => {
  if (req.user.role !== "admin")
    return res.status(403).json({ message: "Access denied" });

  next();
};
