# ⚡ PulseFlow — Full Stack Project Management System (Web + Mobile)

PulseFlow is a modern, cross-platform Project and Task Management platform featuring a **Web Application**, a **Native Mobile Application (Android/iOS)**, and a **High-Performance Node.js REST API**, sharing a unified database and authentication architecture.

Built with an aesthetic inspired by Linear and Vercel, PulseFlow enables users to organize initiatives, visualize task workflows via **Kanban Boards** and **List Views**, monitor real-time velocity metrics, and sync state seamlessly across mobile and web.

---

## 🌟 Key Features

### 🔐 Authentication & Security
- **Cross-Platform Single Sign-On**: Register once on web or mobile and log in everywhere.
- **Hardware-Backed Token Storage**: Mobile tokens stored via **Android Keystore** and **iOS Keychain** (using `expo-secure-store`), avoiding plain local storage.
- **Bcrypt Password Hashing**: Zero plain-text passwords stored (salted bcrypt rounds).
- **Session Expiry Handling**: Clear warning and immediate redirect to login screen on expired tokens (`401 Unauthorized`).
- **Rate Limiting**: Brute-force protection on authentication routes (`/api/auth/*`).
- **SQL Injection Immune**: Built with Prisma ORM utilizing prepared statements and parameterized queries.
- **Network Resilience**: Offline state detection displaying informative network messages without application crashes.

### 📁 Project Management
- Complete project lifecycle: **Not Started**, **In Progress**, **Completed**.
- Dynamic completion rate calculation (`%` derived from underlying task states).
- Project timeline tracking: Start Date, End Date, and Creation timestamps.
- Search projects by name with instant debounced filtering.
- Filter by project status.

### 📝 Task Management
- Nested tasks within projects.
- Priority management: **Low**, **Medium**, **High**.
- Status workflow: **Pending**, **In Progress**, **Completed**.
- **Interactive Kanban Board View** & **Structured List View** toggle.
- Search tasks by name and filter by project, priority, and status.
- Instant single-tap task completion toggles.

### 📊 Real-Time Dashboard
- 5 Executive KPI Metrics:
  - Total Projects
  - Total Tasks
  - Completed Tasks
  - Pending Tasks
  - Projects In Progress
- Overall Task Velocity progress bar.
- Recent Projects snapshot with completion rates.
- Urgent & upcoming due date task watchlist.

---

## 🏗️ Architecture & Tech Stack

```
PulseFlow System Architecture
┌─────────────────────────┐     ┌─────────────────────────┐
│     Web Application     │     │    Mobile Application   │
│  React + Vite + Tailwind│     │   React Native + Expo   │
└────────────┬────────────┘     └────────────┬────────────┘
             │                               │
             │         HTTP / REST API       │
             └───────────────┬───────────────┘
                             ▼
              ┌─────────────────────────────┐
              │    Node.js Express API      │
              │  TypeScript • JWT • Helmet  │
              │  Rate-Limit • Swagger Docs  │
              └──────────────┬──────────────┘
                             │
                             ▼
              ┌─────────────────────────────┐
              │    Prisma ORM Database      │
              │    PostgreSQL / SQLite      │
              └─────────────────────────────┘
```

| Layer | Technologies |
| :--- | :--- |
| **Backend API** | Node.js, Express, TypeScript, Prisma ORM, JWT, Bcrypt, Zod, Helmet, Morgan, Swagger UI |
| **Web Frontend** | React, Vite, TypeScript, Tailwind CSS, Lucide Icons, React Router |
| **Mobile App** | React Native, Expo, Expo SecureStore (Android Keystore / iOS Keychain) |
| **Database** | PostgreSQL (Primary Production) / SQLite (Zero-Config Local Dev) / MySQL |
| **Orchestration** | Docker & Docker Compose |

---

## 🗄️ Database Schema & ER Diagram

```mermaid
erDiagram
    USERS ||--o{ PROJECTS : "owns (1:N)"
    USERS ||--o{ TASKS : "creates (1:N)"
    PROJECTS ||--o{ TASKS : "contains (1:N)"

    USERS {
        string id PK "UUID"
        string fullName "Full Name"
        string email UK "Unique Email"
        string passwordHash "Bcrypt Hash"
        datetime createdAt
        datetime updatedAt
    }

    PROJECTS {
        string id PK "UUID"
        string userId FK "References USERS.id (Cascade)"
        string name "Project Title"
        string description "Optional details"
        string status "NOT_STARTED | IN_PROGRESS | COMPLETED"
        datetime startDate
        datetime endDate
        datetime createdAt
        datetime updatedAt
    }

    TASKS {
        string id PK "UUID"
        string projectId FK "References PROJECTS.id (Cascade)"
        string userId FK "References USERS.id (Cascade)"
        string name "Task Name"
        string description "Details & acceptance criteria"
        string priority "LOW | MEDIUM | HIGH"
        string status "PENDING | IN_PROGRESS | COMPLETED"
        datetime dueDate
        datetime createdAt
        datetime updatedAt
    }
```

---

## 📡 API Specification & Documentation

An interactive **Swagger / OpenAPI 3.0** documentation interface is hosted locally at:
👉 **`http://localhost:5000/api/docs`**

### Summary of Endpoints

#### Authentication
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register new user account | No (Rate Limited) |
| `POST` | `/api/auth/login` | Authenticate with email & password | No (Rate Limited) |
| `POST` | `/api/auth/logout` | Invalidate current session | No |
| `GET` | `/api/auth/me` | Fetch authenticated user profile | **Yes (Bearer Token)** |

