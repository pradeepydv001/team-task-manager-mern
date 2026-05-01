import React from "react";
import { useState } from "react";
import { api } from "../api/client";

export default function ProjectForm({ users, onCreated }) {
  const [form, setForm] = useState({ name: "", description: "", members: [] });
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    try {
      await api("/projects", { method: "POST", body: JSON.stringify(form) });
      setForm({ name: "", description: "", members: [] });
      onCreated();
    } catch (err) {
      setError(err.message);
    }
  }

  function toggleMember(id) {
    setForm((current) => ({
      ...current,
      members: current.members.includes(id)
        ? current.members.filter((memberId) => memberId !== id)
        : [...current.members, id]
    }));
  }

  return (
    <form className="compact-form" onSubmit={handleSubmit}>
      <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Project name" required />
      <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description" />
      <div className="checkbox-grid">
        {users.map((member) => (
          <label key={member._id}>
            <input type="checkbox" checked={form.members.includes(member._id)} onChange={() => toggleMember(member._id)} />
            {member.name}
          </label>
        ))}
      </div>
      {error && <div className="error mini">{error}</div>}
      <button className="primary">Create project</button>
    </form>
  );
}
