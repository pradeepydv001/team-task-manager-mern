import User from "../models/User.js";
import { generateToken } from "../utils/token.js";

function userPayload(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role
  };
}

export async function signup(req, res, next) {
  try {
    const { name, email, password, role } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(409);
      throw new Error("Email already registered");
    }

    const user = await User.create({ name, email, password, role });
    res.status(201).json({ user: userPayload(user), token: generateToken(user) });
  } catch (error) {
    next(error);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await user.matchPassword(password))) {
      res.status(401);
      throw new Error("Invalid email or password");
    }

    res.json({ user: userPayload(user), token: generateToken(user) });
  } catch (error) {
    next(error);
  }
}

export async function me(req, res) {
  res.json({ user: userPayload(req.user) });
}

export async function listUsers(req, res, next) {
  try {
    const users = await User.find().select("name email role").sort({ name: 1 });
    res.json(users);
  } catch (error) {
    next(error);
  }
}
