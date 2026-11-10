# StockFlow

A multi-tenant SaaS inventory management app. Sign up with an organization, manage products and stock levels, and see low-stock items at a glance. Every organization's data is fully isolated from every other's.

Built as a 6-hour MVP, then extended with categories, suppliers, reports and a stock-movement history.

## Live Demo

- **App:** https://stockflow-inventory.pages.dev
- **API health:** https://stockflow-api-mt38.onrender.com/api/health

The API runs on Render's free tier and sleeps when idle, so the first request after a pause can take about 30 seconds. Sign up with any email to try it.

## Features

**Core (MVP scope)**

- Email/password signup and login (JWT, bcrypt-hashed passwords)
- Organization created on signup; all data is scoped to it (no cross-tenant access)
- Product CRUD: name, SKU (unique per organization), description, quantity, cost price, selling price, low-stock threshold
- Search by name or SKU, with confirm-before-delete
- Quick stock adjust (+/- N units with a note)
- Dashboard: total products, total units on hand, and a low-stock table
- Settings: organization-wide default low-stock threshold (used when a product has none)

**Extras beyond the MVP**

- Categories and suppliers
- Stock movement history and inventory reports
- CSV export of products
- Pagination, sorting and a low-stock-only filter on the product list
- Dark mode, toast notifications, rate-limited auth endpoints, security headers (helmet)

## Tech Stack

| Layer    | Tools                                                  |
|----------|--------------------------------------------------------|
| Backend  | Node.js, Express, MongoDB (Mongoose), express-validator |
| Auth     | JWT, bcryptjs                                          |
| Frontend | React 18, Vite, React Router, Axios, Tailwind CSS      |

## Project Layout

```
server/   Express API
  src/config/       DB connection, demo seed data
  src/controllers/  request handlers
  src/middleware/   auth (JWT), ObjectId validation
  src/models/       Mongoose models
  src/routes/       route definitions
client/   React app (Vite + Tailwind)
  src/pages/        Dashboard, Products, Settings, Reports, ...
```

## Getting Started

**Prerequisites:** Node.js 18+ (see `.nvmrc`) and a MongoDB instance (local, Docker or Atlas).

```bash
# 1. Install root, server and client dependencies
npm run install:all

# 2. Create your env file
cp server/.env.example server/.env     # Windows: copy server\.env.example server\.env
#    then edit server/.env and set JWT_SECRET

# 3. (Optional) start MongoDB in Docker
docker compose up -d

# 4. Run API + client together
npm run dev
```

Open **http://localhost:5173**, sign up, and start adding products. The API runs on port 5001; the Vite dev server proxies `/api` to it.

### Try it with demo data

If `MONGO_URI` is **not** set, the server starts an in-memory MongoDB and seeds demo accounts, so you can log in immediately with no database installed. To seed demo data into a real database, set `SEED_DEMO=true`.

| Email                  | Organization        | Password   |
|------------------------|---------------------|------------|
| `owner@bluespark.demo` | Blue Spark Electronics | `demo1234` |
| `owner@rooted.demo`    | Rooted Coffee       | `demo1234` |

Demo accounts are for local use only. Never enable seeding in production.

## Deployment

| Part     | Host                  | Notes |
|----------|-----------------------|-------|
| Database | MongoDB Atlas (free)  | Copy the connection string into `MONGO_URI` |
| API      | Render (free)         | Uses [render.yaml](render.yaml); root dir `server` |
| Client   | Cloudflare Pages      | Root `client`, build `npm run build`, output `dist` |

1. **Atlas:** create a free cluster and a database user, and allow network access from anywhere (`0.0.0.0/0`).
2. **Render:** New > Blueprint > select this repo. Set `MONGO_URI` (Atlas string) and `CLIENT_ORIGIN` (your Pages URL, no trailing slash). `JWT_SECRET` is generated for you.
3. **Cloudflare Pages:** connect the repo, root directory `client`, build command `npm run build`, output directory `dist`, and the environment variable `VITE_API_URL` set to your Render URL (e.g. `https://stockflow-api.onrender.com`).

`client/public/_redirects` makes page refreshes work on client-side routes. The free Render tier sleeps when idle, so the first request after a pause can take about 30 seconds.

## Scripts

| Command               | What it does                          |
|-----------------------|---------------------------------------|
| `npm run dev`         | Run API and client together           |
| `npm run dev:server`  | API only (nodemon, auto-reload)       |
| `npm run dev:client`  | Client only (Vite)                    |
| `npm start`           | API in production mode                |
| `npm --prefix client run build` | Production build of the client |

## Environment Variables (`server/.env`)

| Key             | Description                                          | Example                                |
|-----------------|------------------------------------------------------|----------------------------------------|
| `PORT`          | API port                                             | `5001`                                 |
| `MONGO_URI`     | MongoDB connection string (omit for in-memory dev DB)| `mongodb://127.0.0.1:27017/stockflow`  |
| `JWT_SECRET`    | Secret used to sign tokens. **Use a long random value.** | `change-me`                        |
| `CLIENT_ORIGIN` | Allowed CORS origin                                  | `http://localhost:5173`                |
| `SEED_DEMO`     | Set `true` to load demo data                         | `true`                                 |

`MONGO_URI` is required when `NODE_ENV=production`. `.env` is git-ignored; never commit secrets.

## API Reference

Base path `/api`. All routes except `health` and `auth/signup|login` need `Authorization: Bearer <token>`. Malformed IDs return `404`; validation errors return `400`; duplicate emails/SKUs return `409`.

| Method | Route                       | Description                               |
|--------|-----------------------------|-------------------------------------------|
| GET    | `/health`                   | Health check                              |
| POST   | `/auth/signup`              | Create organization + user, returns token |
| POST   | `/auth/login`               | Log in, returns token                     |
| GET    | `/auth/me`                  | Current user and organization             |
| GET    | `/products`                 | List products (`q`, `page`, `pageSize`, `sortBy`, `sortDir`, `lowOnly`, `category`, `supplier`) |
| POST   | `/products`                 | Create product                            |
| GET    | `/products/:id`             | Get product                               |
| PUT    | `/products/:id`             | Update product                            |
| DELETE | `/products/:id`             | Delete product                            |
| POST   | `/products/:id/adjust`      | Adjust stock by `{ delta, note }`         |
| GET    | `/products/export.csv`      | Download products as CSV                  |
| GET    | `/dashboard`                | Totals and low-stock items                |
| GET    | `/settings`                 | Get organization settings                 |
| PUT    | `/settings`                 | Update settings                           |
| GET/POST | `/categories`             | List / create categories                  |
| PUT/DELETE | `/categories/:id`       | Update / delete a category                |
| GET/POST | `/suppliers`              | List / create suppliers                   |
| PUT/DELETE | `/suppliers/:id`        | Update / delete a supplier                |
| GET    | `/reports/inventory`        | Inventory report                          |
| GET    | `/reports/movements`        | Stock movement history                    |

### How low stock works

A product is low stock when `quantityOnHand <= lowStockThreshold`. If the product has no threshold of its own, the organization's default (Settings, initially `5`) is used.

## Known Limitations

- One user per organization; no roles or invites
- No password reset (reset manually in the database)
- Products are hard-deleted
- No automated test suite yet

## License

See [LICENSE](LICENSE).
