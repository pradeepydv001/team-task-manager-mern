import Project from "../models/Project.js";
import Task from "../models/Task.js";

const taskPopulate = [
  { path: "project", select: "name" },
  { path: "assignedTo", select: "name email role" },
  { path: "createdBy", select: "name email role" }
];

async function canAccessProject(projectId, user) {
  const project = await Project.findById(projectId);
  if (!project) return null;
  const isMember = project.members.some((id) => String(id) === String(user._id));
  if (user.role !== "Admin" && !isMember && String(project.owner) !== String(user._id)) {
    return false;
  }
  return project;
}

export async function getTasks(req, res, next) {
  try {
    const query = {};
    if (req.query.project) query.project = req.query.project;
    if (req.query.status) query.status = req.query.status;
    if (req.user.role !== "Admin") query.assignedTo = req.user._id;

    const tasks = await Task.find(query).populate(taskPopulate).sort({ dueDate: 1 });
    res.json(tasks);
  } catch (error) {
    next(error);
  }
}

export async function createTask(req, res, next) {
  try {
    const project = await canAccessProject(req.body.project, req.user);
    if (!project) {
      res.status(404);
      throw new Error("Project not found");
    }
    if (project === false) {
      res.status(403);
      throw new Error("You do not belong to this project");
    }

    const canAssign = project.members.some((id) => String(id) === String(req.body.assignedTo));
    if (!canAssign) {
      res.status(400);
      throw new Error("Assigned user must be a project member");
    }

    const task = await Task.create({
      title: req.body.title,
      description: req.body.description,
      status: req.body.status,
      priority: req.body.priority,
      dueDate: req.body.dueDate,
      project: req.body.project,
      assignedTo: req.body.assignedTo,
      createdBy: req.user._id
    });

    res.status(201).json(await task.populate(taskPopulate));
  } catch (error) {
    next(error);
  }
}

export async function updateTask(req, res, next) {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      res.status(404);
      throw new Error("Task not found");
    }

    const project = await canAccessProject(task.project, req.user);
    const isAssigned = String(task.assignedTo) === String(req.user._id);
    if (project === false || (req.user.role !== "Admin" && !isAssigned)) {
      res.status(403);
      throw new Error("You can only update your assigned tasks");
    }

    if (req.user.role === "Admin") {
      task.title = req.body.title ?? task.title;
      task.description = req.body.description ?? task.description;
      task.priority = req.body.priority ?? task.priority;
      task.dueDate = req.body.dueDate ?? task.dueDate;
      task.assignedTo = req.body.assignedTo ?? task.assignedTo;
    }
    task.status = req.body.status ?? task.status;

    await task.save();
    res.json(await task.populate(taskPopulate));
  } catch (error) {
    next(error);
  }
}

export async function deleteTask(req, res, next) {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      res.status(404);
      throw new Error("Task not found");
    }
    await task.deleteOne();
    res.json({ message: "Task deleted" });
  } catch (error) {
    next(error);
  }
}
