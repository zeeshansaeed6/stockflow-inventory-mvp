# StockFlow API

Express + MongoDB backend for the StockFlow MVP.

## Scripts

| Command        | Purpose                                     |
|----------------|---------------------------------------------|
| `npm run dev`  | Start with nodemon (auto-reload)            |
| `npm start`    | Start in production mode                    |

## Env

Copy `.env.example` to `.env` and set:

- `PORT` — API port (default 5000)
- `MONGO_URI` — MongoDB connection string
- `JWT_SECRET` — secret for signing JWTs
- `CLIENT_ORIGIN` — allowed CORS origin

## Health check

```
GET /api/health -> { "status": "ok", "service": "stockflow-api" }
```
