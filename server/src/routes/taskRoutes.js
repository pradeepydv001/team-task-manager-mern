import express from "express";
import { body, param, query } from "express-validator";
import { createTask, deleteTask, getTasks, updateTask } from "../controllers/taskController.js";
import { adminOnly, protect } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validate.js";

const router = express.Router();

router.use(protect);

router.get(
  "/",
  [
    query("project").optional().isMongoId().withMessage("Invalid project id"),
    query("status").optional().isIn(["Todo", "In Progress", "Done"]).withMessage("Invalid status")
  ],
  validate,
  getTasks
);
router.post(
  "/",
  adminOnly,
  [
    body("title").trim().isLength({ min: 2 }).withMessage("Task title is required"),
    body("project").isMongoId().withMessage("Valid project is required"),
    body("assignedTo").isMongoId().withMessage("Valid assignee is required"),
    body("dueDate").isISO8601().withMessage("Valid due date is required"),
    body("status").optional().isIn(["Todo", "In Progress", "Done"]).withMessage("Invalid status"),
    body("priority").optional().isIn(["Low", "Medium", "High"]).withMessage("Invalid priority")
  ],
  validate,
  createTask
);
router.put(
  "/:id",
  [
    param("id").isMongoId().withMessage("Invalid task id"),
    body("status").optional().isIn(["Todo", "In Progress", "Done"]).withMessage("Invalid status"),
    body("priority").optional().isIn(["Low", "Medium", "High"]).withMessage("Invalid priority")
  ],
  validate,
  updateTask
);
router.delete("/:id", adminOnly, [param("id").isMongoId()], validate, deleteTask);

export default router;
