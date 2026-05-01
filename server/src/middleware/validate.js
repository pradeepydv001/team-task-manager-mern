import { validationResult } from "express-validator";

export function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(422);
    const error = new Error("Validation failed");
    error.errors = errors.array();
    return next(error);
  }
  next();
}
