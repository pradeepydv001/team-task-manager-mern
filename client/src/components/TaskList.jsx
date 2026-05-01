import React, { useState } from "react";
import { Trash2 } from "lucide-react";
import { api } from "../api/client";

const statuses = ["Todo", "In Progress", "Done"];

export default function TaskList({ tasks, onChanged, isAdmin, readOnly = false }) {
  const [busyTask, setBusyTask] = useState("");

  async function updateStatus(task, status) {
    setBusyTask(task._id);
    try {
      await api(`/tasks/${task._id}`, {
        method: "PUT",
        body: JSON.stringify({ status })
      });
      await onChanged();
    } finally {
      setBusyTask("");
    }
  }

  async function deleteTask(task) {
    const confirmed = window.confirm(`Delete "${task.title}"?`);
    if (!confirmed) return;

    setBusyTask(task._id);
    try {
      await api(`/tasks/${task._id}`, { method: "DELETE" });
      await onChanged();
    } finally {
      setBusyTask("");
    }
  }

  return (
    <div className="task-list">
      {tasks.map((task) => {
        const overdue = new Date(task.dueDate) < new Date() && task.status !== "Done";
        return (
          <article className={`task-card ${overdue ? "overdue" : ""}`} key={task._id}>
            <div>
              <div className="task-title-row">
                <h3>{task.title}</h3>
                {overdue && <span className="overdue-pill">Overdue</span>}
              </div>
              <p>{task.description || "No description added yet."}</p>
              <small>{task.project?.name} - {task.assignedTo?.name} - Due {new Date(task.dueDate).toLocaleDateString()}</small>
            </div>
            <div className="task-actions">
              <span className={`priority ${task.priority.toLowerCase()}`}>{task.priority}</span>
              <select value={task.status} disabled={readOnly || busyTask === task._id} onChange={(e) => updateStatus(task, e.target.value)}>
                {statuses.map((status) => <option key={status}>{status}</option>)}
              </select>
              {isAdmin && !readOnly && (
                <button
                  className="icon-danger"
                  disabled={busyTask === task._id}
                  type="button"
                  onClick={() => deleteTask(task)}
                  title="Delete task"
                >
                  <Trash2 size={17} />
                </button>
              )}
            </div>
          </article>
        );
      })}
      {!tasks.length && <p className="empty">No tasks yet.</p>}
    </div>
  );
}
