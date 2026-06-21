import express from "express";
import cors from "cors";
import foodRoutes from "./routes/foodRoutes.js";

const app = express();

// Middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
  })
);
app.use(express.json());

// Health check
app.get("/", (req, res) => {
  res.json({ message: "FoodHub API is running 🍔" });
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", uptime: process.uptime() });
});

// Routes
app.use("/api/foods", foodRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

export default app;
