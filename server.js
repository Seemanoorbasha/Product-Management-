const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const mysql = require('mysql');
const app = express();
const PORT = 3000;

// MySQL Connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',        // XAMPP default has no password
  database: 'shop'     // Your database name
});

db.connect((err) => {
  if (err) {
    console.error('❌ MySQL connection error:', err);
  } else {
    console.log('✅ Connected to MySQL database.');
  }
});

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Get all products
app.get('/products', (req, res) => {
  db.query('SELECT * FROM products', (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(results);
  });
});

// Get single product by ID
app.get('/products/:id', (req, res) => {
  const { id } = req.params;
  db.query('SELECT * FROM products WHERE id = ?', [id], (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (results.length === 0) return res.status(404).json({ error: 'Product not found' });
    res.json(results[0]);
  });
});

// Add new product
app.post('/products', (req, res) => {
  const { name, price, image, quantity, category } = req.body;
  const id = uuidv4();
  db.query(
    'INSERT INTO products (id, name, price, image, quantity, category) VALUES (?, ?, ?, ?, ?, ?)',
    [id, name, price, image, quantity, category],
    (err, result) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      res.status(201).json({ id, name, price, image, quantity, category });
    }
  );
});

// Update product
app.put('/products/:id', (req, res) => {
  const { name, price, image, quantity, category } = req.body;
  const { id } = req.params;
  db.query(
    'UPDATE products SET name = ?, price = ?, image = ?, quantity = ?, category = ? WHERE id = ?',
    [name, price, image, quantity, category, id],
    (err, result) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      if (result.affectedRows === 0) return res.status(404).json({ error: 'Product not found' });
      res.json({ id, name, price, image, quantity, category });
    }
  );
});

// Delete product
app.delete('/products/:id', (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM products WHERE id = ?', [id], (err, result) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Product not found' });
    res.status(204).send();
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
