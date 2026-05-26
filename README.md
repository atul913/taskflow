# ⚡ TaskFlow — Smart Task Manager

A full-stack MERN task management app with automatic priority scoring based on deadline urgency and task importance.

## Live Demo
- **Frontend:** *(deploy to Vercel and paste URL here)*
- **Backend API:** *(deploy to Render and paste URL here)*

---

## Priority Score Formula

```
priorityScore = (importance × 10) + (100 / max(daysUntilDue, 1))
```

- Computed **server-side at read time** (not stored in DB)
- Completed tasks always return `priorityScore: 0`
- Rounded to 2 decimal places
- Tasks with `priorityScore >= 50` are highlighted as **High Priority** in the UI

---

## Project Structure

```
taskflow/
├── backend/          # Express + MongoDB API
│   ├── src/
│   │   ├── index.js          # Entry point, DB connection
│   │   ├── app.js            # Express setup, CORS, routes
│   │   ├── models/Task.js    # Mongoose schema + priorityScore virtual
│   │   ├── routes/tasks.js   # Route definitions
│   │   └── controllers/taskController.js  # Business logic
│   ├── .env.example
│   └── package.json
└── frontend/         # React SPA
    ├── src/
    │   ├── App.js
    │   ├── components/
    │   │   ├── StatsCard.js      # Bonus: Analytics dashboard
    │   │   ├── CreateTaskForm.js # New task form with validation
    │   │   ├── Filters.js        # Status + importance filters
    │   │   ├── TaskList.js       # List with loading/empty/error states
    │   │   └── TaskCard.js       # Individual task card
    │   ├── hooks/useTasks.js     # Central state management
    │   ├── utils/api.js          # API client
    │   ├── utils/dateUtils.js    # Date formatting helpers
    │   └── styles/App.css        # All styles
    └── package.json
```

---

## Local Setup

### Prerequisites
- Node.js 18+
- MongoDB (local) or MongoDB Atlas account

### Backend

```bash
cd backend
cp .env.example .env
# Edit .env: set MONGODB_URI and PORT

npm install
npm run dev
```

API available at `http://localhost:5000`

### Frontend

```bash
cd frontend
cp .env.example .env
# Edit .env: REACT_APP_API_URL=http://localhost:5000

npm install
npm start
```

UI available at `http://localhost:3000`

---

## API Reference

Base path: `/bfhl/tasks`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/bfhl/tasks` | Create task |
| `GET` | `/bfhl/tasks` | List tasks (sorted by score DESC) |
| `PATCH` | `/bfhl/tasks/:id` | Update task |
| `DELETE` | `/bfhl/tasks/:id` | Delete task |
| `GET` | `/bfhl/tasks/stats` | Aggregated analytics (bonus) |

### Query Filters

```
GET /bfhl/tasks?status=pending&minImportance=3
```

### Sample Request (Create Task)

```bash
curl -X POST http://localhost:5000/bfhl/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Submit project report",
    "description": "Final draft for review",
    "importance": 5,
    "dueDate": "2026-06-30T00:00:00.000Z"
  }'
```

### Sample Response

```json
{
  "_id": "65f...",
  "title": "Submit project report",
  "description": "Final draft for review",
  "importance": 5,
  "dueDate": "2026-06-30T00:00:00.000Z",
  "status": "pending",
  "createdAt": "2026-05-26T10:00:00.000Z",
  "priorityScore": 85.26
}
```

### Validation Rules

| Field | Rules |
|-------|-------|
| `title` | Required, 3–100 chars |
| `description` | Optional, max 500 chars |
| `importance` | Required, integer 1–5 |
| `dueDate` | Required, must be future date on create |
| `status` | `"pending"` or `"completed"` |

Error responses use HTTP `400` with `{ "error": "message" }`.

---

## Deployment

### Backend → Render

1. Create a new **Web Service** on [Render](https://render.com)
2. Connect your GitHub repo, set root directory to `backend/`
3. Build command: `npm install`
4. Start command: `npm start`
5. Add environment variables:
   - `MONGODB_URI` — your MongoDB Atlas connection string
   - `PORT` — Render sets this automatically
   - `FRONTEND_URL` — your Vercel frontend URL (for CORS)

### Frontend → Vercel

1. Import repo on [Vercel](https://vercel.com)
2. Set root directory to `frontend/`
3. Add environment variable:
   - `REACT_APP_API_URL` — your Render backend URL (e.g. `https://taskflow-api.onrender.com`)
4. Deploy

---

## Bonus Feature: Stats Endpoint

`GET /bfhl/tasks/stats` uses MongoDB's aggregation pipeline (`$facet`, `$group`, `$cond`) to compute:

```json
{
  "totalTasks": 12,
  "pendingTasks": 8,
  "completedTasks": 4,
  "averageImportance": 3.25,
  "overdueTasks": 2,
  "tasksByImportance": { "1": 1, "2": 2, "3": 3, "4": 4, "5": 2 }
}
```

Displayed as a dashboard card at the top of the frontend.

---

## Design Decisions & Assumptions

- `priorityScore` is a Mongoose **virtual field** — computed from live data on every read, never persisted
- `daysUntilDue` uses `Math.floor` and a minimum of 1 (avoids division by zero, per spec)
- `status` can be set on create (defaults to `"pending"`) — useful for seeding or imports
- The `/bfhl/tasks/stats` `overdueTasks` count only includes **pending** tasks past their due date
- CORS is open (`*`) by default for development; set `FRONTEND_URL` env var in production to restrict it
- All filtering is handled at the database level, not in-memory
