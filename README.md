# Ecommerce API (Fullstack)

Professional README for the Ecommerce API repository. This project contains a Node/TypeScript backend and a Vite + TypeScript frontend admin UI.

## Repository layout

- **backend/** — Express + TypeScript API, MongoDB data store
- **frontend/** — Vite + TypeScript single-page admin UI

## Requirements

- Node.js 18+
- npm
- MongoDB

## Quick start

1. Install dependencies for backend and frontend

   ```bash
   # from repo root
   cd backend
   npm install

   cd ../frontend
   npm install
   ```

2. Create environment files

    - Backend .env:

        ```bash
        MONGO_URI=YourMongoURL
        JWT_SECRET=yourStrongSecretKey
        JWT_EXPIRES=7d
        PORT=4000
        ```
        
        - file location

        ```bash
        backend/
        ├── src/
        ├── .env
        ├── package-lock.json
        ├── package.json
        └── tsconfig.json
        ```

3. Run backend and frontend (dev)

   ```bash
   # In one terminal: start backend (from backend/)
   cd backend
   npm run dev

   # In another terminal: start frontend dev server (from frontend/)
   cd frontend
   npm run dev
   ```

4. Open the frontend at http://localhost:5173 (Vite default) and the backend is proxied at `/api` to http://localhost:4000 in dev.


## Useful commands

From repository root (examples):

```bash
# Start backend
cd backend && npm run dev

# Start frontend
cd frontend && npm run dev
```