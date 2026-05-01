import Project from "../models/Project.js";
import Task from "../models/Task.js";
import User from "../models/User.js";

const populateProject = [
  { path: "owner", select: "name email role" },
  { path: "members", select: "name email role" }
];

export async function getProjects(req, res, next) {
  try {
    const filter =
      req.user.role === "Admin"
        ? {}
        : { $or: [{ owner: req.user._id }, { members: req.user._id }] };
    const projects = await Project.find(filter).populate(populateProject).sort({ createdAt: -1 });
    res.json(projects);
  } catch (error) {
    next(error);
  }
}

export async function createProject(req, res, next) {
  try {
    const memberIds = [...new Set([...(req.body.members || []), String(req.user._id)])];
    const members = await User.find({ _id: { $in: memberIds } });
    if (members.length !== memberIds.length) {
      res.status(400);
      throw new Error("One or more members are invalid");
    }

    const project = await Project.create({
      name: req.body.name,
      description: req.body.description,
      owner: req.user._id,
      members: memberIds
    });

    res.status(201).json(await project.populate(populateProject));
  } catch (error) {
    next(error);
  }
}

export async function updateProject(req, res, next) {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      res.status(404);
      throw new Error("Project not found");
    }

    project.name = req.body.name ?? project.name;
    project.description = req.body.description ?? project.description;
    if (req.body.members) {
      const memberIds = [...new Set([...req.body.members, String(project.owner)])];
      const members = await User.find({ _id: { $in: memberIds } });
      if (members.length !== memberIds.length) {
        res.status(400);
        throw new Error("One or more members are invalid");
      }
      project.members = memberIds;
    }

    await project.save();
    res.json(await project.populate(populateProject));
  } catch (error) {
    next(error);
  }
}

export async function deleteProject(req, res, next) {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      res.status(404);
      throw new Error("Project not found");
    }

    await Task.deleteMany({ project: project._id });
    await project.deleteOne();
    res.json({ message: "Project deleted" });
  } catch (error) {
    next(error);
  }
}
