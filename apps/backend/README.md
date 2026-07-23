# TravelAgency Backend API

Welcome to the TravelAgency backend repository. This is a modular monolithic Node.js/Express API that powers the core business logic, including bookings, package management, analytics, and integrations (Google Sheets, Resend, WhatsApp).

## 🚀 Getting Started (Local Development)

### Prerequisites
- **Node.js**: `v20.0.0` or higher (Verify with `node -v`)
- **npm**: `v10.0.0` or higher
- **MongoDB**: A running local or remote instance (Atlas).
- **Redis**: A running local or remote instance (used for caching and background queues).

### 1. Installation
Clone the repository and install the backend dependencies. We standardize on `npm` to guarantee deterministic builds.
```bash
git clone <repo-url>
cd apps/backend
npm install
```

### 2. Environment Configuration
Copy the provided `.env.example` file to create your local `.env`.
```bash
cp .env.example .env
```
**Critical Variables to fill out:**
- `MONGO_URI`: Your MongoDB connection string.
- `REDIS_URI`: Your Redis connection string (e.g., `redis://localhost:6379`).
- `JWT_SECRET` / `JWT_REFRESH_SECRET`: Secure random strings for signing sessions.
- `PORT`: (Defaults to 8000)

### 3. Running the Development Server
To start the application with hot-reloading:
```bash
npm run dev
```

---

## 🛠️ Scripts & Commands

- `npm run dev`: Starts the Nodemon development server.
- `npm run check`: Runs ESLint and Jest tests. **(Must pass before pushing code)**.
- `npm run test`: Runs the Jest testing suite.
- `npm run start:cluster`: Starts the PM2 production cluster using `ecosystem.config.cjs`.
- `npm run reload:cluster`: Performs a zero-downtime rolling restart for deployments.

---

## 🏗️ Architecture & Standards

- **Clean Architecture:** Strict separation between Controllers, Services, and Repositories.
- **Global Error Handling:** All errors thrown via `next(err)` are captured and formatted centrally as `{ success: false, error: { code, message } }`.
- **Background Jobs:** Handled via Agenda (`agendaJobs` MongoDB collection) for things like Email Notifications and Google Sheet syncing.

*Note: For API endpoint details, refer to the frontend integration handlers as we migrate towards full OpenAPI documentation.*
