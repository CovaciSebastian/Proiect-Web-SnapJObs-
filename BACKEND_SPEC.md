# Backend Specification - SnapJobs

## 1. Technology Stack
*   **Runtime:** Node.js
*   **Framework:** Express.js (REST API)
*   **Database:** PostgreSQL (v16+)
*   **Containerization:** Docker & Docker Compose (for the database)
*   **Deployment/Process Management:** PM2 (Process Manager 2)
*   **Web Server/Proxy:** Nginx (Reverse Proxy & Static File Serving)

## 2. Architecture Overview
The application will transition from a "Serverless" static site to a standard Client-Server architecture.
*   **Frontend:** The existing HTML/JS files will serve as the client. They will fetch data from the API instead of `jobs.json`.
*   **Backend:** A new Node.js application (likely in a `/server` or root directory) will handle requests.
*   **Database:** Stores persistent data, replacing `localStorage`.

## 3. Database Schema (PostgreSQL)

### 3.1. Users Table (`users`)
Stores both Students and Employers.
*   `id` (Primary Key, UUID or Serial)
*   `email` (String, Unique, Not Null)
*   `password_hash` (String, Not Null) - *Security: Never store plain text passwords.*
*   `name` (String, Not Null) - *Full name.*
*   `phone` (String, Nullable)
*   `city` (String, Nullable)
*   `university` (String, Nullable)
*   `about` (Text, Nullable) - *About me description.*
*   `title` (String, Nullable) - *e.g., "Computer Science Student" or "Marketing Manager".*
*   `role` (String, Default: 'student') - *Values: 'student', 'employer'.*
*   `created_at` (Timestamp, Default: Now)

### 3.2. Jobs Table (`jobs`)
Replaces `data/jobs.json`.
*   `id` (Primary Key, Serial)
*   `employer_id` (Foreign Key -> users.id) - *Links job to the user who posted it.*
*   `title` (String, Not Null)
*   `company` (String, Not Null) - *Kept as string for simplicity per requirements.*
*   `type` (String, Not Null) - *Values: 'eveniment', 'online', 'fizic'.*
*   `salary` (String, Not Null) - *e.g., "250 RON/zi".*
*   `location` (String, Not Null)
*   `lat` (Float, Nullable) - *Latitude for maps.*
*   `lng` (Float, Nullable) - *Longitude for maps.*
*   `description` (Text, Not Null)
*   `image_url` (String, Nullable) - *Path to image.*
*   `created_at` (Timestamp, Default: Now)

### 3.3. Applications Table (`applications`)
Tracks who applied to what.
*   `id` (Primary Key, Serial)
*   `job_id` (Foreign Key -> jobs.id)
*   `student_id` (Foreign Key -> users.id)
*   `applied_at` (Timestamp, Default: Now)
*   *Constraint: A student can only apply to a specific job ID once.*

## 4. API Endpoints (Express)

### 4.1. Authentication (`/api/auth`)
*   `POST /register`: Accepts name, email, password, phone, city, etc. Creates user.
*   `POST /login`: Accepts email, password. Returns JWT (JSON Web Token) or Session ID.

### 4.2. Jobs (`/api/jobs`)
*   `GET /`: Returns all jobs. Supports query params for filtering (e.g., `?type=online`).
*   `GET /:id`: Returns details for a single job.
*   `POST /`: (Protected) Employer posts a new job.

### 4.3. Applications (`/api/applications`)
*   `POST /`: (Protected) Student applies to a job. Body: `{ jobId: 123 }`.
*   `GET /my-applications`: (Protected) Returns list of jobs the current user applied to.

## 5. Detailed Implementation Guidelines

### 5.1. Database Interaction (ORM)
We will use **Prisma ORM** for interacting with PostgreSQL.
*   **Why?** It generates type-safe database clients, handles migrations (schema changes) automatically, and is very developer-friendly.
*   **Schema File:** `prisma/schema.prisma` will define the models (`User`, `Job`, `Application`).

### 5.2. Data Validation
We will use **Zod** or **Joi** for validating incoming request data.
*   *Example:* Ensure email is valid format, password is min 6 chars, salary is a valid string, etc.
*   Middleware will catch invalid data before it reaches the database logic.

### 5.3. Authentication & Security
*   **Passwords:** Hashed using `bcryptjs`.
*   **Sessions:** Use **JSON Web Tokens (JWT)** sent in an `HttpOnly` cookie or Authorization header. This allows the backend to verify the user without storing state.
*   **CORS:** Configured to allow requests only from the frontend domain (or localhost during dev).

