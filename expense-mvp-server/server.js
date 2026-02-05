const express = require("express");
const cors = require("cors");
const Database = require("better-sqlite3");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

const db = new Database("data.db");
const dataDir = path.join(__dirname, "data");
const groupsDir = path.join(dataDir, "groups");
const treeFile = path.join(dataDir, "tree.json");
const opsFile = path.join(dataDir, "ops.json");

const slugMap = {
  а: "a",
  б: "b",
  в: "v",
  г: "h",
  ґ: "g",
  д: "d",
  е: "e",
  є: "ye",
  ж: "zh",
  з: "z",
  и: "y",
  і: "i",
  ї: "yi",
  й: "y",
  к: "k",
  л: "l",
  м: "m",
  н: "n",
  о: "o",
  п: "p",
  р: "r",
  с: "s",
  т: "t",
  у: "u",
  ф: "f",
  х: "kh",
  ц: "ts",
  ч: "ch",
  ш: "sh",
  щ: "shch",
  ю: "yu",
  я: "ya",
};

const ensureDir = (dirPath) => {
  fs.mkdirSync(dirPath, { recursive: true });
};

const slugify = (value) => {
  const lowered = value.trim().toLowerCase();
  let result = "";
  for (const ch of lowered) {
    if (slugMap[ch]) {
      result += slugMap[ch];
    } else if (/[a-z0-9]/.test(ch)) {
      result += ch;
    } else if (ch === " " || ch === "_" || ch === "-") {
      result += "-";
    }
  }
  result = result.replace(/-+/g, "-").replace(/^-|-$/g, "");
  return result || "group";
};

const defaultTree = () => [
  {
    name: "Транспорт",
    children: [
      {
        name: "Громадський транспорт",
        children: [
          { name: "Поїзд", children: [] },
          { name: "Маршрутка", children: [] },
          { name: "Літак", children: [] },
          { name: "Таксі", children: [] },
        ],
      },
      {
        name: "Власне авто",
        children: [
          { name: "Бензин", children: [] },
          { name: "Ремонт", children: [] },
        ],
      },
    ],
  },
  {
    name: "Закупка",
    children: [
      { name: "Продукти", children: [] },
      { name: "Хімія", children: [] },
      { name: "Гігієна", children: [] },
      { name: "Косметика", children: [] },
      { name: "Одяг", children: [] },
    ],
  },
  {
    name: "Краса",
    children: [
      { name: "Біжутерія", children: [] },
      { name: "Салон", children: [] },
      { name: "Гігієна", children: [] },
      { name: "Косметика", children: [] },
    ],
  },
  {
    name: "Здоровя",
    children: [
      { name: "Лікарня", children: [] },
      { name: "Аптека", children: [] },
    ],
  },
  {
    name: "Підписки",
    children: [
      { name: "Sim-карта", children: [] },
      { name: "Інтернет", children: [] },
      { name: "Ютуб", children: [] },
    ],
  },
  {
    name: "Дозвілля",
    children: [
      { name: "Ресторація", children: [] },
      { name: "Подарунок", children: [] },
    ],
  },
  {
    name: "Дім",
    children: [
      { name: "Оренда", children: [] },
      { name: "Комунальні", children: [] },
      { name: "Ремонт", children: [] },
      { name: "Декор", children: [] },
    ],
  },
  {
    name: "Сімя",
    children: [{ name: "Ілля (Ви)", children: [] }],
  },
];

const loadTree = () => {
  ensureDir(dataDir);
  ensureDir(groupsDir);
  if (!fs.existsSync(treeFile)) {
    const tree = defaultTree();
    fs.writeFileSync(treeFile, JSON.stringify(tree, null, 2));
    return tree;
  }
  return JSON.parse(fs.readFileSync(treeFile, "utf-8"));
};

const saveTree = (tree) => {
  ensureDir(dataDir);
  fs.writeFileSync(treeFile, JSON.stringify(tree, null, 2));
};

const findNode = (tree, pathParts) => {
  if (pathParts.length === 0) return { children: tree };
  let current = { children: tree };
  for (const part of pathParts) {
    const next = current.children.find((child) => child.name === part);
    if (!next) return null;
    current = next;
  }
  return current;
};

const buildGroupPath = (breadcrumb) => {
  const slugParts = breadcrumb.map(slugify);
  return path.join(groupsDir, ...slugParts);
};