#### Projects
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/projects` | Get user projects (`?search=&status=`) | **Yes** |
| `GET` | `/api/projects/:id` | Get project details & nested tasks | **Yes** |
| `POST` | `/api/projects` | Create a new project | **Yes** |
| `PUT` | `/api/projects/:id` | Update project metadata or status | **Yes** |
| `DELETE` | `/api/projects/:id` | Delete project and cascade tasks | **Yes** |

#### Tasks
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/tasks` | Get tasks (`?projectId=&search=&status=&priority=`) | **Yes** |
| `GET` | `/api/tasks/:id` | Get specific task details | **Yes** |
| `POST` | `/api/tasks` | Create task under a project | **Yes** |
| `PUT` | `/api/tasks/:id` | Update task (status, priority, etc.) | **Yes** |
| `DELETE` | `/api/tasks/:id` | Delete task | **Yes** |

#### Dashboard
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/dashboard` | Get KPIs, completion velocity, upcoming tasks | **Yes** |

---

## 🚀 Quickstart & Setup Instructions

### Prerequisites
- **Node.js**: v18.0.0 or higher (Tested on Node v24)
- **npm** or **yarn**

---

### Step 1: Clone and Configure Environment

```bash
git clone <your-repo-url>
cd ismo-bio
```

#### Backend Environment:
Create `backend/.env` (or copy from `backend/.env.example`):
```env
PORT=5000
NODE_ENV=development

# Database URL:
# 1. Zero-config local SQLite (Default):
DATABASE_URL="file:./dev.db"

# 2. Or local / Docker PostgreSQL:
# DATABASE_URL="postgresql://postgres:postgrespassword@localhost:5432/pulseflow?schema=public"

JWT_SECRET="pulseflow-super-secure-production-jwt-key-2026"
JWT_EXPIRES_IN="7d"
CORS_ORIGIN="http://localhost:3000"
```

---

### Step 2: Run the Backend & Seed Demo Data

```bash
cd backend
npm install

# Initialize database schema
npx prisma db push

# Seed initial projects and demo user
npm run prisma:seed

# Start the API server
npm run dev
```
The server will boot at **`http://localhost:5000`** with interactive Swagger docs at **`http://localhost:5000/api/docs`**.

> **Pre-configured Demo Account:**
> - Email: `demo@pulseflow.io`
> - Password: `password123`

---

### Step 3: Run the Web Frontend

In a new terminal window:
```bash
cd web
npm install
npm run dev
```
Open **`http://localhost:3000`** in your browser.

---

### Step 4: Run the Mobile Application (Android / iOS)

In a new terminal window:
```bash
cd mobile
npm install
npm run start
```

#### Testing Mobile App:
1. **On Android Emulator**:
   - Press `a` in the terminal to launch on your connected Android emulator.
   - The app automatically connects to `http://10.0.2.2:5000/api` (Android's loopback to host).
2. **On Physical Android / iOS Phone**:
   - Install **Expo Go** from the Google Play Store or Apple App Store.
   - Scan the terminal QR code.
   - In the app login screen or Profile tab, configure the **Server Host** to your computer's LAN IP (e.g. `http://192.168.1.50:5000/api`).
3. **Stand-alone Android APK Build**:
   - Run `npx eas-cli build -p android --profile preview` to generate an installable `.apk`.

---

## 🐳 Running with Docker Compose (One-Command Setup)

To spin up PostgreSQL, the Backend, and the Web Frontend in containers:
```bash
docker compose up --build
```
- Web Application: `http://localhost:3000`
- API Server: `http://localhost:5000`
- PostgreSQL: `localhost:5432`

---

## 🧪 Automated Testing Suite

PulseFlow includes an end-to-end integration and security test suite testing authentication, authorization checks, project workflows, task lifecycles, and dashboard aggregations:

```bash
cd backend
npm test
```

**Results:**
```
▶ PulseFlow Backend Integration & Security Tests
  ✔ 1. GET /api/health should return UP status
  ✔ 2. POST /api/auth/register should create new user and return JWT
  ✔ 3. POST /api/auth/register with duplicate email should be rejected (409)
  ✔ 4. POST /api/auth/login with valid credentials should succeed
  ✔ 5. POST /api/auth/login with wrong password should fail (401)
  ✔ 6. GET /api/projects without token should be unauthorized (401)
  ✔ 7. POST /api/projects should create project with authenticated user
  ✔ 8. POST /api/tasks should create task under project
  ✔ 9. PUT /api/tasks/:id should update task status to COMPLETED
  ✔ 10. GET /api/dashboard should return metrics reflecting new project and task
ℹ tests 10 | pass 10 | fail 0
```

---

## 📱 Synchronization & Cross-Platform Demo Workflow (5-Minute Video Walkthrough)

To demonstrate cross-platform synchronization:
1. Log in with `demo@pulseflow.io` / `password123` on **Web** (`http://localhost:3000`).
2. Log in with the same credentials on the **Mobile App**.
3. Create a new task on Web (e.g., *"Review pull request #42"*).
4. Perform **Pull-to-Refresh** on Mobile: the new task appears instantly.
5. Tap the checkbox on Mobile to mark it **Completed**.
6. Refresh the Web dashboard: total completed tasks increments and velocity progress bar updates in real time!
