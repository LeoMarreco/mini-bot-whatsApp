const sqlite3 = require('sqlite3').verbose()

let db;

function initDb() {
    return new Promise((resolve, reject) =>{
        db = new sqlite3.Database('./messages.db', (err) => {
            if (err) {
                console.error('Erro ao abrir o banco de dados:', err.message);
                reject(err);
            } else{
                console.log('Conectado ao banco de dados SQLite.');

                db.run(
                    `CREATE TABLE IF NOT EXISTS messages (
                      id INTEGER PRIMARY KEY AUTOINCREMENT,
                      sender TEXT NOT NULL,
                      message TEXT NOT NULL,
                      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
                    )`,
                    (err) => {
                      if (err) {
                        console.error('Erro ao criar tabela:', err.message);
                        reject(err);
                      } else {
                        console.log('Tabela de mensagens verificada/criada.');
                        resolve(db); // opcional: resolve o próprio db
                      }
                    }
                );
            }
        });
    });
}

function saveMessage(sender, message) {
    return new Promise((resolve, reject) => {
        if (!db) {
            return reject(new Error('Banco de dados não inicializado.'));
        }

        const stmt = db.prepare('INSERT INTO messages (sender, message) VALUES (?, ?)');
        stmt.run(sender, message, function (err){
            if (err) {
                console.error('Erro ao salvar mensagem:', err.message);
                reject(err);
            } else{
                console.log(`Mensagem salva com ID: ${this.lastID}`);
                resolve(this.lastID);
            }
        });
        stmt.finalize();
    });
}

module.exports = { initDb, saveMessage };