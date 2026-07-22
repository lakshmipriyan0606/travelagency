import bcrypt from "bcrypt";
import User from "../../database/models/user.model.js";

export const registerUser = async (email, password, name = "", role = "user") => {
  const hashed = await bcrypt.hash(password, 10);
  return await User.create({ name, email, password: hashed, role });
};

export const findUserByEmail = async (email) => {
  return await User.findOne({ email });
};

export const findUserById = async (id) => {
  return await User.findById(id).select("-password");
};
