import express from "express";
import * as chrono from "chrono-node";

const router = express.Router();

// Priority keywords
const PRIORITY_KEYWORDS = {
  CRITICAL: ["critical", "blocker", "very important", "must"],
  HIGH: ["high", "urgent", "important", "asap", "top priority"],
  LOW: ["low", "not urgent", "later", "whenever"],
};

// Status keywords
const STATUS_KEYWORDS = {
  IN_PROGRESS: ["in progress", "working on", "started"],
  DONE: ["done", "completed", "finished"],
  TO_DO: ["to do", "add task", "create task"],
};

// extract priority
function extractPriority(transcript) {
  const t = transcript.toLowerCase();
  for (const [key, words] of Object.entries(PRIORITY_KEYWORDS)) {
    if (words.some((w) => t.includes(w))) return key;
  }
  return "MEDIUM";
}

// extract status
function extractStatus(transcript) {
  const t = transcript.toLowerCase();
  for (const [key, words] of Object.entries(STATUS_KEYWORDS)) {
    if (words.some((w) => t.includes(w))) return key;
  }
  return "TO_DO";
}

// extract due date
function extractDueDate(transcript) {
  const date = chrono.parseDate(transcript);
  return date ? date.toISOString() : null;
}

// extract title
function extractTitle(transcript) {
  let text = transcript
    .replace(
      /(create|make|task|remind me to|please|add|schedule|set up|make a|do a)/gi,
      ""
    )
    .trim();

  // Capitalize
  text = text.charAt(0).toUpperCase() + text.slice(1);

  return text.length > 3 ? text : "New Task";
}

router.post("/", async (req, res) => {
  try {
    const { transcript } = req.body;

    if (!transcript || typeof transcript !== "string") {
      return res.status(400).json({ error: "Transcript is required" });
    }

    const parsed = {
      title: extractTitle(transcript),
      description: transcript, // full transcript stored for context
      priority: extractPriority(transcript),
      status: extractStatus(transcript),
      dueDate: extractDueDate(transcript),
    };

    return res.json({ transcript, parsed });
  } catch (err) {
    console.error("Parsing error:", err);
    return res.status(500).json({ error: "Failed to parse transcript" });
  }
});

export default router;
