import jwt from "jsonwebtoken";
import User from "../models/User.js";

export async function protect(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

  if (!token) {
    res.status(401);
    return next(new Error("Authentication required"));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-password");
    if (!req.user) {
      res.status(401);
      return next(new Error("User not found"));
    }
    next();
  } catch (error) {
    res.status(401);
    next(new Error("Invalid or expired token"));
  }
}

export function adminOnly(req, res, next) {
  if (req.user?.role !== "Admin") {
    res.status(403);
    return next(new Error("Admin access required"));
  }
  next();
}
