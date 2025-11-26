import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { initDb } from "../db/init";

const router = Router();
const db = initDb();
const SECRET = "supersecretkey"; // ⚠️ use env variable in production

// Ensure users table exists
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at TEXT NOT NULL
  );
`);

// Register route
router.post("/register", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: "Missing fields" });

  const hashed = bcrypt.hashSync(password, 10);
  try {
    const stmt = db.prepare("INSERT INTO users (username, password, created_at) VALUES (?, ?, datetime('now'))");
    stmt.run(username, hashed);
    res.json({ success: true, message: "User registered successfully" });
  } catch (err) {
    res.status(400).json({ error: "User already exists" });
  }
});

// Login route
router.post("/login", (req, res) => {
  const { username, password } = req.body;
  const user = db.prepare("SELECT * FROM users WHERE username = ?").get(username);

  if (!user) return res.status(400).json({ error: "Invalid credentials" });

  const valid = bcrypt.compareSync(password, user.password);
  if (!valid) return res.status(400).json({ error: "Invalid credentials" });

  const token = jwt.sign({ id: user.id, username: user.username }, SECRET, { expiresIn: "1h" });
  res.json({ token });
});

export default router;
