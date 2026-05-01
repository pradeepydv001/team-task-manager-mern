import Project from "../models/Project.js";
import Task from "../models/Task.js";

export async function getDashboard(req, res, next) {
  try {
    const now = new Date();
    const taskFilter = req.user.role === "Admin" ? {} : { assignedTo: req.user._id };
    const projectFilter =
      req.user.role === "Admin"
        ? {}
        : { $or: [{ owner: req.user._id }, { members: req.user._id }] };

    const [totalProjects, totalTasks, todo, inProgress, done, overdue, upcoming] =
      await Promise.all([
        Project.countDocuments(projectFilter),
        Task.countDocuments(taskFilter),
        Task.countDocuments({ ...taskFilter, status: "Todo" }),
        Task.countDocuments({ ...taskFilter, status: "In Progress" }),
        Task.countDocuments({ ...taskFilter, status: "Done" }),
        Task.countDocuments({ ...taskFilter, status: { $ne: "Done" }, dueDate: { $lt: now } }),
        Task.find({ ...taskFilter, status: { $ne: "Done" } })
          .populate("project", "name")
          .populate("assignedTo", "name email")
          .sort({ dueDate: 1 })
          .limit(6)
      ]);

    res.json({
      totalProjects,
      totalTasks,
      status: { todo, inProgress, done },
      overdue,
      upcoming
    });
  } catch (error) {
    next(error);
  }
}
