const express = require("express");
const cors = require("cors");
const Database = require("better-sqlite3");

const app = express();
app.use(cors());
app.use(express.json());

const db = new Database("data.db");
db.exec(`
CREATE TABLE IF NOT EXISTS expenses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  amount REAL NOT NULL,
  category TEXT NOT NULL,
  date TEXT NOT NULL
);
`);

app.get("/health", (req, res) => res.json({ ok: true }));

app.get("/expenses", (req, res) => {
  const rows = db.prepare("SELECT * FROM expenses ORDER BY date DESC, id DESC").all();
  res.json(rows);
});

app.post("/expenses", (req, res) => {
  const { title, amount, category, date } = req.body || {};
  if (!title || !category || !date || typeof amount !== "number") {
    return res.status(400).json({ error: "Invalid payload" });
  }
  const stmt = db.prepare("INSERT INTO expenses (title, amount, category, date) VALUES (?, ?, ?, ?)");
  const info = stmt.run(title, amount, category, date);
  res.json({ id: info.lastInsertRowid });
});

app.get("/stats/:yyyyMm", (req, res) => {
  const yyyyMm = req.params.yyyyMm;
  const from = `${yyyyMm}-01`;
  const to = `${yyyyMm}-31`;

  const byCategory = db.prepare(
    `SELECT category, ROUND(SUM(amount), 2) AS total
     FROM expenses
     WHERE date >= ? AND date <= ?
     GROUP BY category
     ORDER BY total DESC`
  ).all(from, to);

  const overall = db.prepare(
    `SELECT ROUND(COALESCE(SUM(amount), 0), 2) AS total
     FROM expenses
     WHERE date >= ? AND date <= ?`
  ).get(from, to);

  res.json({ total: overall.total, byCategory });
});


const PORT = 8080;
// важливо: слухати на всіх інтерфейсах, щоб телефон бачив
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});

db.exec(`
CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE
);
`);

db.prepare("INSERT OR IGNORE INTO categories (name) VALUES (?)").run("Транспорт");
db.prepare("INSERT OR IGNORE INTO categories (name) VALUES (?)").run("Продукти");
db.prepare("INSERT OR IGNORE INTO categories (name) VALUES (?)").run("Аптека");

app.get("/categories", (req, res) => {
  const rows = db.prepare("SELECT name FROM categories ORDER BY name ASC").all();
  res.json(rows.map(r => r.name));
});

app.post("/categories", (req, res) => {
  const { name } = req.body || {};
  if (!name || !name.trim()) return res.status(400).json({ error: "Invalid name" });
  db.prepare("INSERT OR IGNORE INTO categories (name) VALUES (?)").run(name.trim());
  res.json({ ok: true });
});