const writeGroupFiles = (breadcrumb, data) => {
  const groupPath = buildGroupPath(breadcrumb);
  ensureDir(groupPath);
  const meta = {
    displayName: data.name,
    slug: slugify(data.name),
    description: data.description || "",
    isLeaf: data.isLeaf || false,
    breadcrumbs: breadcrumb,
  };
  const commands = data.commands || { name: "", type: "expense", phrases: [] };
  const stats = data.stats || { monthly: {}, total: 0, byUser: {} };
  fs.writeFileSync(path.join(groupPath, "meta.json"), JSON.stringify(meta, null, 2));
  fs.writeFileSync(path.join(groupPath, "commands.json"), JSON.stringify(commands, null, 2));
  fs.writeFileSync(path.join(groupPath, "stats.json"), JSON.stringify(stats, null, 2));
  if (!meta.isLeaf) {
    ensureDir(path.join(groupPath, "children"));
  }
  return groupPath;
};

const removeGroupFiles = (breadcrumb) => {
  const groupPath = buildGroupPath(breadcrumb);
  if (fs.existsSync(groupPath)) {
    fs.rmSync(groupPath, { recursive: true, force: true });
  }
};

const readCommands = (breadcrumb) => {
  const groupPath = buildGroupPath(breadcrumb);
  const commandsPath = path.join(groupPath, "commands.json");
  if (!fs.existsSync(commandsPath)) return { name: "", type: "expense", phrases: [] };
  return JSON.parse(fs.readFileSync(commandsPath, "utf-8"));
};

const writeCommands = (breadcrumb, commands) => {
  const groupPath = buildGroupPath(breadcrumb);
  ensureDir(groupPath);
  fs.writeFileSync(path.join(groupPath, "commands.json"), JSON.stringify(commands, null, 2));
};

const loadOps = () => {
  ensureDir(dataDir);
  if (!fs.existsSync(opsFile)) {
    fs.writeFileSync(opsFile, JSON.stringify([], null, 2));
    return [];
  }
  return JSON.parse(fs.readFileSync(opsFile, "utf-8"));
};

const saveOps = (ops) => {
  ensureDir(dataDir);
  fs.writeFileSync(opsFile, JSON.stringify(ops, null, 2));
};

const normalizePathParts = (parts) => {
  if (!Array.isArray(parts)) return [];
  const filtered = parts.map((part) => part.toString()).filter(Boolean);
  if (filtered[0] === "Головна") return filtered.slice(1);
  return filtered;
};

const parsePathQuery = (rawPath) =>
  rawPath
    .split("/")
    .map((part) => part.trim())
    .filter(Boolean);

const matchesNodeName = (nodeName, part) => {
  if (!part) return false;
  return nodeName === part || slugify(nodeName) === part.toLowerCase();
};

const findNodeByPath = (tree, pathParts) => {
  if (!pathParts.length) return { name: "Головна", children: tree };
  let current = { name: "Головна", children: tree };
  for (const part of pathParts) {
    const next = current.children.find((child) => matchesNodeName(child.name, part));
    if (!next) return null;
    current = next;
  }
  return current;
};

const collectLeafPaths = (node, prefix = []) => {
  const currentPath = node.name === "Головна" ? prefix : [...prefix, node.name];
  if (!node.children || node.children.length === 0) {
    return [currentPath];
  }
  return node.children.flatMap((child) => collectLeafPaths(child, currentPath));
};

const toSlugPath = (parts) => parts.map(slugify).join("/");

app.get("/health", (req, res) => res.json({ ok: true }));

app.get("/tree", (req, res) => {
  const tree = loadTree();
  res.json(tree);
});

app.post("/group", (req, res) => {
  const { path: breadcrumb = [], name, description, isLeaf } = req.body || {};
  if (!name || !name.trim()) {
    return res.status(400).json({ error: "Invalid name" });
  }
  const tree = loadTree();
  const node = findNode(tree, breadcrumb);
  if (!node || !node.children) {
    return res.status(404).json({ error: "Path not found" });
  }
  const existing = node.children.find((child) => child.name === name.trim());
  if (!existing) {
    node.children.push({ name: name.trim(), children: [] });
  }
  const fullBreadcrumb = [...breadcrumb, name.trim()];
  writeGroupFiles(fullBreadcrumb, {
    name: name.trim(),
    description,
    isLeaf,
  });
  saveTree(tree);
  res.json({ ok: true });
});

