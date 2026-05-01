import React from "react";
import { useMemo, useState } from "react";
import { api } from "../api/client";

export default function TaskForm({ projects, users, onCreated }) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    project: "",
    assignedTo: "",
    priority: "Medium",
    dueDate: ""
  });
  const [error, setError] = useState("");

  const projectMembers = useMemo(() => {
    const project = projects.find((item) => item._id === form.project);
    if (!project) return users;
    const ids = project.members.map((member) => member._id);
    return users.filter((member) => ids.includes(member._id));
  }, [form.project, projects, users]);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    try {
      await api("/tasks", { method: "POST", body: JSON.stringify(form) });
      setForm({ title: "", description: "", project: "", assignedTo: "", priority: "Medium", dueDate: "" });
      onCreated();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <form className="compact-form" onSubmit={handleSubmit}>
      <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Task title" required />
      <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description" />
      <div className="two-cols">
        <select value={form.project} onChange={(e) => setForm({ ...form, project: e.target.value, assignedTo: "" })} required>
          <option value="">Project</option>
          {projects.map((project) => <option key={project._id} value={project._id}>{project.name}</option>)}
        </select>
        <select value={form.assignedTo} onChange={(e) => setForm({ ...form, assignedTo: e.target.value })} required>
          <option value="">Assign to</option>
          {projectMembers.map((member) => <option key={member._id} value={member._id}>{member.name}</option>)}
        </select>
      </div>
      <div className="two-cols">
        <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
          <option>Low</option>
          <option>Medium</option>
          <option>High</option>
        </select>
        <input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} required />
      </div>
      {error && <div className="error mini">{error}</div>}
      <button className="primary">Create task</button>
    </form>
  );
}
