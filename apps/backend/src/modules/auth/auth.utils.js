import jwt from "jsonwebtoken";

export const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET || process.env.JWT_ACCESS_SECRET || "access_secret",
    { expiresIn: process.env.JWT_ACCESS_EXPIRE || "59m" }
  );
};

export const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || "refresh_secret",
    { expiresIn: process.env.JWT_REFRESH_EXPIRE || "7d" }
  );
};
