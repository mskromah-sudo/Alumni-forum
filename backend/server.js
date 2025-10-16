// backend/server.js
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());

const DB_PATH = path.join(__dirname, 'alumni.db');
const SCHEMA_PATH = path.join(__dirname, 'schema.sql');

// open sqlite DB and init schema
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('Failed to open DB:', err.message);
    process.exit(1);
  }
  console.log('Connected to SQLite DB:', DB_PATH);
  const schema = fs.readFileSync(SCHEMA_PATH, 'utf8');
  db.exec(schema, (e) => {
    if (e) console.error('Schema init error:', e);
    else console.log('Database schema initialized');
  });
});

// Simple routes (expand as you build)
app.get('/api/health', (req, res) => res.json({ status: 'OK', message: 'Server is running' }));

// GET /api/alumni - fetch verified alumni with simple filters
app.get('/api/alumni', (req, res) => {
  const { graduation_year, course, company, location } = req.query;
  let sql = `SELECT id, name, email, graduation_year, course, current_job, company, location
             FROM users WHERE role = 'alumni' AND is_verified = 1`;
  const params = [];
  if (graduation_year) { sql += ' AND graduation_year = ?'; params.push(graduation_year); }
  if (course)         { sql += ' AND course LIKE ?';       params.push(`%${course}%`); }
  if (company)        { sql += ' AND company LIKE ?';      params.push(`%${company}%`); }
  if (location)       { sql += ' AND location LIKE ?';     params.push(`%${location}%`); }

  db.all(sql, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Success', data: rows });
  });
});

// Mount routes that use DB/transactions
app.use('/api/admin/reports', require('./routes/adminReports'));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
