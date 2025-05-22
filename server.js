const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const mysql = require('mysql');
const app = express();

const PORT = process.env.PORT || 3000;



const db = mysql.createConnection({
  host: process.env.MYSQLHOST,
  port: process.env.MYSQLPORT || 3306,
  user: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQLDATABASE,
});



db.connect((err) => {
  if (err) {
    console.error('❌ MySQL connection FAILED:', err.message);
    process.exit(1); // 💥 Stop the app if connection fails
  } else {
    console.log('✅ Connected to MySQL database.');
  }
});

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

app.get('/create-products-table', (req, res) => {
  const sql = `
    CREATE TABLE IF NOT EXISTS products (
      id VARCHAR(255) PRIMARY KEY,
      name VARCHAR(255),
      price FLOAT,
      image TEXT,
      quantity VARCHAR(50),
      category VARCHAR(100)
    );
  `;
  db.query(sql, (err) => {
    if (err) {
      console.error('❌ Table creation failed:', err.message);
      return res.status(500).json({ error: 'Table creation failed', details: err.message });
    }
    res.send('✅ products table created successfully.');
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
