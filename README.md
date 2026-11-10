# StockFlow MVP

A minimal multi-tenant SaaS inventory management system built as a 6-hour MVP.

## Tech Stack

- **Backend:** Node.js, Express, MongoDB (Mongoose), JWT auth, bcrypt
- **Frontend:** React (Vite), React Router, Axios, Tailwind CSS

## Features

- Email/password signup & login (JWT)
- Per-organization data isolation (multi-tenant)
- Product CRUD with SKU, quantity, prices, low-stock threshold
- Dashboard: total products, total units on hand, low-stock items
- Global default low-stock threshold setting

## Repo Layout

```
/server   -> Express + MongoDB API
/client   -> React (Vite) + Tailwind UI
```

## Prerequisites

- Node.js 18+ (works on Windows, macOS, Linux)
- A running MongoDB instance (local `mongodb://127.0.0.1:27017` or MongoDB Atlas URI)

## Optional: run MongoDB in Docker

If you don't want to install MongoDB on your machine:

```bash
docker compose up -d     # starts a mongo:7 container on localhost:27017
docker compose down      # stops it when done
```

Then set `MONGO_URI=mongodb://127.0.0.1:27017/stockflow` in `server/.env`.

## Quick start (one command)

```bash
# At repo root
npm run install:all   # installs root + server + client deps
cp server/.env.example server/.env   # Windows: copy server\.env.example server\.env
# edit server/.env (MONGO_URI, JWT_SECRET)
npm run dev           # starts API + Vite together
```

Then open http://localhost:5173.

## Setup (manual, two terminals)

### 1. Backend

```bash
cd server
cp .env.example .env     # on Windows: copy .env.example .env
# Edit .env and set MONGO_URI and JWT_SECRET
npm install
npm run dev              # starts on http://localhost:5001
```

### 2. Frontend

```bash
cd client
npm install
npm run dev              # starts on http://localhost:5173
```

Open http://localhost:5173 in a browser, sign up, and start managing inventory.

## Environment Variables (server/.env)

| Key              | Description                                | Example                              |
|------------------|--------------------------------------------|--------------------------------------|
| `PORT`           | API port                                   | `5001`                               |
| `MONGO_URI`      | MongoDB connection string                  | `mongodb://127.0.0.1:27017/stockflow`|
| `JWT_SECRET`     | Secret used to sign JWT tokens             | `change-me-in-prod`                  |
| `CLIENT_ORIGIN`  | Allowed CORS origin (frontend URL)         | `http://localhost:5173`              |

## API Overview

| Method | Route                     | Description             |
|--------|---------------------------|-------------------------|
| POST   | `/api/auth/signup`        | Create user + org       |
| POST   | `/api/auth/login`         | Login, returns JWT      |
| GET    | `/api/auth/me`            | Current user info       |
| GET    | `/api/products`           | List org products       |
| POST   | `/api/products`           | Create product          |
| GET    | `/api/products/:id`       | Get product             |
| PUT    | `/api/products/:id`       | Update product          |
| DELETE | `/api/products/:id`       | Delete product          |
| GET    | `/api/dashboard`          | Dashboard summary       |
| GET    | `/api/settings`           | Get org settings        |
| PUT    | `/api/settings`           | Update settings         |

All product/dashboard/settings routes require `Authorization: Bearer <token>`.
