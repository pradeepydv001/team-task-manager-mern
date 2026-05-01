# Task Manager

A full-stack MERN web application where users can create projects, assign tasks, and track progress with role-based access control for Admin and Member users.

The app includes authentication, project and team management, task assignment, status tracking, dashboard analytics, and a role-specific interface.

## Features

- Signup and login authentication
- JWT-based protected REST APIs
- Admin and Member role-based access control
- Project creation and team member assignment
- Task creation, assignment, priority, due date, and status tracking
- Admin-only project and task delete actions
- Dashboard with total tasks, pending, in-progress, completed, and overdue counts
- Task distribution and priority-level charts
- Team Members page with member-wise task progress
- Downloadable task report for Admin users
- MongoDB relationships between users, projects, and tasks
- Backend validations with clear error responses

## Tech Stack

Frontend:

- React.js
- Vite
- CSS
- Lucide React icons

Backend:

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- bcryptjs
- express-validator
- Helmet
- CORS

## Project Structure

```text
Task Manager
|-- client
|   |-- src
|   |   |-- api
|   |   |-- components
|   |   |-- context
|   |   |-- pages
|   |   |-- App.jsx
|   |   |-- main.jsx
|   |   `-- styles.css
|   |-- index.html
|   `-- vite.config.js
|-- server
|   |-- src
|   |   |-- config
|   |   |-- controllers
|   |   |-- middleware
|   |   |-- models
|   |   |-- routes
|   |   |-- app.js
|   |   `-- server.js
|   |-- .env.example
|   `-- package.json
|-- package.json
`-- README.md
```

## Getting Started

### 1. Install Dependencies

From the project root:

```bash
npm run install:all
```

This installs dependencies for the root project, backend, and frontend.

### 2. Configure Environment Variables

Create or update `server/.env`:

```env
PORT=5001
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_long_random_secret
CLIENT_URL=http://localhost:5173
```

For local MongoDB, you can use:

```env
MONGO_URI=mongodb://127.0.0.1:27017/team_task_manager
```

For MongoDB Atlas, paste your Atlas connection string in `MONGO_URI`.

### 3. Run The App

From the project root:

```bash
npm run dev
```

Frontend:

```text
http://localhost:5173
```

Backend API:

```text
http://localhost:5001/api
```

Health check:

```text
http://localhost:5001/api/health
```

## Available Scripts

Root scripts:

```bash
npm run install:all
npm run dev
npm start
```

Client scripts:

```bash
npm run dev --prefix client
npm run build --prefix client
npm run preview --prefix client
```

Server scripts:

```bash
npm run dev --prefix server
npm start --prefix server
```

## User Roles

Admin:

- Create projects
- Add team members to projects
- Create and assign tasks
- Manage task status
- Delete tasks
- Delete projects
- View Team Members screen
- Download task report

Member:

- View assigned tasks
- Update assigned task status
- View dashboard analytics for their own work

## API Endpoints

Authentication:

```text
POST /api/auth/signup
POST /api/auth/login
GET  /api/auth/me
GET  /api/auth/users
```

Projects:

```text
GET    /api/projects
POST   /api/projects
PUT    /api/projects/:id
DELETE /api/projects/:id
```

Tasks:

```text
GET    /api/tasks
POST   /api/tasks
PUT    /api/tasks/:id
DELETE /api/tasks/:id
```

Dashboard:

```text
GET /api/dashboard
```

## Database Models

User:

- name
- email
- password
- role

Project:

- name
- description
- owner
- members

Task:

- title
- description
- status
- priority
- dueDate
- project
- assignedTo
- createdBy

## Validation And Security

- Passwords are hashed with bcryptjs.
- JWT tokens protect private routes.
- Admin-only routes are protected by backend middleware.
- User input is validated with express-validator.
- MongoDB relationships are validated before creating projects and tasks.
- Helmet adds basic security headers.
- CORS is configured for the frontend development server.

## Demo Flow

1. Sign up as an Admin.
2. Create one or more Member accounts.
3. Log in as Admin.
4. Create a project.
5. Add members to the project.
6. Create tasks and assign them to members.
7. Open Team Members to review each member's task progress.
8. Open Dashboard to review status and priority charts.
9. Log in as a Member.
10. Open My Tasks and update task status.
11. Log back in as Admin and delete a task or project if needed.

## Notes

- Keep `server/.env` private. Do not share MongoDB credentials or JWT secrets.
- If port `5001` is already in use, stop the existing backend process or change `PORT` in `server/.env`.
- If Vite says port `5173` is already in use, stop the existing frontend process and run the app again.
- See `INTERVIEW_GUIDE.md` for a detailed English explanation and interview questions.

## Railway Deployment

This project can be deployed as two Railway services from the same GitHub repo:

- Backend service
- Frontend service

### Backend Service

```text
Root Directory: project root
Build Command: npm install && npm run build --if-present
Start Command: npm start
```

Required Railway environment variables:

```env
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_long_random_secret
CLIENT_URL=https://your-frontend-domain.com
```

Railway automatically provides `PORT`, so you do not need to set it manually.

If you deploy only the backend on Railway and the frontend on Vercel/Netlify, set `CLIENT_URL` to the deployed frontend URL. For local testing, keep it as `http://localhost:5173`.

### Frontend Service

Create a second Railway service from the same GitHub repo and set:

```text
Root Directory: client
Build Command: npm install && npm run build
Start Command: npm start
```

Required frontend environment variable:

```env
VITE_API_URL=https://your-backend-domain.up.railway.app/api
```

After the frontend deploys, copy the frontend Railway domain and update the backend service variable:

```env
CLIENT_URL=https://your-frontend-domain.up.railway.app
```

Then redeploy the backend so CORS allows the frontend.
