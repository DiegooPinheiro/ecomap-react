// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3001;

// 🔧 Middleware
app.use(bodyParser.json());
app.use(express.json());

// ✅ CORS dinâmico (permite 5173 e 5174)
const allowedOrigins = ['http://localhost:5173', 'http://localhost:5174'];
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

// 🧩 Conexão com MySQL
const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'recicla_db'
});

db.connect(err => {
  if (err) {
    console.error('❌ Erro ao conectar ao MySQL:', err);
  } else {
    console.log('✅ Conectado ao MySQL');
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

// 🧍 Cadastro
app.post('/api/register', async (req, res) => {
  const { nome, email, senha } = req.body;
  if (!nome || !email || !senha) return res.status(400).json({ error: 'Campos obrigatórios' });

  const hash = await bcrypt.hash(senha, 10);
  db.query('INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)', [nome, email, hash], (err) => {
    if (err) return res.status(500).json({ error: 'Erro ao registrar usuário' });
    res.json({ message: 'Usuário registrado com sucesso' });
  });
});

// 🔐 Login
app.post('/api/login', (req, res) => {
  const { email, senha } = req.body;
  db.query('SELECT * FROM usuarios WHERE email = ?', [email], async (err, results) => {
    if (err || results.length === 0) return res.status(401).json({ error: 'Credenciais inválidas' });

    const user = results[0];
    const match = await bcrypt.compare(senha, user.senha);
    if (!match) return res.status(401).json({ error: 'Senha incorreta' });

    const token = jwt.sign({ id: user.id, nome: user.nome }, process.env.JWT_SECRET || 'segredo123', { expiresIn: '1h' });
    res.json({ token, user: { id: user.id, nome: user.nome, email: user.email } });
  });
});

// ♻️ Cadastrar ponto
app.post('/api/pontos', verificarToken, (req, res) => {
  const { title, address, lat, lng, tipo, horario } = req.body;
  db.query(
    'INSERT INTO pontos (title, address, lat, lng, tipo, horario, status, usuario_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [title, address, lat, lng, tipo, horario, 'pendente', req.user.id],
    (err) => {
      if (err) return res.status(500).json({ error: 'Erro ao adicionar ponto' });
      res.json({ message: 'Ponto enviado para aprovação' });
    }
  );
});

// 🧭 Listar pontos
app.get('/api/pontos', (req, res) => {
  db.query('SELECT * FROM pontos WHERE status = "aprovado"', (err, results) => {
    if (err) return res.status(500).json({ error: 'Erro ao buscar pontos' });
    res.json(results);
  });
});

// 🚀 Inicializar servidor
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