### 5.4. Error Handling
*   Global Error Handler middleware in Express.
*   Standardized JSON error responses:
    ```json
    {
      "success": false,
      "message": "Invalid email or password",
      "code": "AUTH_ERROR"
    }
    ```

---

## 6. Phased Implementation Plan

This plan breaks the transition into manageable chunks. We will verify functionality at each checkpoint before moving on.

### Phase 1: Environment & Database Setup
*   **Goal:** Have a running backend server and a database that we can connect to.
*   **Tasks:**
    1.  Initialize `server/` directory (`npm init`).
    2.  Create `docker-compose.yml` for PostgreSQL.
    3.  Install Express, Prisma, pg.
    4.  Define Prisma schema (`User`, `Job`, `Application`) and run first migration.
*   **Checkpoint 1:** Can run `docker compose up` and see the database running. Can connect Prisma Studio and manually add a row.

### Phase 2: User Authentication (The Foundation)
*   **Goal:** Users can register and login via the API.
*   **Tasks:**
    1.  Implement `POST /api/auth/register` (hashing password).
    2.  Implement `POST /api/auth/login` (generating JWT).
    3.  Create an `authMiddleware` to protect future routes.
*   **Checkpoint 2:** Use Postman/Curl to register a user, then login and receive a Token.

### Phase 3: Public Data (Jobs API)
*   **Goal:** Replace `jobs.json` with the Database.
*   **Tasks:**
    1.  Create `seed.js` script to import existing data from `data/jobs.json` into Postgres.
    2.  Implement `GET /api/jobs` (filtering logic matches current frontend).
    3.  Implement `GET /api/jobs/:id`.
*   **Checkpoint 3:** Hitting `/api/jobs` returns the JSON list of jobs from the database.

### Phase 4: Frontend Integration (Read-Only)
*   **Goal:** The website displays data from the server.
*   **Tasks:**
    1.  Modify `assets/js/script.js` to fetch from `http://localhost:3000/api/jobs`.
    2.  Handle loading states (spinner/skeleton) if needed.
*   **Checkpoint 4:** Opening `index.html` shows jobs loaded from the backend. Search filtering works.

### Phase 5: Interactive Features (Write Access)
*   **Goal:** Users can Apply and Post jobs.
*   **Tasks:**
    1.  Frontend: Update Login/Register forms to call `/api/auth/...`.
    2.  Backend: Implement `POST /api/applications` (Apply logic).
    3.  Backend: Implement `POST /api/jobs` (Post job logic).
    4.  Frontend: Connect "Apply" button to API.
*   **Checkpoint 5:** A user can login, click "Apply", and the application appears in the database `applications` table.

### Phase 6: Deployment Prep
*   **Goal:** Production readiness.
*   **Tasks:**
    1.  Configure Nginx reverse proxy block.
    2.  Setup PM2 ecosystem file.
    3.  Environment variables for secrets (`.env`).
*   **Checkpoint 6:** App runs via PM2, accessible via Nginx (localhost or domain).

---

## 7. Context & Constraints for Implementation

**Crucial Context for the AI/Developer executing this spec:**

### 7.1. Current Project State
*   The project is currently a **Static Website** (HTML/CSS/Vanilla JS).
*   Data is currently loaded from `data/jobs.json` and `localStorage`.
*   The project file structure is in the middle of a migration (see `RESTRUCTURE_SPEC.md`), so be careful with relative paths.

### 7.2. Strict Constraints
1.  **Frontend Technology:** DO NOT refactor the frontend into a framework like React, Vue, or Angular. It **must remain Vanilla JavaScript**. The goal is to connect the *existing* frontend to the new backend.
2.  **Directory Structure:**
    *   All backend code (Express app, Prisma, configs) should reside in a new folder named `server/` at the project root.
    *   The frontend files (`index.html`, `assets/`, `pages/`) should remain where they are (serving as the "client").
3.  **Port Configuration:**
    *   Frontend (Live Server/Nginx): Port 80/5500 (standard web).
    *   Backend API: Port 3000 (standard Node).
    *   PostgreSQL: Port 5432.
4.  **Docker Usage:**
    *   **Required:** PostgreSQL must run in a Docker container.
    *   **Optional:** The Node.js application can run locally during dev, but a `Dockerfile` for the API is a "nice to have" for future deployment.

### 7.3. Deliverables
*   A fully functional `server/` directory.
*   A modified `assets/js/` folder where `fetch` calls now point to `http://localhost:3000/api/...`.
*   A `README_BACKEND.md` explaining how to start the DB and API.

