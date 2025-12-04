import React, { useEffect, useState, useMemo } from "react";
import {
  fetchTasks,
  createTask,
  updateTask,
  deleteTask,
  parseTranscript,
} from "./api.js";
import { VoiceRecorder } from "./components/VoiceRecorder.jsx";
import { TaskForm } from "./components/TaskForm.jsx";

const STATUS_COLUMNS = [
  { key: "TO_DO", label: "To Do" },
  { key: "IN_PROGRESS", label: "In Progress" },
  { key: "DONE", label: "Done" },
];

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [view, setView] = useState("board");

  const [filterStatus, setFilterStatus] = useState("");
  const [filterPriority, setFilterPriority] = useState("");
  const [filterDueDate, setFilterDueDate] = useState("");
  const [search, setSearch] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [prefillData, setPrefillData] = useState(null);

  const loadTasks = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await fetchTasks({
        status: filterStatus || undefined,
        priority: filterPriority || undefined,
        dueDate: filterDueDate || undefined,
        search: search || undefined,
      });
      setTasks(data);
    } catch {
      setError("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const handleCreateClick = () => {
    setEditingTask(null);
    setPrefillData(null);
    setShowForm(true);
  };

  const handleEditClick = (task) => {
    setEditingTask(task);
    setPrefillData(null);
    setShowForm(true);
  };

  const handleFormSubmit = async (payload) => {
    try {
      if (editingTask) {
        const updated = await updateTask(editingTask._id, payload);
        setTasks((prev) => prev.map((t) => (t._id === updated._id ? updated : t)));
      } else {
        const created = await createTask(payload);
        setTasks((prev) => [created, ...prev]);
      }
      setShowForm(false);
      setEditingTask(null);
      setPrefillData(null);
    } catch {
      alert("Failed to save task");
    }
  };

  // NEW — Voice result → parse → autofill
  const handleVoiceResult = async (transcript) => {
    try {
      const { parsed } = await parseTranscript(transcript);
      setEditingTask(null);
      setPrefillData(parsed);
      setShowForm(true);
    } catch {
      alert("Failed to understand voice input");
    }
  };

  const filteredFormData = useMemo(() => {
    if (editingTask) return editingTask;
    return prefillData;
  }, [editingTask, prefillData]);

  const handleDelete = async (task) => {
    await deleteTask(task._id);
    setTasks((prev) => prev.filter((t) => t._id !== task._id));
  };

  const handleStatusChange = async (task, status) => {
    const updated = await updateTask(task._id, { status });
    setTasks((prev) => prev.map((t) => (t._id === updated._id ? updated : t)));
  };

  const renderTaskCard = (task) => (
    <div key={task._id} className="task-card">
      <div className="task-card-header">
        <div className="task-title">{task.title}</div>
        <span className={`pill pill-${task.priority.toLowerCase()}`}>{task.priority}</span>
      </div>
      {task.description && <div className="task-description">{task.description}</div>}
      <div className="task-meta">
        <span>
          Due: {task.dueDate ? new Date(task.dueDate).toLocaleString() : "No due date"}
        </span>
      </div>
      <div className="task-actions">
        <button className="btn btn-secondary btn-sm" onClick={() => handleEditClick(task)}>
          Edit
        </button>
        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(task)}>
          Delete
        </button>
      </div>
    </div>
  );

  const renderBoard = () =>
    STATUS_COLUMNS.map((col) => (
      <div key={col.key} className="board-column">
        <h3>{col.label}</h3>
        {tasks.filter((t) => t.status === col.key).map(renderTaskCard)}
      </div>
    ));

  return (
    <div className="app-shell">
      <header className="app-header">
        <h1>Voice Task Tracker</h1>
        <div className="header-actions">
          <button className="btn btn-primary" onClick={handleCreateClick}>
            + Add Task
          </button>
          <VoiceRecorder onResult={handleVoiceResult} />
        </div>
      </header>

      <main className="content">
        {loading ? <div className="loading">Loading...</div> : renderBoard()}
      </main>

      {showForm && (
        <div className="modal-backdrop">
          <div className="modal">
            <h2>{editingTask ? "Edit Task" : "Create Task"}</h2>
            <TaskForm
              initial={filteredFormData}
              onSubmit={handleFormSubmit}
              onCancel={() => {
                setShowForm(false);
                setEditingTask(null);
                setPrefillData(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
