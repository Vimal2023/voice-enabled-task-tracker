import express from "express";
import Task from "../models/Task.model.js";

const router = express.Router();

// CREATE Task
router.post("/", async (req, res) => {
  try {
    const { title, description, status, priority, dueDate } = req.body;

    if (!title || typeof title !== "string") {
      return res.status(400).json({ error: "Title is required" });
    }

    const task = await Task.create({
      title,
      description: description || "",
      status: status || "TO_DO",
      priority: priority || "MEDIUM",
      dueDate: dueDate ? new Date(dueDate) : null,
    });

    return res.status(201).json(task);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create task" });
  }
});

// GET Tasks with filters + search
router.get("/", async (req, res) => {
  try {
    const { status, priority, dueDate, search } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (dueDate) {
      const date = new Date(dueDate);
      const next = new Date(date);
      next.setDate(date.getDate() + 1);

      filter.dueDate = { $gte: date, $lt: next };
    }
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const tasks = await Task.find(filter).sort({ createdAt: -1 });
    return res.json(tasks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
});

// GET Single Task
router.get("/:id", async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ error: "Task not found" });
    return res.json(task);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch task" });
  }
});

// UPDATE Task
router.put("/:id", async (req, res) => {
  try {
    const { title, description, status, priority, dueDate } = req.body;

    const updated = await Task.findByIdAndUpdate(
      req.params.id,
      {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(status && { status }),
        ...(priority && { priority }),
        ...(dueDate !== undefined && {
          dueDate: dueDate === null ? null : new Date(dueDate),
        }),
      },
      { new: true }
    );

    if (!updated) return res.status(404).json({ error: "Task not found" });

    return res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update task" });
  }
});

// DELETE Task
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Task.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Task not found" });
    return res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete task" });
  }
});

export default router;
