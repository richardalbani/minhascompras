const express = require('express');
const path = require('path');
const bcrypt = require('bcrypt');
const Database = require('better-sqlite3');

const app = express();
const port = process.env.PORT || 3000;

// Cria/abre banco SQLite local
const db = new Database('./data.sqlite');

// Cria tabela users se não existir
db.prepare(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT
  )
`).run();

app.use(express.json());

// Registro de usuário
app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ msg: 'Usuário e senha são obrigatórios' });

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const stmt = db.prepare('INSERT INTO users (username, password) VALUES (?, ?)');
    stmt.run(username, hashedPassword);
    res.status(201).json({ msg: 'Cadastro feito com sucesso!' });
  } catch (e) {
    if (e.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      res.status(409).json({ msg: 'Usuário já existe' });
    } else {
      res.status(500).json({ msg: 'Erro interno no servidor' });
    }
  }
});

// Login
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ msg: 'Usuário e senha são obrigatórios' });

  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);

  if (!user) return res.status(401).json({ msg: 'Usuário ou senha inválidos' });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(401).json({ msg: 'Usuário ou senha inválidos' });

  // Login ok
  res.json({ msg: 'Login efetuado com sucesso' });
});

// Serve frontend estático
app.use(express.static(path.join(__dirname, 'frontend')));

// Redireciona todas rotas para o index.html (SPA fallback)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
