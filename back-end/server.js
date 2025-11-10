// server.js
const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();
const bodyParser = require("body-parser");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

// === Banco de Dados SQLite ===
const db = new sqlite3.Database("./banco.db", (err) => {
  if (err) {
    console.error("Erro ao conectar ao banco:", err.message);
  } else {
    console.log("🟢 Conectado ao banco de dados SQLite");
  }
});

// Cria tabela se não existir
db.run(`
  CREATE TABLE IF NOT EXISTS produtos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    preco TEXT NOT NULL,
    imagem TEXT,
    descricao TEXT
  )
`);

// === Rotas da API ===

// Listar produtos
app.get("/api/produtos", (req, res) => {
  db.all("SELECT * FROM produtos", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Adicionar produto
app.post("/api/produtos", (req, res) => {
  const { nome, preco, imagem, descricao } = req.body;
  db.run(
    "INSERT INTO produtos (nome, preco, imagem, descricao) VALUES (?, ?, ?, ?)",
    [nome, preco, imagem, descricao],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID, nome, preco, imagem, descricao });
    }
  );
});

// Deletar produto
app.delete("/api/produtos/:id", (req, res) => {
  const { id } = req.params;
  db.run("DELETE FROM produtos WHERE id = ?", id, function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Produto deletado com sucesso" });
  });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`🚀 API rodando na porta ${PORT}`));
