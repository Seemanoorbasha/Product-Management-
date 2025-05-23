const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const mysql = require('mysql');
const app = express();
const PORT = process.env.PORT || 3000;

// Database connection
const db = mysql.createConnection({
  host: process.env.MYSQLHOST,
  port: parseInt(process.env.MYSQLPORT) || 3306, // Ensure port is a number
  user: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQLDATABASE,
  ssl: { rejectUnauthorized: false }, // Add SSL option
  insecureAuth: true, // Allow older authentication
});

// Add this after connecting to MySQL
db.query(`
  CREATE TABLE IF NOT EXISTS products (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255),
    price FLOAT,
    image TEXT,
    quantity VARCHAR(50),
    category VARCHAR(100)
)`, (err) => {
  if (err) console.error("❌ Table creation failed:", err);
  else console.log("✅ Products table ready");
});

db.connect((err) => {
  if (err) {
    console.error('❌ MySQL connection FAILED:', err.message);
    process.exit(1);
  } else {
    console.log('✅ Connected to MySQL database.');
  }
});

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Create products table
app.get('/create-products-table', (req, res) => {
  const sql = `
    CREATE TABLE IF NOT EXISTS products (
      id VARCHAR(255) PRIMARY KEY,
      name VARCHAR(255),
      price FLOAT,
      image TEXT,
      quantity VARCHAR(50),
      category VARCHAR(100)
  )`;
  db.query(sql, (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.send('✅ products table created successfully.');
  });
});

// CRUD Routes
app.get('/api/products', (req, res) => {
  const sql = 'SELECT * FROM products';
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.get('/api/products/:id', (req, res) => {
  const sql = 'SELECT * FROM products WHERE id = ?';
  db.query(sql, [req.params.id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results[0] || null);
  });
});

app.post('/api/products', (req, res) => {
  const { name, price, image, quantity, category } = req.body;
  const id = uuidv4();
  const sql = 'INSERT INTO products (id, name, price, image, quantity, category) VALUES (?, ?, ?, ?, ?, ?)';
  db.query(sql, [id, name, price, image, quantity, category], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id, ...req.body });
  });
});

app.put('/api/products/:id', (req, res) => {
  const { name, price, image, quantity, category } = req.body;
  const sql = 'UPDATE products SET name=?, price=?, image=?, quantity=?, category=? WHERE id=?';
  db.query(sql, [name, price, image, quantity, category, req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: req.params.id, ...req.body });
  });
});

app.delete('/api/products/:id', (req, res) => {
  const sql = 'DELETE FROM products WHERE id = ?';
  db.query(sql, [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
