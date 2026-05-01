import express from "express";
import { body, param } from "express-validator";
import {
  createProject,
  deleteProject,
  getProjects,
  updateProject
} from "../controllers/projectController.js";
import { adminOnly, protect } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validate.js";

const router = express.Router();

router.use(protect);

router.get("/", getProjects);
router.post(
  "/",
  adminOnly,
  [
    body("name").trim().isLength({ min: 2 }).withMessage("Project name is required"),
    body("members").optional().isArray().withMessage("Members must be an array")
  ],
  validate,
  createProject
);
router.put(
  "/:id",
  adminOnly,
  [
    param("id").isMongoId().withMessage("Invalid project id"),
    body("name").optional().trim().isLength({ min: 2 }).withMessage("Project name is too short"),
    body("members").optional().isArray().withMessage("Members must be an array")
  ],
  validate,
  updateProject
);
router.delete("/:id", adminOnly, [param("id").isMongoId()], validate, deleteProject);

export default router;
