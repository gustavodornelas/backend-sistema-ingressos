const express = require('express');
const db = require('./db');

const app = express();
const PORT = 3000;

app.get('/', (req, res) => {
  res.send('API em funcionamento');
});

app.get('/usuarios', (req, res) => {
  db.query('SELECT * FROM usuarios', (err, results) => {
    if (err) {
      res.status(500).send('Erro ao buscar usuários');
      return;
    }
    res.json(results);
  });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
