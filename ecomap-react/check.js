const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Aponta para o banco dentro da pasta server
const dbPath = path.join(__dirname, 'server', 'database.db');
const db = new sqlite3.Database(dbPath);

db.all('SELECT id, title, status FROM pontos', [], (err, rows) => {
  if (err) return console.error(err);
  console.log(rows);
  db.close();
});
