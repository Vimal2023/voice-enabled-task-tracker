import mongoose from "mongoose";

const TaskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  status: {
    type: String,
    enum: ["TO_DO", "IN_PROGRESS", "DONE"],
    default: "TO_DO",
  },
  priority: {
    type: String,
    enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"],
    default: "MEDIUM",
  },
  dueDate: Date,
}, { timestamps: true });

export default mongoose.model("Task", TaskSchema);
