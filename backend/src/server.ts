import express from "express";
import cors from "cors";
import { initDb } from "./db/init";
import authRouter from "./routes/auth";
import expensesRouter from "./routes/expenses";
import categoriesRouter from "./routes/categories";
import authenticateToken from "./middleware/auth"; 


const app = express();
const PORT = process.env.PORT || 4000;

// Initialize DB
const db = initDb();

// Middleware
app.use(cors());
app.use(express.json());

// Public routes
app.use("/auth", authRouter);
app.get("/ping", (_req, res) => {
  res.json({ message: "Backend is live 🚀" });
});

// Protected routes
app.use("/expenses", authenticateToken, expensesRouter);
app.use("/categories", authenticateToken, categoriesRouter);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
