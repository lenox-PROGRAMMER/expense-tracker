import { Router } from "express";
import { initDb } from "../db/init";
import authMiddleware from "../middleware/auth"; // ✅ ensure JWT protection

const router = Router();
const db = initDb();

// GET all expenses (protected)
router.get("/", authMiddleware, (_req, res) => {
  try {
    const rows = db.prepare("SELECT * FROM expenses ORDER BY date DESC").all();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch expenses" });
  }
});

// POST new expense (protected)
router.post("/", authMiddleware, (req, res) => {
  const { category, amount, date, description } = req.body;

  if (!category || !amount || !date) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const stmt = db.prepare(`
      INSERT INTO expenses (category, amount, date, description, created_at, updated_at)
      VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))
    `);

    const result = stmt.run(category, amount, date, description);

    // ✅ fetch the full inserted row
    const newExpense = db
      .prepare("SELECT * FROM expenses WHERE id = ?")
      .get(result.lastInsertRowid);

    res.json(newExpense);
  } catch (err) {
    res.status(500).json({ error: "Failed to add expense" });
  }
});

// DELETE expense by id (protected)
router.delete("/:id", authMiddleware, (req, res) => {
  const { id } = req.params;

  try {
    const stmt = db.prepare("DELETE FROM expenses WHERE id = ?");
    const result = stmt.run(id);

    if (result.changes === 0) {
      return res.status(404).json({ error: "Expense not found" });
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete expense" });
  }
});

export default router;
