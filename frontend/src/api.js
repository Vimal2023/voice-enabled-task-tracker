import axios from "axios";

const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL || "/api").replace(/\/$/, "");

const client = axios.create({
  baseURL: API_BASE_URL,
});

// GET tasks with optional filters/search
export async function fetchTasks(params = {}) {
  const res = await client.get("/tasks", { params });
  return res.data;
}

// CREATE new task
export async function createTask(payload) {
  const res = await client.post("/tasks", payload);
  return res.data;
}

// UPDATE task
export async function updateTask(id, payload) {
  const res = await client.put(`/tasks/${id}`, payload);
  return res.data;
}

// DELETE task
export async function deleteTask(id) {
  await client.delete(`/tasks/${id}`);
}

// PARSE transcript into structured task fields
export async function parseTranscript(transcript) {
  const res = await client.post("/parse", { transcript });
  return res.data; // { transcript, parsed: {...} }
}
