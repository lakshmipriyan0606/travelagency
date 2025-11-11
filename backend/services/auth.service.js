import bcrypt from "bcrypt";
import User from "../models/user.model.js";

export const registerUser = async (email, password) => {
  const hashed = await bcrypt.hash(password, 10);

  return await User.create({ email, password: hashed });
};

export const findUserByEmail = (email) => User.findOne({ email });
