# CustomerPortal1 (MERN) README

Project: Customer Portal (full MERN)
Zip file inspected: CustomerPortal1/customer-portal-complete
What this README covers: repository structure, prerequisites, how to get the code from GitHub or a ZIP, how to set environment variables, how to run the backend and frontend (development), available scripts, how to navigate the running site, seeding/utility scripts, and troubleshooting & security notes.

1. Quick summary / purpose

This project is a full MERN (MongoDB, Express, React, Node.js) Customer Payment / Employee Portal.

Backend: Node.js + Express, session support, authentication routes, input sanitisation and strong validation, password hashing utilities.

Frontend: React (Vite) single-page app with routes for Home, Register, Login, Dashboard, Payments, Payment History and creating new transactions.

Data: local db.json / LowDB utilities and code to support hashing existing passwords; project is also configured to connect to a MongoDB instance via MONGO_URI.

2. Repository / Zip structure (high level)
customer-portal-complete/
├─ backend/
│  ├─ server.js
│  ├─ package.json
│  ├─ .env.example
│  ├─ .env            ← (this ZIP included a filled .env — DO NOT commit credentials)
│  ├─ routes/
│  │  └─ auth.js
│  ├─ models/
│  │  └─ User.js
│  ├─ scripts/
│  │  └─ hash-passwords.js
│  ├─ db.json         ← lowdb file used by scripts / staging data
│  └─ node_modules/ ...
├─ frontend/
│  ├─ package.json
│  ├─ index.html / dist/
│  ├─ src/
│  │  ├─ App.jsx
│  │  ├─ api.js
│  │  └─ pages/
│  │     ├─ Home.jsx
│  │     ├─ Register.jsx
│  │     ├─ Login.jsx
│  │     ├─ Dashboard.jsx
│  │     ├─ Payments.jsx
│  │     ├─ PaymentManagement.jsx
│  │     ├─ PaymentHistory.jsx
│  │     └─ NewTransaction.jsx
│  └─ node_modules/ ...
└─ .vscode/


Important: The zip you provided contains a .env file in the backend with what looks like real/active connection strings. Do not publish these credentials. The README below instructs how to create your own .env safely.

3. Prerequisites

Make sure you have the following installed on your machine:

Node.js (v16+ recommended) & npm
Check with:

node -v
npm -v


Git (if cloning from a GitHub repo)

MongoDB Atlas account (recommended) or a local MongoDB instance (for MONGO_URI)

A modern browser (Chrome, Edge, Firefox) for the front-end app

4. Get the code

Option A — From GitHub (recommended)

In GitHub: find the repository (if you have pushed it). Copy the repo URL.

Clone:

git clone https://github.com/<username>/<repo>.git
cd <repo>/customer-portal-complete


Option B — From the ZIP you provided

Unzip the archive:

unzip CustomerPortal1.zip
cd CustomerPortal1/customer-portal-complete

5. Setup environment variables (backend)

Create a .env file in the backend/ folder (do not commit it to Git).

Use the following template and replace placeholders with your values:

# backend/.env (example)
MONGO_URI=mongodb+srv://<DB_USER>:<DB_PASSWORD>@<CLUSTER>.mongodb.net/<DB_NAME>?retryWrites=true&w=majority
PORT=5000
SESSION_SECRET=your-very-strong-random-session-secret
NODE_ENV=development


MONGO_URI: your MongoDB connection string. If using MongoDB Atlas, use the connection string Atlas gives you.

SESSION_SECRET: used by express-session. Use a long random string in production.

PORT: optional — defaults to 5000 if not provided.

Security note: Remove any real credentials from the repo and add backend/.env to .gitignore if you push to GitHub.

6. Install dependencies

Open two terminals (one for backend, one for frontend).

Backend

cd backend
npm install


Frontend

cd ../frontend
npm install


If you prefer cross-platform direct commands (avoid Powershell scripts included in scripts), use the :direct scripts described below.

7. Available NPM scripts

Backend (backend/package.json)

npm run start — runs the included PowerShell start script (Windows-oriented).

npm run start:direct — runs the server directly with node server.js (cross-platform).

npm run start:win — batch file wrapper (Windows).

npm run hash-passwords — runs scripts/hash-passwords.js which hashes plain passwords in local db.json (LowDB).

Frontend (frontend/package.json)

npm run dev — starts frontend via included Powershell (Windows wrapper).

npm run dev:direct — runs vite directly (cross-platform).

npm run build — builds production frontend (Vite).

npm run preview — previews the built frontend.

8. Run the app (development)
A — Backend

From backend/:

# recommended
npm run start:direct
# OR, if you must use the distributed script:
npm run start


You should see: 🚀 Server running on port 5000 (or whichever port you set).

The backend exposes APIs under /api (example: /api/auth used by the frontend).

If port is in use, server logs include guidance (it prints helpful instructions for killing the process on Windows). See server.js handling of EADDRINUSE.

B — Frontend

Open a separate terminal and run:

cd frontend
npm run dev:direct


Vite normally serves the front-end on http://localhost:5173 (the code uses this origin in allowed CORS). The frontend’s api.js is configured to talk to http://localhost:5000/api by default.

9. How the frontend and backend communicate

Frontend src/api.js uses a BASE of http://localhost:5000/api. The frontend sends requests with credentials: 'include', so the backend session cookie must be allowed via CORS configuration (the server already lists http://localhost:5173 in its CORS origins).

The backend uses express-session for server-side sessions and sets cookie options (httpOnly, sameSite: 'lax', maxAge: 30 minutes). In production you must set cookie.secure: true and use HTTPS.

10. Site navigation (what pages exist)

Routes (React Router) in src/App.jsx:

/ → Home (landing)

/register → Register (create account)

/login → Login

/dashboard → Dashboard (protected area)

/payments → Payment management

/payment-history → Payment history

/new-transaction → Create new transaction

How to test flow:

Register a new user at /register (forms use strong validation client-side and server-side).

Login at /login. Successful login sets a session cookie.

Navigate to /dashboard and the payments pages to create new transactions and view history.

11. Security & notable code areas

Password hashing: The project uses bcryptjs and includes a scripts/hash-passwords.js utility to hash existing plaintext passwords in db.json. The code validates and enforces strong password patterns (12+ chars, uppercase/lowercase/digit/special).

Input sanitization: Backend route routes/auth.js contains rigorous sanitization code to strip dangerous characters and validate inputs with whitelist regex patterns.

Session hardening: server.js configures express-session with httpOnly and sameSite, and recommends enabling secure: true in production (when using HTTPS).

CORS: The backend allows origins that include localhost:5173 for the frontend dev server. Update CORS configuration for production domains.

NoSQL/SQL injection: The backend uses Mongoose-style models and queries (or LowDB for local data), and route handlers use parameterized lookups (e.g., User.findOne({ ... })) and input validation to reduce injection risk.

Scripts & DevSecOps: The code includes a hash-passwords script as part of data hygiene and demonstrates awareness of security best practices.
