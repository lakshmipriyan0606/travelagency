import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../../database/models/user.model.js";
import { generateAccessToken, generateRefreshToken } from "./auth.utils.js";
import { findUserByEmail, registerUser } from "./auth.service.js";

export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const existing = await findUserByEmail(email);
    if (existing) {
      return res.status(400).json({ msg: "Email already exists" });
    }

    await registerUser(email, password, name, role);

    res.status(201).json({ msg: "Registered successfully" });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ msg: "No user found" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ msg: "Wrong password" });

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    const isProduction = process.env.NODE_ENV === "production";

    res.cookie("access_token", accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "strict",
    });

    res.cookie("refresh_token", refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "strict",
    });

    const decodedToken = jwt.decode(accessToken);
    const userObj = user.toObject();
    if (decodedToken && decodedToken.exp) {
      userObj.exp = decodedToken.exp;
    }

    res.json({ msg: "Logged in", user: userObj });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

export const refresh = (req, res) => {
  const refreshToken = req.cookies.refresh_token;

  if (!refreshToken) return res.status(401).json({ msg: "No refresh token" });

  try {
    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || "refresh_secret"
    );

    const newAccessToken = jwt.sign(
      { id: decoded.id, role: decoded.role },
      process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET || "access_secret",
      { expiresIn: process.env.JWT_ACCESS_EXPIRE || "59m" }
    );

    const isProduction = process.env.NODE_ENV === "production";
    res.cookie("access_token", newAccessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "strict",
    });

    return res.json({ msg: "Refreshed" });
  } catch (err) {
    return res.status(403).json({ msg: "Invalid refresh token" });
  }
};

export const logout = (req, res) => {
  res.clearCookie("access_token");
  res.clearCookie("refresh_token");
  res.json({ msg: "Logged out" });
};

export const getSession = async (req, res) => {
  try {
    const token = req.cookies.access_token;

    if (!token) {
      return res.json({ isLoggedIn: false });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || process.env.JWT_ACCESS_SECRET || "access_secret"
    );

    const currentUser = await User.findById(decoded.id).select("role name email");

    if (!currentUser) {
      return res.json({ isLoggedIn: false });
    }

    return res.json({
      isLoggedIn: true,
      id: decoded.id,
      role: currentUser.role || "user",
      user: {
        name: currentUser.name || "",
        email: currentUser.email || "",
        exp: decoded.exp,
      },
    });
  } catch (err) {
    return res.json({ isLoggedIn: false });
  }
};
