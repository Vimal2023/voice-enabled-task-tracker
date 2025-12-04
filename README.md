# 🎤 Voice-Enabled Task Tracker

A full-stack task tracking application inspired by Linear, featuring a **smart voice input system** that converts natural speech into structured task fields (title, priority, due date, status).  
Users can create, view, update, delete, and organize tasks with both **manual forms and voice commands**.

## DEMOVideo -- 
https://drive.google.com/drive/folders/13_x0l4mIUkrTjS3rAy6-vnngZtZVL043?usp=sharing


## Project Structure

```
project/
├── backend/          # Node.js + Express + PostgreSQL backend
├── frontend/         # React + Vite frontend
└── README.md         # This file
```

---

## 🛠 Tech Stack

| Layer       | Technology                             |
| ----------- | -------------------------------------- |
| Frontend    | React, Vite, JavaScript                |
| Backend     | Node.js, Express                       |
| Database    | MongoDB (Mongoose)                     |
| Voice Input | Web Speech API (Browser)               |
| NLP Parsing | chrono-node + Custom rule-based parser |
| UI          | Custom modern CSS                      |

---

## ⚙️ Features

### 🔹 Core Task Management

- Create tasks manually
- Kanban board view + List view
- Edit & update tasks
- Delete with confirmation
- Drag-and-Drop status update
- Filters (status, priority, due date)
- Search (title / description)

### 🎤 Voice Task Creation (Main USP)

- Speak naturally to create tasks
- Auto-extraction of:
  - Title
  - Priority (high / low / medium / critical)
  - Due date (e.g., “tomorrow”, “next Monday”)
  - Status (default: To Do)
- Preview parsed values before saving
- Ability to edit parsed values for accuracy

---

### Install steps

1. **Install & configure Backend**
   ```bash
   cd backend
   npm install
   ```
   Create `backend/.env`:
   ```env
   MONGODB_URI=""
   PORT=4000
   OPENROUTER_API_KEY=""
   OPENROUTER_API_URL="https://openrouter.ai/api/v1/chat/completions"
   ```


2. **Install & configure Frontend**
   ```bash
   cd ../frontend
   npm install
   ```

### Email Sending / Receiving Configuration

- **Current status**: This assignment does not include email sending or receiving functionality.

- All tasks are created and updated directly through the web application using manual forms and voice input.

- For future enhancement, the backend could be integrated with a transactional email provider (e.g., SendGrid, SES, Resend) to:

- Deliver email notifications whenever a task is created or modified.

- Potentially convert incoming emails into tasks — however, this capability is not within the scope of the current assignment.

### How to run everything locally

1. **Start Backend** (from `backend/` directory)

   ```bash
   npm run dev
   ```

   Backend runs on `http://localhost:4000`

2. **Start Frontend** (from `frontend/` directory)

   ```bash
   npm run dev
   ```

   Frontend runs on `http://localhost:5173`

3. **Open Browser**
   Navigate to `http://localhost:5173`

## 📖 API Documentation

### Base URL

`http://localhost:4000/api`

### Endpoints

#### Tasks

**GET /api/tasks**

- Get all tasks with optional filters
- Query params: `status`, `priority`, `dueDate`, `search`
- Success: `200 OK` with array of tasks
- Errors:
  - `400 Bad Request` for invalid query parameters
  - `500 Internal Server Error` for unexpected failures

**GET /api/tasks/:id**

- Get single task by ID
- Success: `200 OK` with task object
- Errors:
  - `404 Not Found` when the task does not exist

**POST /api/tasks**

- Create a new task
- Body: `{ title, description?, status?, priority?, dueDate? }`
- Success: `201 Created` with task object
- Errors:
  - `400 Bad Request` when `title` is missing or invalid

**PUT /api/tasks/:id**

- Update a task
- Body: `{ title?, description?, status?, priority?, dueDate? }`
- Success: `200 OK` with updated task object
- Errors:
  - `400 Bad Request` for invalid fields
  - `404 Not Found` when the task does not exist

