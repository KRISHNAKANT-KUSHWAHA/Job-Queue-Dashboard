# Mini Job Queue Dashboard

A simple, practical, and clean background job management dashboard built with a **JavaScript-only** stack: **React (Vite)** on the frontend and **NestJS (TypeORM + SQLite)** on the backend.

Built as an intern/junior engineering assignment focusing on solid fundamentals: straightforward state management, strict business rules, request validation, real-world concurrency handling (race conditions), and readable code that can be explained line-by-line.

---

## Features

- **Job Management**: Create new background jobs with custom title and type (`email`, `report`, `backup`, `export`, `cleanup`).
- **Live Status Counters**: Displays real-time counts for `Pending`, `Running`, `Completed`, and `Failed` jobs.
- **Enforced Status Transitions**:
  - `pending` → `running` or `failed`
  - `running` → `completed` or `failed`
  - Completed and failed jobs are terminal and cannot be restarted.
- **Concurrency & Race Condition Protection**: Handles simultaneous requests (e.g., two browser tabs updating the same job at the same time) via atomic conditional database updates, returning `409 Conflict`.
- **Status Filtering**: Filter dashboard view by status (`All`, `Pending`, `Running`, `Completed`, `Failed`) with live-updating counts.
- **Immediate User Feedback**: Friendly contextual actions (`Run`, `Complete`, `Fail`, `Delete`), loading states, and automatic refresh on concurrency conflicts.

---

## Tech Stack

### Frontend
- **React 19** + **Vite**: Fast and lightweight modern React environment.
- **JavaScript (JSX)**: Plain JavaScript without TypeScript complexity.
- **Axios**: Clean HTTP client for backend communication.
- **Vanilla CSS**: Responsive, clean UI without extra CSS framework bloat.

### Backend
- **NestJS**: Modular server architecture with Controllers, Services, and DTOs.
- **JavaScript (ES6+)**: Pure JavaScript with Babel decorators.
- **TypeORM** + **SQLite (`better-sqlite3`)**: Lightweight embedded relational database requiring zero external services to run.
- **class-validator** & **class-transformer**: Request payload validation.

---

## Project Structure

```text
job-queue-dashboard/
│
├── backend/
│   ├── src/
│   │   ├── jobs/
│   │   │   ├── dto/
│   │   │   │   ├── create-job.dto.js
│   │   │   │   └── update-job-status.dto.js
│   │   │   ├── job.entity.js
│   │   │   ├── jobs.controller.js
│   │   │   ├── jobs.service.js
│   │   │   └── jobs.module.js
│   │   │
│   │   ├── app.module.js
│   │   └── main.js
│   │
│   ├── test/
│   │   └── test-api.js
│   ├── database.sqlite
│   ├── package.json
│   └── README.md
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── JobForm.jsx
│   │   │   ├── JobList.jsx
│   │   │   └── StatusFilter.jsx
│   │   │
│   │   ├── services/
│   │   │   └── jobApi.js
│   │   │
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   │
│   ├── .env
│   ├── package.json
│   └── README.md
│
└── README.md
```

---

## Setup & Running Instructions

### Prerequisites
- **Node.js**: v18+ (tested on Node v22.19.0)
- **npm**: v9+

### 1. Backend Setup

```bash
cd backend
npm install
npm start
```

The backend server will start on: **`http://localhost:3000`**  
The SQLite database file (`database.sqlite`) will automatically be created on startup.

To run the automated API and concurrency tests:
```bash
npm test
```

### 2. Frontend Setup

In a new terminal:

```bash
cd frontend
npm install
npm run dev
```

The frontend dashboard will be available at: **`http://localhost:5173`**

---

## API Endpoints

| Method | Endpoint | Description | Sample Body |
| :--- | :--- | :--- | :--- |
| `POST` | `/jobs` | Create a new job (`pending`) | `{"title": "Sync Customer Data", "type": "export"}` |
| `GET` | `/jobs` | Fetch all jobs (ordered newest first) | _None_ (supports `?status=pending`) |
| `PATCH` | `/jobs/:id/status` | Update job status | `{"status": "running"}` |
| `DELETE` | `/jobs/:id` | Delete a job | _None_ |

### Response Examples

**`POST /jobs` (201 Created):**
```json
{
  "id": 1,
  "title": "Sync Customer Data",
  "type": "export",
  "status": "pending",
  "createdAt": "2026-09-15T10:15:30.000Z",
  "updatedAt": "2026-09-15T10:15:30.000Z"
}
```

**`PATCH /jobs/1/status` (400 Bad Request - Invalid Transition):**
```json
{
  "statusCode": 400,
  "message": "Invalid status transition: cannot change job from 'completed' to 'running'",
  "error": "Bad Request"
}
```

**`PATCH /jobs/1/status` (409 Conflict - Race Condition):**
```json
{
  "statusCode": 409,
  "message": "Job was already updated by another request. Please refresh and try again.",
  "error": "Conflict"
}
```

---

## Job Status Flow

Jobs strictly follow this state transition graph:

```text
       ┌───────────┐
       │  pending  │
       └─────┬─────┘
             │
      ┌──────┴──────┐
      ▼             ▼
┌───────────┐ ┌───────────┐
│  running  │ │  failed   │
└─────┬─────┘ └───────────┘
      │
 ┌────┴────┐
 ▼         ▼
┌───────────┐ ┌───────────┐
│ completed │ │  failed   │
└───────────┘ └───────────┘
```

- **Allowed transitions**:
  - `pending` → `running`
  - `pending` → `failed`
  - `running` → `completed`
  - `running` → `failed`
- **Disallowed**:
  - Any transition from `completed` or `failed` (terminal states).
  - Any backwards transition (e.g. `running` → `pending`).
