# SnapJobs Backend

This directory contains the Node.js/Express backend for the SnapJobs application.

## Prerequisites

*   Node.js (v18+)
*   Docker (for PostgreSQL)

## Setup

1.  **Navigate to the server directory:**
    ```bash
    cd server
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Start the Database:**
    ```bash
    docker compose up -d
    ```

4.  **Run Migrations:**
    ```bash
    npx prisma migrate dev
    ```

5.  **Seed the Database:**
    ```bash
    node seed.js
    ```

## Running the Server

### Development
```bash
npx nodemon index.js
```
The API will be available at `http://localhost:3000`.

### Production (PM2)
```bash
pm2 start ecosystem.config.js
```

## API Endpoints

### Auth
*   `POST /api/auth/register` - Register a new user
*   `POST /api/auth/login` - Login

### Jobs
*   `GET /api/jobs` - Get all jobs
*   `GET /api/jobs/:id` - Get job details
*   `POST /api/jobs` - Post a new job (Employer only)

### Applications
*   `POST /api/applications` - Apply to a job
*   `GET /api/applications/my-applications` - Get my applications

## Environment Variables

Create a `.env` file in `server/`:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/snapjobs?schema=public"
JWT_SECRET="your_jwt_secret"
PORT=3000
```
