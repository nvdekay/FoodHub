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
cp .env.example .env   # adjust JWT_SECRET if needed
npm run seed           # seed sample data (accounts, menu, tables)
npm run dev            # starts on http://localhost:5050
```

Sample accounts (password `123456`): `admin@foodhub.com`, `staff@foodhub.com`, `customer@foodhub.com`.

### API

The backend exposes 31 REST endpoints across Auth/User, Category, Product, Table,
Order (customer + staff) and Dashboard — see **[backend/README.md](backend/README.md)**
for the full list and **backend/api.http** to try them with the VS Code REST Client.

Business spec: [docs/SRS_QuanLyDatMon.md](docs/SRS_QuanLyDatMon.md) ·
DB design: [docs/db.md](docs/db.md) · Plan: [docs/plan.md](docs/plan.md).

## Frontend

```bash
cd frontend
npm install
cp .env.example .env   # VITE_API_URL points to the backend
npm run dev            # starts on http://localhost:5173
```

The frontend reads `VITE_API_URL` (default `http://localhost:5050/api`) and
renders the food menu fetched from the backend via Axios.
