import { Router } from "express";
import { initDb } from "../db/init";

const router = Router();
const db = initDb();

// Ensure categories table exists
db.exec(`
  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL
  );
`);

// Get all categories
router.get("/", (_req, res) => {
  const rows = db.prepare("SELECT * FROM categories").all();
  res.json(rows);
});

// Add a category
router.post("/", (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: "Name is required" });

  try {
    const stmt = db.prepare("INSERT INTO categories (name) VALUES (?)");
    const result = stmt.run(name);
    res.json({ id: result.lastInsertRowid, name });
  } catch {
    res.status(400).json({ error: "Category already exists" });
  }
});

export default router;
