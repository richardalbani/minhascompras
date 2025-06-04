const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const jwt = require('jsonwebtoken');

const SECRET = 'changeme';
const app = express();
app.use(cors());
app.use(bodyParser.json());

const db = new sqlite3.Database('./shopping.db');
db.serialize(() => {
  db.run("CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, username TEXT UNIQUE, password TEXT)");
  db.run("CREATE TABLE IF NOT EXISTS items (id INTEGER PRIMARY KEY, name TEXT, quantity INTEGER, value REAL, user_id INTEGER)");
  db.run("INSERT OR IGNORE INTO users(username, password) VALUES('user','user123'),('adm','adm123')");
});

function authMiddleware(req, res, next) {
  const token = req.headers['authorization'];
  if (!token) return res.status(401).json({ error: 'No token' });
  jwt.verify(token, SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ error: 'Invalid token' });
    req.user = decoded;
    next();
  });
}

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  db.get("SELECT * FROM users WHERE username = ? AND password = ?", [username, password], (err, user) => {
    if (user) {
      const token = jwt.sign({ id: user.id, username: user.username }, SECRET);
      res.json({ token, isAdmin: user.username === 'adm' });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  });
});

app.get('/items', authMiddleware, (req, res) => {
  const sql = req.user.username === 'adm' 
    ? "SELECT * FROM items" 
    : "SELECT * FROM items WHERE user_id = ?";
  const params = req.user.username === 'adm' ? [] : [req.user.id];
  db.all(sql, params, (err, rows) => {
    res.json(rows);
  });
});

app.post('/items', authMiddleware, (req, res) => {
  const { name, quantity, value } = req.body;
  db.run("INSERT INTO items(name, quantity, value, user_id) VALUES(?,?,?,?)",
    [name, quantity, value, req.user.id], function(err) {
    res.json({ id: this.lastID });
  });
});

app.delete('/items/:id', authMiddleware, (req, res) => {
  const id = req.params.id;
  db.run("DELETE FROM items WHERE id = ?", [id], function(err) {
    res.json({ deleted: this.changes });
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));