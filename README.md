# FoodHub

A full-stack food ordering demo.

- **frontend/** — React (Vite) + Axios + Tailwind CSS
- **backend/** — Express + Node.js + MongoDB (Mongoose)

## Prerequisites

- Node.js 18+
- MongoDB running locally (default: `mongodb://127.0.0.1:27017/foodhub`)

## Backend

```bash
cd backend
npm install
cp .env.example .env   # adjust if needed
npm run dev            # starts on http://localhost:5050
```

### API endpoints

| Method | Path             | Description        |
| ------ | ---------------- | ------------------ |
| GET    | `/api/health`    | Health check       |
| GET    | `/api/foods`     | List all foods     |
| GET    | `/api/foods/:id` | Get one food       |
| POST   | `/api/foods`     | Create a food      |
| PUT    | `/api/foods/:id` | Update a food      |
| DELETE | `/api/foods/:id` | Delete a food      |

## Frontend

```bash
cd frontend
npm install
cp .env.example .env   # VITE_API_URL points to the backend
npm run dev            # starts on http://localhost:5173
```

The frontend reads `VITE_API_URL` (default `http://localhost:5050/api`) and
renders the food menu fetched from the backend via Axios.