**DELETE /api/tasks/:id**

- Delete a task
- Success: `204 No Content`
- Errors:
  - `404 Not Found` when the task does not exist

#### Speech-to-Text

**POST /api/speech-to-text**

- Convert audio to text using Deepgram
- Body: Raw audio file (WebM format)
- Success: `200 OK` with `{ transcript: string }`
- Errors:
  - `400 Bad Request` when no audio is received
  - `502 Bad Gateway` when Deepgram fails or returns no transcript

#### Parse

**POST /api/parse**

- Parse natural language transcript into structured task data
- Body: `{ transcript: string }`
- Success: `200 OK` with `{ transcript, parsed: { title, description, priority, status, dueDate } }`
- Errors:
  - `400 Bad Request` when transcript is missing
  - `500 Internal Server Error` for unexpected parsing failures
  - `502 Bad Gateway` when the parser returns an invalid response

## User Flows

### Flow 1: Manual Task Creation

1. Click "Add Task" button
2. Fill in form fields (title, description, status, priority, due date)
3. Click "Save"
4. Task appears in appropriate column/list

### Flow 2: Voice Task Creation

1. Click microphone icon
2. Speak: "Create a high priority task to review the pull request by tomorrow evening"
3. Click "Stop Recording"
4. Review parsed fields in modal (transcript, title, priority, due date)
5. Edit if needed, then click "Create Task"
6. Task appears on board

### Flow 3: Task Update

1. Click on existing task
2. Edit fields in modal
3. Click "Save"
4. Task updates in real-time

### Flow 4: Drag-and-Drop (Kanban)

1. Drag task card from one column to another
2. Task status updates automatically
3. Changes persist to database



## 🔧 Decisions & Assumptions

### 🟣 Design Decisions

1. **Database Selection — MongoDB + Mongoose**
   - Chose MongoDB for flexible schema and rapid development.
   - Task document includes: `title`, `description`, `status`, `priority`, `dueDate`, timestamps.

2. **Voice Input Flow — Browser-Native + NLP**
   - Speech-to-Text using **Google Web Speech API (Browser)** to avoid paid APIs and reduce latency.
   - No dependence on Deepgram / OpenRouter for runtime voice processing.
   - Smart NLP implemented using:
     - `chrono-node` for natural date parsing
     - keyword rules for priority & status
     - string cleanup to auto-extract task title

3. **Parsing Strategy**
   - Parsed fields are always shown to the user before saving.
   - Description retains full transcript to preserve context.
   - Defaults selected to avoid blocking the flow:
     - Status → `TO_DO`
     - Priority → `MEDIUM`

4. **Frontend Architecture**
   - Single Page Application using **React + Vite**.
   - No Redux required because the app fits local state models cleanly.
   - UI focus on productivity:
     - Modal form UX
     - Board + List view toggling
     - Drag-and-drop task updates

5. **API Design**
   - REST-style endpoints using **Express.js**.
   - Logical resource paths `/api/tasks` and `/api/parse`.
   - Proper HTTP status codes:
     - `201` → create success
     - `204` → delete success
     - `404` → not found
     - `400` → validation errors
   - Error messages follow consistent JSON format.

6. **Drag-and-Drop Persistence**
   - UI updates immediately on drag.
   - Only `status` field is sent to backend to reduce payload size.

---

### 🟢 Assumptions

- App is **single-user only** as per assignment scope (no authentication).
- NLP date understanding is based on **server local timezone**.
- Priority defaults to **MEDIUM** when unclear.
- Status defaults to **TO_DO** when unspecified.
- Browser mic permission is available for speech recording.
- User has internet access for MongoDB Atlas connectivity.

---

### ⚠️ Known Limitations (Accepted as Out-of-Scope)

- NLP may misinterpret ambiguous sentences occasionally.
- `chrono-node` may not interpret abstract expressions like  
  *“in the evening after lunch”* precisely.
- No WebSocket / real-time synchronization.
- No email reminders / notification system.
- No subtasks / labels / multi-project support.

---

