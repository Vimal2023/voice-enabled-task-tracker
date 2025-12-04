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

  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [prefillData, setPrefillData] = useState(null);


  const loadTasks = async () => {
    try {
      setLoading(true);
      const data = await fetchTasks();
      setTasks(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

 
  const handleEditClick = (task) => {
    setEditingTask(task);
    setPrefillData(null);
    setShowForm(true);
  };

  const handleFormSubmit = async (payload) => {
    try {
      if (editingTask) {
        const updated = await updateTask(editingTask._id, payload);
        setTasks((prev) =>
          prev.map((t) => (t._id === updated._id ? updated : t))
        );
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

  const handleDelete = async (task) => {
    await deleteTask(task._id);
    setTasks((prev) => prev.filter((t) => t._id !== task._id));
  };


  const handleVoiceResult = async (transcript) => {
    const { parsed } = await parseTranscript(transcript);
    setEditingTask(null);
    setPrefillData(parsed);
    setShowForm(true);
  };

  const filteredFormData = useMemo(() => {
    if (editingTask) return editingTask;
    return prefillData;
  }, [editingTask, prefillData]);

  const handleDragStart = (event, taskId) => {
    event.dataTransfer.setData("taskId", taskId);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleDrop = async (event, newStatus) => {
    event.preventDefault();
    const taskId = event.dataTransfer.getData("taskId");

    const task = tasks.find((t) => t._id === taskId);
    if (!task || task.status === newStatus) return;

    const updated = await updateTask(taskId, { status: newStatus });

    setTasks((prev) =>
      prev.map((t) => (t._id === updated._id ? updated : t))
    );
  };

  const renderTaskCard = (task) => (
    <div
      key={task._id}
      className="task-card"
      draggable
      onDragStart={(e) => handleDragStart(e, task._id)}
    >
      <div className="task-card-header">
        <div className="task-title">{task.title}</div>
        <span className={`pill pill-${task.priority.toLowerCase()}`}>
          {task.priority}
        </span>
      </div>

      {task.description && (
        <div className="task-description">{task.description}</div>
      )}

      <div className="task-meta">
        Due:{" "}
        {task.dueDate ? new Date(task.dueDate).toLocaleString() : "No due date"}
      </div>

      <div className="task-actions">
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => handleEditClick(task)}
        >
          Edit
        </button>

        <button
          className="btn btn-danger btn-sm"
          onClick={() => handleDelete(task)}
        >
          Delete
        </button>
      </div>
    </div>
  );

  const renderBoard = () => (
    <div className="board">
      {STATUS_COLUMNS.map((col) => (
        <div
          key={col.key}
          className="board-column"
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, col.key)}
        >
          <div className="board-column-header">
            <h3>{col.label}</h3>
            <span className="column-count">
              {tasks.filter((t) => t.status === col.key).length} tasks
            </span>
          </div>

          <div className="board-column-body">
            {tasks
              .filter((t) => t.status === col.key)
              .map((t) => renderTaskCard(t))}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="app-shell">
      <header className="app-header">
        <h1>Voice Task Tracker</h1>

        <div className="header-actions">
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
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
