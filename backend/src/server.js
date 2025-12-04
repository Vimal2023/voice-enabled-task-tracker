import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import { connectDB } from "./db.js";      // ⬅️ new
import tasksRouter from "./routes/tasks.js";
import parseRouter from "./routes/parse.js";
// ⛔ speech router remove ho jayega (Google Web Speech API is used in frontend only)

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

// 🔥 Connect MongoDB
connectDB();

app.use(helmet());
app.use(cors({ origin: "*" }));
app.use(express.json());
app.use(morgan("dev"));

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// Routes
app.use("/api/tasks", tasksRouter);
app.use("/api/parse", parseRouter);
// ❌ Remove this line
// app.use("/api/speech-to-text", speechRouter);

app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(port, () => {
  console.log(`🚀 Backend listening on port ${port}`);
});