app.delete("/group", (req, res) => {
  const { path: breadcrumb = [], confirm } = req.body || {};
  if (!confirm) return res.status(400).json({ error: "Confirmation required" });
  if (breadcrumb.length === 0) return res.status(400).json({ error: "Invalid path" });
  const tree = loadTree();
  const parent = findNode(tree, breadcrumb.slice(0, -1));
  if (!parent || !parent.children) {
    return res.status(404).json({ error: "Path not found" });
  }
  const targetName = breadcrumb[breadcrumb.length - 1];
  parent.children = parent.children.filter((child) => child.name !== targetName);
  removeGroupFiles(breadcrumb);
  saveTree(tree);
  res.json({ ok: true });
});

app.get("/group/commands", (req, res) => {
  const rawPath = req.query.path || "";
  const breadcrumb = Array.isArray(rawPath)
    ? rawPath
    : rawPath
        .split("/")
        .map((part) => part.trim())
        .filter(Boolean);
  const commands = readCommands(breadcrumb);
  res.json(commands);
});

app.post("/group/commands", (req, res) => {
  const { path: breadcrumb = [], name, type, phrases = [] } = req.body || {};
  writeCommands(breadcrumb, {
    name: name || "",
    type: type || "expense",
    phrases,
  });
  res.json({ ok: true });
});

app.delete("/group/command", (req, res) => {
  const { path: breadcrumb = [], phrase } = req.body || {};
  if (!phrase) return res.status(400).json({ error: "Invalid phrase" });
  const commands = readCommands(breadcrumb);
  commands.phrases = (commands.phrases || []).filter((item) => item !== phrase);
  writeCommands(breadcrumb, commands);
  res.json({ ok: true });
});

app.post("/op", (req, res) => {
  const { amount, type, user, datetime, groupPath, title } = req.body || {};
  if (typeof amount !== "number" || !datetime || !Array.isArray(groupPath)) {
    return res.status(400).json({ error: "Invalid payload" });
  }
  const ops = loadOps();
  ops.push({
    id: Date.now(),
    amount,
    type: type || "expense",
    user: user || "Ви",
    datetime,
    groupPath,
    title: title || "",
  });
  saveOps(ops);
  res.json({ ok: true });
});

app.get("/ops", (req, res) => {
  const month = req.query.month || "";
  const pathFilter = req.query.path || "";
  const pathParts = parsePathQuery(pathFilter);
  const ops = loadOps();
  const filtered = ops.filter((op) => {
    const opMonth = op.datetime?.slice(0, 7);
    if (month && opMonth !== month) return false;
    if (pathParts.length > 0) {
      const opPath = normalizePathParts(op.groupPath);
      return pathParts.join("/") === opPath.join("/");
    }
    return true;
  });
  const total = filtered.reduce((sum, op) => {
    const amount = typeof op.amount === "number" ? op.amount : 0;
    return op.type === "income" ? sum + amount : sum - amount;
  }, 0);
  res.json({ total, items: filtered, list: filtered });
});

app.get("/stats", (req, res) => {
  const pathQuery = req.query.path || "";
  const pathParts = parsePathQuery(pathQuery);
  const tree = loadTree();
  const node = findNodeByPath(tree, pathParts);
  if (!node) return res.status(404).json({ error: "Path not found" });

  const leafPaths = collectLeafPaths(node);
  const ops = loadOps();
  const byCategory = {};
  let totalExpense = 0;
  let totalIncome = 0;

  leafPaths.forEach((leafPath) => {
    const leafSlugPath = toSlugPath(leafPath.slice(pathParts.length));
    const leafTotals = ops.reduce(
      (acc, op) => {
        const opPath = normalizePathParts(op.groupPath);
        const normalizedLeaf = normalizePathParts(leafPath);
        if (opPath.join("/") !== normalizedLeaf.join("/")) return acc;
        const amount = typeof op.amount === "number" ? op.amount : 0;
        if (op.type === "income") {
          acc.income += amount;
        } else {
          acc.expense += amount;
        }
        return acc;
      },
      { income: 0, expense: 0 }
    );
    const leafBalance = leafTotals.income - leafTotals.expense;
    byCategory[leafSlugPath || toSlugPath(leafPath)] = leafBalance;
    totalExpense += leafTotals.expense;
    totalIncome += leafTotals.income;
  });

  res.json({
    balance: totalIncome - totalExpense,
    totalExpense,
    totalIncome,
    byCategory,
  });
});

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
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});

const ensureExpenseSchema = () => {
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
};

ensureExpenseSchema();
