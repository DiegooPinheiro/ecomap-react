const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./database.db');

db.run(`UPDATE pontos SET status = 'aprovado' WHERE status = 'pendente'`, function(err) {
  if (err) console.error('Erro ao aprovar pontos:', err);
  else console.log(`✅ ${this.changes} ponto(s) aprovados`);
  db.close();
});