- Transitions are verified in `jobs.service.js` with an explicit transition map:
  ```javascript
  const allowedTransitions = {
    pending: ['running', 'failed'],
    running: ['completed', 'failed'],
    completed: [],
    failed: [],
  };
  ```

---

## Concurrency Handling

### The Problem
Imagine two users open the dashboard in separate browser tabs at the same time. Both see Job #1 as `pending`. Both users click `Run` almost simultaneously.
If not handled carefully, both requests might pass read-checks and perform redundant execution or leave the system in an inconsistent state.

### How It Is Solved
1. **Frontend**: Only displays actions that are valid for the currently loaded state. When an update fails with `409 Conflict`, the frontend displays:
   > *"This job was updated by another user. Refreshing..."*
   and immediately re-fetches the latest job list.
2. **Backend**: Never relies on client-side state. It inspects current state and rejects illegal transitions with HTTP 400.
3. **Database Layer (Atomic Conditional Update)**:
   To prevent race conditions between read and write, we execute a conditional update:
   ```javascript
   // Only update if the job is STILL in the expected current status
   const result = await this.jobsRepository.update(
     { id: Number(id), status: job.status },
     { status: newStatus }
   );

   if (result.affected === 0) {
     throw new ConflictException(
       'Job was already updated by another request. Please refresh and try again.'
     );
   }
   ```
   Under the hood, SQLite executes:
   ```sql
   UPDATE jobs SET status = :newStatus WHERE id = :id AND status = :currentStatus
   ```
   If another request updated the job just milliseconds before, the `WHERE` condition matches 0 rows. The service detects `affected === 0` and returns `409 Conflict`.

---

## Validation

- Handled via **`class-validator`** and **`class-transformer`** DTOs:
  - `CreateJobDto`: Ensures `title` and `type` are non-empty strings.
  - `UpdateJobStatusDto`: Ensures `status` is one of `['running', 'completed', 'failed']`.
- If invalid data is sent (e.g., empty title or disallowed status), the server rejects it with `400 Bad Request` and descriptive error messages.

---

## Assumptions

1. **Local Single-Node Deployment**: Designed to run seamlessly without cloud infrastructure or third-party container setups.
2. **Sequential Transitions**: Jobs move forward in the pipeline and cannot be reset to `pending` once they start running.
3. **Default Status**: All newly created jobs start in `pending`.

---

## Trade-offs

- **SQLite vs PostgreSQL**: I used SQLite (`better-sqlite3`) because it requires zero installation or database server setup for evaluators. For a multi-instance production environment, PostgreSQL would be preferred for concurrent write throughput and row-level locking.
- **Polling vs WebSockets**: The dashboard uses lightweight HTTP requests with a quick manual refresh and automatic conflict-triggered refresh. For high-volume production queues, Server-Sent Events (SSE) or WebSockets would provide instant multi-user synchronization.
- **In-process Queue vs BullMQ/Redis**: Rather than introducing Redis and background worker queues, this assignment models the queue dashboard and state management cleanly with NestJS + SQLite, keeping the codebase simple and easy to understand.

---

## Bonus Improvement

**Execution Timestamp Tracking & Dynamic Ordering**:
- Added an automatic `updatedAt` timestamp alongside `createdAt` in `JobEntity`.
- Added automatic sorting by `createdAt: 'DESC'` so newly queued jobs always appear at the top of the table.
- Formatted human-readable date & time display (`MMM D, HH:mm:ss`) in the table so operators can see exact timestamps for when a job was submitted or transitioned.

---

## Challenges Faced (Post-Deployment)

Deploying a decoupled full-stack application (Frontend on Vercel and Backend on Render) presented a few practical post-deployment challenges:

### 1. Client-Side Environment Variables & Cross-Origin Cloud Connection
- **The Challenge**: When deploying the frontend to Vercel and the backend to Render, Vite requires all client-accessible environment variables to be explicitly prefixed with `VITE_` (e.g., `VITE_API_URL`) and bakes them into the static bundle at build time. If named without the prefix (like `API_URL`) or updated without triggering a fresh deployment, Vite strips the variable, causing the production frontend to fall back to `http://localhost:3000` and throw connection errors.
- **The Solution**: Designed a smart fallback resolver in `jobApi.js` that inspects `import.meta.env.VITE_API_URL` and `import.meta.env.API_URL`, checks whether the app is executing on `localhost` versus cloud hosting (`window.location.hostname`), and automatically routes to the live Render backend (`https://job-queue-dashboard-vtov.onrender.com`) on production. This ensures the live Vercel deployment works seamlessly out of the box.

### 2. Cloud Observability & Live Request Logging
- **The Challenge**: By default, NestJS only outputs server startup logs (`Mapped route`, `Nest application started`). Once deployed on Render, individual incoming HTTP requests triggered from the Vercel frontend (such as `GET /jobs`, `POST /jobs`, and `PATCH /jobs/:id/status`) were not visible in Render's live logs, making it difficult to trace incoming traffic.
- **The Solution**: Implemented a custom HTTP request logging middleware in `main.js` that prints `[METHOD] /url - statusCode (duration ms)` for every incoming request directly to the stdout stream. Additionally, added dedicated `/health` and `/api/health` monitoring endpoints to inspect server uptime and health at any time.

---

## Future Improvements

1. **Automatic Retry with Backoff**: Allow failed jobs to be retried up to 3 times before entering a permanent `dead-letter` status.
2. **Server-Sent Events (SSE)**: Stream real-time status updates to all connected browser sessions without requiring manual refresh.
3. **Pagination & Search**: Add page-based pagination (`limit` & `offset`) and search query filtering for when the job queue grows beyond thousands of records.
4. **Execution Duration Metrics**: Track `startedAt` and `completedAt` to show average runtime and throughput per job type.

