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
  date TEXT NOT NULL,
  person TEXT
);
`);

const expenseColumns = db.prepare("PRAGMA table_info(expenses)").all();
const hasPersonColumn = expenseColumns.some((col) => col.name === "person");
if (!hasPersonColumn) {
  db.exec("ALTER TABLE expenses ADD COLUMN person TEXT");
}

app.get("/health", (req, res) => res.json({ ok: true }));

app.get("/expenses", (req, res) => {
  const rows = db.prepare("SELECT * FROM expenses ORDER BY date DESC, id DESC").all();
  res.json(rows);
});

app.post("/expenses", (req, res) => {
  const { title, amount, category, date, person } = req.body || {};
  if (!title || !category || !date || typeof amount !== "number") {
    return res.status(400).json({ error: "Invalid payload" });
  }
  const stmt = db.prepare(
    "INSERT INTO expenses (title, amount, category, date, person) VALUES (?, ?, ?, ?, ?)"
  );
  const info = stmt.run(title, amount, category, date, person || null);
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

db.exec(`
CREATE TABLE IF NOT EXISTS family_members (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE
);
`);

db.prepare("INSERT OR IGNORE INTO categories (name) VALUES (?)").run("Транспорт");
db.prepare("INSERT OR IGNORE INTO categories (name) VALUES (?)").run("Продукти");
db.prepare("INSERT OR IGNORE INTO categories (name) VALUES (?)").run("Аптека");
db.prepare("INSERT OR IGNORE INTO family_members (name) VALUES (?)").run("Ви");

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

app.get("/family", (req, res) => {
  const rows = db.prepare("SELECT name FROM family_members ORDER BY name ASC").all();
  res.json(rows.map((row) => row.name));
});

app.post("/family", (req, res) => {
  const { name } = req.body || {};
  if (!name || !name.trim()) return res.status(400).json({ error: "Invalid name" });
  db.prepare("INSERT OR IGNORE INTO family_members (name) VALUES (?)").run(name.trim());
  res.json({ ok: true });
});

app.get("/category-tree", (req, res) => {
  res.json([
    {
      name: "Транспорт",
      children: [
        {
          name: "Громадський транспорт",
          children: ["Поїзд", "Маршрутка", "Літак", "Таксі"],
        },
        {
          name: "Власне авто",
          children: ["Бензин", "Ремонт"],
        },
      ],
    },
    {
      name: "Закупка",
      children: ["Продукти", "Хімія", "Гігієна", "Косметика", "Одяг"],
    },
    {
      name: "Краса",
      children: ["Біжутерія", "Салон", "Гігієна", "Косметика"],
    },
    {
      name: "Здоровя",
      children: ["Лікарня", "Аптека"],
    },
    {
      name: "Підписки",
      children: ["Sim-карта", "Інтернет", "Ютуб"],
    },
    {
      name: "Дозвілля",
      children: ["Ресторація", "Подарунок"],
    },
    {
      name: "Дім",
      children: ["Оренда", "Комунальні", "Ремонт", "Декор"],
    },
  ]);
});
