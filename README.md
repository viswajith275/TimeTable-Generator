# TimeTable-Generator

A full-stack web application to create constraint-aware class timetables. This repository contains:

- backend/: FastAPI-based backend with the timetable generation logic, models, and routes
- frontend/: Vite + React frontend (development served by Vite)

This README documents how to run the project locally, the exact environment expected by the backend, the API endpoints (with shapes that match the code), and development notes.

---

## Table of contents

- [Quick summary](#quick-summary)
- [Repo layout](#repo-layout)
- [Requirements](#requirements)
- [Configuration (.env)](#configuration-env)
- [Backend — run & development](#backend---run--development)
- [Frontend — run & development](#frontend---run--development)
- [API reference (selected endpoints)](#api-reference-selected-endpoints)
- [Data shapes used by the backend (exact)](#data-shapes-used-by-the-backend-exact)
- [Database](#database)
- [Troubleshooting & common fixes](#troubleshooting--common-fixes)
- [Contributing](#contributing)
- [License & contact](#license--contact)

---

## Quick summary

- Backend: FastAPI application located at `backend/main.py`. The application creates DB tables on startup (see `create_db_and_tables()`).
- Frontend: React app using Vite in `frontend/`, served by `npm run dev` (Vite defaults to port 5173).
- The backend allows CORS only for origin `http://localhost:5173` by default (see `backend/main.py`).

---

## Repo layout

- backend/
  - main.py — FastAPI app and CORS config
  - database.py — SQLAlchemy engine/session helpers and `create_db_and_tables()`
  - models.py — SQLAlchemy models and Pydantic schemas (Users, Teachers, Classes, Assignments, TimeTable, TimeTableEntry)
  - requirements.txt — Python dependencies (FastAPI, uvicorn, SQLAlchemy, ortools, pandas, etc.)
  - routes/ — route modules:
    - Generate_Table.py — endpoints for generating and fetching timetables
    - Add_Teachers.py, Add_Classes.py, Assignment.py, Login.py (routers are included in main.py)
  - Generations/ — generation utilities used by the solver
  - oauth.py — authentication dependency/helpers
  - config.py — loads environment variables from `backend/.env` using python-dotenv
- frontend/
  - index.html
  - package.json — Vite dev scripts and React dependencies
  - src/ — frontend source (React)
  - vite.config.js

---

## Requirements

Backend (development)
- Python 3.8+
- Recommended: create a virtualenv
- Install backend dependencies:
  ```
  pip install -r backend/requirements.txt
  ```
  The repository's `backend/requirements.txt` includes (excerpt):
  - fastapi, uvicorn, SQLAlchemy, sqlmodel, pydantic, pandas, numpy, ortools, python-dotenv, psycopg2-binary (and others)

Frontend
- Node.js (v16+ recommended) and npm or yarn
- Install frontend dependencies from project root:
  ```
  cd frontend
  npm install
  ```

---

## Configuration (.env)

The backend reads environment variables using backend/config.py. Create `backend/.env` (or set environment variables) with these names:

- DATABASE_URL — e.g. `sqlite:///./timetables.db` (for local dev) or a full Postgres URL
- SECRET_KEY — secret used by oauth/token logic
- ACCESS_TOKEN_EXPIRE_MINUTES — integer (e.g. `30`)
- REFRESH_TOKEN_EXPIRE_DAYS — integer (e.g. `7`)

Example backend/.env:
```
DATABASE_URL=sqlite:///./timetables.db
SECRET_KEY=replace_this_with_a_random_string
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7
```

Important: config.py expects `ACCESS_TOKEN_EXPIRE_MINUTES` and `REFRESH_TOKEN_EXPIRE_DAYS` to be present and parseable as integers (it does `int(os.getenv(...))`), otherwise the app will error on startup.

---

## Backend — run & development

1. Create and activate a virtual environment and install dependencies:
   ```bash
   python -m venv .venv
   source .venv/bin/activate   # macOS / Linux
   .venv\Scripts\activate      # Windows PowerShell
   pip install -r backend/requirements.txt
   ```

2. Create `backend/.env` with the required variables (see above).

3. Run the FastAPI dev server using uvicorn from the repository root:
   ```bash
   uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
   ```
   - The app registers routers from `backend/routes/*` and will call `create_db_and_tables()` at startup to create tables (so your DATABASE_URL should point to a writable DB or an SQLite file).

4. Backend CORS default:
   - In `backend/main.py` origins list is set to `["http://localhost:5173"]`. If you serve the frontend from a different origin or port, add that origin to the list.

---

## Frontend — run & development

1. From the project root:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   - Vite's dev server defaults to port 5173, which matches the backend's default allowed origin.

2. If the backend runs on a different port than expected, update the frontend's API base URL (where API calls are made) to match `http://localhost:8000` (or whichever host/port you use), and ensure backend CORS allows the frontend origin.

---

## API reference (selected endpoints)

Routes are defined in `backend/routes/`. The Generate_Table router shows the exact endpoints and request/response shapes:

- GET /timetables
  - Description: Fetch all timetables for the authenticated user.
  - Authentication: required (the route uses the `UserDep` dependency).
  - Response model (List[TimeTableJson]) — each timetable contains assignments; example item:
    ```json
    {
      "id": 1,
      "name": "My Timetable",
      "assignments": [
        {
          "id": 1,
          "assign_id": 10,
          "day": "Monday",
          "slot": 1,
          "subject": "Mathematics",
          "teacher_name": "Alice",
          "class_name": "10A"
        }
      ]
    }
    ```

- POST /generate
  - Description: Generate a timetable using current user's TeacherClassAssignment records.
  - Authentication: required.
  - Request body: `Generate_Data` model (see exact fields below).
  - Behavior (from code): It selects all TeacherClassAssignment entries that belong to the current authenticated user, then calls the solver `Generate_Timetable(...)` in `backend/Generations/utils.py`. If successful returns a success message, otherwise raises a 400 with `'TimeTable is not possible!'`.
  - Example curl (adjust host/port and authentication):
    ```bash
    curl -X POST http://localhost:8000/generate \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer <ACCESS_TOKEN>" \
      -d '{
        "timetable_name": "Week1",
        "slotes": 6,
        "days": ["Monday","Tuesday","Wednesday","Thursday","Friday"]
      }'
    ```
    Note: the field name used in the backend model is exactly `"slotes"` (this is the field name defined in `backend/models.py`) — keep the same spelling.

- DELETE /timetables/{id}
  - Description: Delete a timetable by id (authenticated user must own timetable).
  - Authentication: required.

Other route modules included in `main.py`:
- `backend/routes/Login.py` — authentication/login endpoints (see oauth.py for token logic)
- `backend/routes/Add_Teachers.py` — add/list teachers
- `backend/routes/Add_Classes.py` — add/list classes
- `backend/routes/Assignment.py` — assignment endpoints

All of the above routes are protected by authentication where appropriate; check `backend/oauth.py` and `backend/routes/*` to see exact protection and request bodies.

---

## Data shapes used by the backend (exact)

From `backend/models.py`:

- Generate_Data (request body for POST /generate):
  - Fields:
    - `timetable_name` (string)
    - `slotes` (integer)   <-- exact spelling `slotes`
    - `days` (array of WeekDay strings: "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday")

- TimeTableJson (returned by GET /timetables):
  - `id` (int)
  - `name` (str)
  - `assignments` (list of TimeTableEntryJson)

- TimeTableEntryJson:
  - `id` (int)
  - `assign_id` (int)
  - `day` (str — one of the WeekDay values above)
  - `slot` (int)
  - `subject` (str)
  - `teacher_name` (str)
  - `class_name` (str)

- TeacherClassAssignmentCreate / TeacherCreate / ClassCreate — see `backend/models.py` for request schemas when creating teachers/classes/assignments.

---

## Database

- The app uses SQLAlchemy (declarative base in `backend/models.py`) and `backend/database.py` constructs the engine from `SQL_DATABASE_URL` (the value loaded from environment variable `DATABASE_URL`).
- On startup, the app runs `Base.metadata.create_all(bind=engine)` so the tables are created automatically for local dev (e.g., when using SQLite).
- Example local DATABASE_URL: `sqlite:///./timetables.db`.

If you prefer Postgres, set DATABASE_URL like:
```
postgresql+psycopg2://<user>:<pass>@<host>:<port>/<dbname>
```

---

## Troubleshooting & common fixes

- Missing env values / app fails on startup:
  - config.py calls `int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES"))`. Ensure `ACCESS_TOKEN_EXPIRE_MINUTES` and `REFRESH_TOKEN_EXPIRE_DAYS` are set and numeric in `backend/.env`.
- Frontend can't communicate with backend:
  - Ensure frontend dev server runs at `http://localhost:5173` (Vite default) or add your origin to `origins` in `backend/main.py`.
- `TimeTable is not possible!` from /generate:
  - This indicates the solver couldn't produce a feasible timetable given current assignments/constraints. Check teacher/class assignments and constraints.
- Package versions mismatch:
  - Use the versions from `backend/requirements.txt` and `frontend/package.json` to match tested environments.

---

## Contributing

- Fork the repository, create a branch (`git checkout -b feat/your-feature`), add tests and documentation, and open a PR.
- Keep generator/solver logic testable and independent of HTTP layer.

---

## Next steps I can help with

- Add the README to the repo (commit to `main` or open a PR).
- Create `backend/.env.example` and a `docker-compose.yml` tuned for this repo.
- Update the frontend to read the backend API base URL from an environment variable and document the exact API base path.

---

## License & contact

Repository owner and maintainer: viswajith275 — open an issue for questions or further changes.
