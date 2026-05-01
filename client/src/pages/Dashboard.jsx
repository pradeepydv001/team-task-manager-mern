import React, { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  ClipboardCheck,
  Download,
  FolderKanban,
  LayoutDashboard,
  LogOut,
  PlusSquare,
  Trash2,
  Users
} from "lucide-react";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import ProjectForm from "../components/ProjectForm";
import TaskForm from "../components/TaskForm";
import TaskList from "../components/TaskList";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [activeView, setActiveView] = useState(user.role === "Admin" ? "team" : "dashboard");
  const [deletingProject, setDeletingProject] = useState("");

  const isAdmin = user.role === "Admin";

  async function loadData() {
    try {
      const [dashboardData, projectData, taskData, userData] = await Promise.all([
        api("/dashboard"),
        api("/projects"),
        api("/tasks"),
        api("/auth/users")
      ]);
      setDashboard(dashboardData);
      setProjects(projectData);
      setTasks(taskData);
      setUsers(userData);
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const taskCounts = useMemo(() => getTaskCounts(tasks), [tasks]);
  const priorityCounts = useMemo(() => getPriorityCounts(tasks), [tasks]);
  const teamStats = useMemo(() => {
    return users.map((member) => {
      const memberTasks = tasks.filter((task) => task.assignedTo?._id === member._id);
      return {
        ...member,
        counts: getTaskCounts(memberTasks)
      };
    });
  }, [tasks, users]);

  async function deleteProject(project) {
    const confirmed = window.confirm(
      `Delete "${project.name}"? All tasks in this project will also be removed.`
    );
    if (!confirmed) return;

    setError("");
    setDeletingProject(project._id);
    try {
      await api(`/projects/${project._id}`, { method: "DELETE" });
      await loadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setDeletingProject("");
    }
  }

  function downloadReport() {
    const lines = [
      "Task Manager Report",
      `Generated for: ${user.name} (${user.role})`,
      `Projects: ${dashboard?.totalProjects ?? 0}`,
      `Total Tasks: ${dashboard?.totalTasks ?? 0}`,
      `Pending Tasks: ${taskCounts.todo}`,
      `In Progress: ${taskCounts.inProgress}`,
      `Completed Tasks: ${taskCounts.done}`,
      `Overdue Tasks: ${dashboard?.overdue ?? 0}`
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "task-manager-report.txt";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="tm-shell">
      <header className="tm-header">
        <h1>Task Manager</h1>
      </header>

      <div className="tm-layout">
        <aside className="sidebar">
          <ProfileCard user={user} />
          <nav className="side-nav">
            <NavButton icon={<LayoutDashboard />} label="Dashboard" active={activeView === "dashboard"} onClick={() => setActiveView("dashboard")} />
            {isAdmin ? (
              <>
                <NavButton icon={<ClipboardCheck />} label="Manage Tasks" active={activeView === "tasks"} onClick={() => setActiveView("tasks")} />
                <NavButton icon={<PlusSquare />} label="Create Task" active={activeView === "create"} onClick={() => setActiveView("create")} />
                <NavButton icon={<Users />} label="Team Members" active={activeView === "team"} onClick={() => setActiveView("team")} />
              </>
            ) : (
              <NavButton icon={<ClipboardCheck />} label="My Tasks" active={activeView === "tasks"} onClick={() => setActiveView("tasks")} />
            )}
            <NavButton icon={<LogOut />} label="Logout" onClick={logout} />
          </nav>
        </aside>

        <section className="workspace">
          {error && <div className="error">{error}</div>}
          {activeView === "dashboard" && (
            <DashboardView
              dashboard={dashboard}
              priorityCounts={priorityCounts}
              taskCounts={taskCounts}
              tasks={tasks}
              user={user}
            />
          )}
          {activeView === "team" && isAdmin && (
            <TeamMembersView members={teamStats} onDownload={downloadReport} />
          )}
          {activeView === "create" && isAdmin && (
            <CreateWorkView projects={projects} users={users} onCreated={loadData} />
          )}
          {activeView === "tasks" && (
            <ManageTasksView
              deletingProject={deletingProject}
              isAdmin={isAdmin}
              onChanged={loadData}
              onDeleteProject={deleteProject}
              projects={projects}
              tasks={tasks}
              users={users}
            />
          )}
        </section>
      </div>
    </main>
  );
}

function ProfileCard({ user }) {
  return (
    <div className="profile-card">
      <div className="avatar avatar-lg">{getInitials(user.name)}</div>
      <span className="role-badge">{user.role}</span>
      <h2>{user.name}</h2>
      <p>{user.email}</p>
    </div>
  );
}

function NavButton({ active, icon, label, onClick }) {
  return (
    <button className={`nav-button ${active ? "active" : ""}`} onClick={onClick} type="button">
      {React.cloneElement(icon, { size: 22 })}
      <span>{label}</span>
    </button>
  );
}

function DashboardView({ dashboard, priorityCounts, taskCounts, tasks, user }) {
  const total = dashboard?.totalTasks ?? 0;
  return (
    <div className="screen-stack">
      <section className="summary-hero">
        <div>
          <h2>Good Morning! {user.name}</h2>
          <p>{new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}</p>
        </div>
        <div className="summary-row">
          <SummaryItem color="blue" label="Total Tasks" value={total} />
          <SummaryItem color="purple" label="Pending Tasks" value={taskCounts.todo} />
          <SummaryItem color="cyan" label="In Progress" value={taskCounts.inProgress} />
          <SummaryItem color="green" label="Completed Tasks" value={taskCounts.done} />
        </div>
      </section>

      <section className="chart-grid">
        <article className="analytics-card">
          <h3>Task Distribution</h3>
          <div
            className="donut-chart"
            style={{
              "--pending": `${getPercent(taskCounts.todo, total)}%`,
              "--progress": `${getPercent(taskCounts.inProgress, total)}%`
            }}
          />
          <div className="legend-row">
            <Legend color="purple" label="Pending" />
            <Legend color="cyan" label="In Progress" />
            <Legend color="green" label="Completed" />
          </div>
        </article>

        <article className="analytics-card">
          <h3>Task Priority Levels</h3>
          <div className="bar-chart">
            <Bar label="Low" value={priorityCounts.Low} max={Math.max(1, ...Object.values(priorityCounts))} tone="low" />
            <Bar label="Medium" value={priorityCounts.Medium} max={Math.max(1, ...Object.values(priorityCounts))} tone="medium" />
            <Bar label="High" value={priorityCounts.High} max={Math.max(1, ...Object.values(priorityCounts))} tone="high" />
          </div>
        </article>
      </section>

      <section className="analytics-card">
        <div className="section-title">
          <h3>Recent Tasks</h3>
          <span>{dashboard?.overdue ?? 0} overdue</span>
        </div>
        <TaskList tasks={tasks.slice(0, 5)} onChanged={() => Promise.resolve()} isAdmin={false} readOnly />
      </section>
    </div>
  );
}

function TeamMembersView({ members, onDownload }) {
  return (
    <div className="screen-stack">
      <div className="section-title">
        <h2>Team Members</h2>
        <button className="report-button" onClick={onDownload} type="button">
          <Download size={18} />
          Download Report
        </button>
      </div>
      <div className="member-grid">
        {members.map((member) => (
          <article className="member-card" key={member._id}>
            <div className="member-head">
              <div className="avatar">{getInitials(member.name)}</div>
              <div>
                <h3>{member.name}</h3>
                <p>{member.email}</p>
              </div>
            </div>
            <div className="member-stats">
              <MiniStat label="Pending" value={member.counts.todo} tone="purple" />
              <MiniStat label="In Progress" value={member.counts.inProgress} tone="cyan" />
              <MiniStat label="Completed" value={member.counts.done} tone="indigo" />
            </div>
          </article>
        ))}
        {!members.length && <p className="empty">No team members yet.</p>}
      </div>
    </div>
  );
}

function CreateWorkView({ projects, users, onCreated }) {
  return (
    <div className="screen-stack">
      <div className="section-title">
        <h2>Create Task</h2>
        <p>Assign tasks to project members and track progress by status.</p>
      </div>
      <section className="form-grid">
        <article className="analytics-card">
          <h3>Task Creation</h3>
          <TaskForm projects={projects} users={users} onCreated={onCreated} />
        </article>
        <article className="analytics-card">
          <h3>Project & Team Management</h3>
          <ProjectForm users={users} onCreated={onCreated} />
        </article>
      </section>
    </div>
  );
}

function ManageTasksView({ deletingProject, isAdmin, onChanged, onDeleteProject, projects, tasks }) {
  return (
    <div className="screen-stack">
      <div className="section-title">
        <h2>{isAdmin ? "Manage Tasks" : "My Tasks"}</h2>
        <p>{isAdmin ? "Review projects, assignments, and task progress." : "Update the status of tasks assigned to you."}</p>
      </div>
      {isAdmin && (
        <section className="project-strip">
          {projects.map((project) => (
            <article className="project-chip" key={project._id}>
              <div>
                <h3>{project.name}</h3>
                <p>{project.members.length} members</p>
              </div>
              <button
                className="icon-danger"
                disabled={deletingProject === project._id}
                onClick={() => onDeleteProject(project)}
                title="Delete project"
                type="button"
              >
                <Trash2 size={17} />
              </button>
            </article>
          ))}
        </section>
      )}
      <section className="analytics-card">
        <TaskList tasks={tasks} onChanged={onChanged} isAdmin={isAdmin} />
      </section>
    </div>
  );
}

function SummaryItem({ color, label, value }) {
  return (
    <div className="summary-item">
      <span className={`marker ${color}`} />
      <strong>{value}</strong>
      <p>{label}</p>
    </div>
  );
}

function MiniStat({ label, tone, value }) {
  return (
    <div className="mini-stat">
      <strong className={tone}>{value}</strong>
      <span>{label}</span>
    </div>
  );
}

function Legend({ color, label }) {
  return (
    <span className="legend">
      <i className={color} />
      {label}
    </span>
  );
}

function Bar({ label, max, tone, value }) {
  return (
    <div className="bar-item">
      <span>{value}</span>
      <div className={`bar ${tone}`} style={{ height: `${Math.max(8, (value / max) * 100)}%` }} />
      <p>{label}</p>
    </div>
  );
}

function getTaskCounts(items) {
  return {
    todo: items.filter((task) => task.status === "Todo").length,
    inProgress: items.filter((task) => task.status === "In Progress").length,
    done: items.filter((task) => task.status === "Done").length
  };
}

function getPriorityCounts(items) {
  return {
    Low: items.filter((task) => task.priority === "Low").length,
    Medium: items.filter((task) => task.priority === "Medium").length,
    High: items.filter((task) => task.priority === "High").length
  };
}

function getPercent(value, total) {
  if (!total) return 0;
  return Math.round((value / total) * 100);
}

function getInitials(name = "U") {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
