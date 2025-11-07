# Customer Portal - Combined (backend + frontend)

## Overview
This package contains a patched backend (HTTPS-capable) and a clean frontend (Vite + React) wired to the backend.

## Backend
- Folder: ./backend
- Install & start:
  ```bash
  cd backend
  npm install
  npm run hash-passwords   # hashes seeded plaintext passwords in db.json
  # generate certs if missing (or let the included certs be used)
  npm start
  ```

## Frontend
- Folder: ./frontend
- Install & start:
  ```bash
  cd frontend
  npm install
  npm run dev
  ```
- The frontend runs on http://localhost:5173 (Vite). It sends API requests to https://localhost:5000.

## Notes about SSL
- A self-signed cert is generated and placed under ./backend/cert/. Browsers will warn about self-signed certs; for local testing either accept the warning or import the cert into your OS/browser trust store.
- If the auto-generation failed for your environment, replace ./backend/cert/key.pem and cert.pem with valid files.

## Test accounts (seeded)
- Customer:
  - accountNumber: 10000001
  - password: CustomerPass1!
- Staff:
  - accountNumber: 20000001
  - password: EmployeePass1!

## API endpoints (examples)
- POST /api/auth/register
- POST /api/auth/login
- POST /api/payments/create
- GET /api/payments/my/:userId
- GET /api/payments/pending
- POST /api/payments/verify/:id
