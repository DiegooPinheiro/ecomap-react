require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3001;

// 🔧 Middleware
app.use(bodyParser.json());
app.use(express.json());

// ✅ CORS dinâmico (permite 5173, 5174 e 5175)
const allowedOrigins = ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'];
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  next();
});

// 🧩 Conexão com SQLite
const db = new sqlite3.Database('./database.db', (err) => {
  if (err) console.error('❌ Erro ao conectar ao SQLite:', err);
  else {
    console.log('✅ Conectado ao SQLite');
    db.run(`CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      senha TEXT NOT NULL,
      is_admin INTEGER DEFAULT 0
    )`);
    db.run(`CREATE TABLE IF NOT EXISTS pontos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      address TEXT NOT NULL,
      lat REAL NOT NULL,
      lng REAL NOT NULL,
      tipo TEXT NOT NULL,
      horario TEXT,
      status TEXT DEFAULT 'pendente',
      usuario_id INTEGER,
      FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
    )`);
  }
});

// 🔑 Middleware de autenticação
function verificarToken(req, res, next) {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(403).json({ error: 'Token não fornecido' });
  jwt.verify(token, process.env.JWT_SECRET || 'segredo123', (err, decoded) => {
    if (err) return res.status(401).json({ error: 'Token inválido' });
    req.user = decoded;
    next();
  });
}

// 🔒 Middleware de admin
function verificarAdmin(req, res, next) {
  db.get('SELECT is_admin FROM usuarios WHERE id = ?', [req.user.id], (err, row) => {
    if (err || !row) return res.status(403).json({ error: 'Usuário não encontrado' });
    if (row.is_admin !== 1) return res.status(403).json({ error: 'Acesso negado: admin apenas' });
    next();
  });
}

// 🧍 Cadastro
app.post('/api/register', async (req, res) => {
  const { nome, email, senha, is_admin } = req.body;
  if (!nome || !email || !senha) return res.status(400).json({ error: 'Campos obrigatórios' });

  const hash = await bcrypt.hash(senha, 10);
  db.run(
    'INSERT INTO usuarios (nome, email, senha, is_admin) VALUES (?, ?, ?, ?)',
    [nome, email, hash, is_admin ? 1 : 0],
    function(err) {
      if (err) return res.status(500).json({ error: 'Erro ao registrar usuário' });
      res.json({ message: 'Usuário registrado com sucesso' });
    }
  );
});

// 🔐 Login
app.post('/api/login', (req, res) => {
  const { email, senha } = req.body;
  db.get('SELECT * FROM usuarios WHERE email = ?', [email], async (err, user) => {
    if (err || !user) return res.status(401).json({ error: 'Credenciais inválidas' });

    const match = await bcrypt.compare(senha, user.senha);
    if (!match) return res.status(401).json({ error: 'Senha incorreta' });

    const token = jwt.sign(
      { id: user.id, nome: user.nome, is_admin: user.is_admin },
      process.env.JWT_SECRET || 'segredo123',
      { expiresIn: '1h' }
    );
    res.json({ token, user: { id: user.id, nome: user.nome, email: user.email, is_admin: user.is_admin } });
  });
});

// ♻️ Cadastrar ponto
app.post('/api/pontos', verificarToken, (req, res) => {
  const { title, address, lat, lng, tipo, horario } = req.body;
  db.run(
    'INSERT INTO pontos (title, address, lat, lng, tipo, horario, status, usuario_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [title, address, lat, lng, tipo, horario, 'pendente', req.user.id],
    function(err) {
      if (err) return res.status(500).json({ error: 'Erro ao adicionar ponto' });
      res.json({ message: 'Ponto enviado para aprovação' });
    }
  );
});

// 🧭 Listar pontos aprovados
app.get('/api/pontos', (req, res) => {
  db.all('SELECT * FROM pontos WHERE status = "aprovado"', [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Erro ao buscar pontos' });
    res.json(rows);
  });
});

// 🌟 ADMIN: listar todos os pontos pendentes
app.get('/api/admin/pontos', verificarToken, verificarAdmin, (req, res) => {
  db.all('SELECT * FROM pontos WHERE status = "pendente"', [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Erro ao buscar pontos pendentes' });
    res.json(rows);
  });
});

// 🌟 ADMIN: aprovar ponto
app.post('/api/admin/pontos/:id/approve', verificarToken, verificarAdmin, (req, res) => {
  const { id } = req.params;
  db.run('UPDATE pontos SET status = "aprovado" WHERE id = ?', [id], function(err) {
    if (err) return res.status(500).json({ error: 'Erro ao aprovar ponto' });
    res.json({ message: 'Ponto aprovado com sucesso' });
  });
});

// 🌟 ADMIN: excluir ponto
app.delete('/api/admin/pontos/:id', verificarToken, verificarAdmin, (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM pontos WHERE id = ?', [id], function(err) {
    if (err) return res.status(500).json({ error: 'Erro ao excluir ponto' });
    res.json({ message: 'Ponto excluído com sucesso' });
  });
});

// 🔍 Endpoint para verificar usuário logado
app.get('/api/me', verificarToken, (req, res) => {
  db.get('SELECT id, nome, email, is_admin FROM usuarios WHERE id = ?', [req.user.id], (err, row) => {
    if (err || !row) return res.status(404).json({ error: 'Usuário não encontrado' });
    res.json({ user: row });
  });
});

const adminEmail = 'admin@admin.com';
const adminSenha = 'admin123';
const adminNome = 'Admin';
const JWT_SECRET = process.env.JWT_SECRET || 'segredo123';

// Criar usuário admin inicial se não existir
db.get('SELECT * FROM usuarios WHERE is_admin = 1', async (err, row) => {
  if (err) return console.error('Erro ao verificar admin:', err);

  if (!row) {
    const hash = await bcrypt.hash(adminSenha, 10);
    db.run(
      'INSERT INTO usuarios (nome, email, senha, is_admin) VALUES (?, ?, ?, ?)',
      [adminNome, adminEmail, hash, 1],
      function(err) {
        if (err) return console.error('Erro ao criar admin inicial:', err);
        
        // gerar token JWT para o admin
        const token = jwt.sign(
          { id: this.lastID, nome: adminNome, is_admin: 1 },
          JWT_SECRET,
          { expiresIn: '1h' }
        );
        console.log(`✅ Usuário admin criado: ${adminEmail} / ${adminSenha}`);
        console.log(`🔑 Token JWT do admin (para testes): ${token}`);
      }
    );
  } else {
    // gerar token para admin existente
    const token = jwt.sign(
      { id: row.id, nome: row.nome, is_admin: 1 },
      JWT_SECRET,
      { expiresIn: '1h' }
    );
    console.log('✅ Já existe usuário admin no banco');
    console.log(`🔑 Token JWT do admin (para testes): ${token}`);
  }
});

// 🚀 Inicializar servidor
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));



