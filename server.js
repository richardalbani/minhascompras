const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

const DB_FILE = './database.json';

// Carrega ou inicializa
const loadDB = () => {
  if (!fs.existsSync(DB_FILE)) fs.writeFileSync(DB_FILE, JSON.stringify({ users: [] }));
  return JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
};

const saveDB = (db) => {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
};

app.post('/api/login', (req, res) => {
  const { username } = req.body;
  const db = loadDB();

  let user = db.users.find(u => u.username === username);
  if (!user) {
    user = { username, compras: [] };
    db.users.push(user);
    saveDB(db);
  }

  res.json({ success: true, user });
});

app.get('/api/compras/:username', (req, res) => {
  const db = loadDB();
  const user = db.users.find(u => u.username === req.params.username);
  res.json(user?.compras || []);
});

app.post('/api/compras/:username', (req, res) => {
  const db = loadDB();
  const user = db.users.find(u => u.username === req.params.username);
  if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });

  user.compras = req.body.compras;
  saveDB(db);
  res.json({ success: true });
});

app.listen(PORT, () => console.log(`Servidor rodando em http://localhost:${PORT}`));
