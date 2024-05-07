const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const db = require('../db');
const secretKey = 'Ticket$System';

// Função para verificar se o usuário já existe no banco de dados
function checkExistingUsers(cpf, cnpj) {
    return new Promise((resolve, reject) => {
        db.query('SELECT * FROM users WHERE cpf = ? or cnpj = ?', [cpf, cnpj], (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result.length > 0);
            }
        });
    });
}

// Buscar todos os usuários
router.get('/', (req, res) => {
    db.query('SELECT * FROM users', (err, results) => {

        if (err) {
        res.status(500).send('Erro ao buscar usuários');
        return;
        }
        res.json(results);
    });
});

// Busca um único usuário
router.get('/:id', (req, res) => {
    const userId = req.params.id;
    db.query('SELECT * FROM users WHERE id = ?', userId, (err, results) => {
      if (err) {
        res.status(500).send('Erro ao buscar usuário');
        return;
      }
      if (results.length === 0) {
        res.status(404).send('Usuário não encontrado');
        return;
      }
      res.json(results[0]);
    });
  });
  
  // Cadastra um usuário
  router.post('/', async (req, res) => {
    const { name, email, cpf, cnpj, password } = req.body;

    const existingUser = await checkExistingUsers(cpf, cnpj);
    if (existingUser) {
        return res.status(409).send("Já existe um usuário com este CPF ou CNPJ cadastrado.");
    }

    // Hash da senha antes de armazenar no banco de dados
    const hashPassword = await bcrypt.hash(password, 10);

    db.query('INSERT INTO users (name, email, cpf, cnpj, password) VALUES (?, ?, ?, ?, ?)', [name, email, cpf, cnpj, hashPassword], (err, results) => {
      if (err) {
        res.status(500).send('Erro ao cadastrar usuário');
        return;
      }
      res.status(201).send('Usuário cadastrado com sucesso');
    });
  });
  
  // Altera um usuário
  router.put('/:id', async (req, res) => {
    const userId = req.params.id;
    const { name, email, cpf, cnpj, password } = req.body;

    // Hash da senha antes de armazenar no banco de dados
    const hashPassword = await bcrypt.hash(password, 10);

    db.query('UPDATE users SET name = ?, email = ?, cpf = ?, cnpj = ?, password = ? WHERE id = ?', [name, email, cpf, cnpj, hashPassword, userId], (err, results) => {
      if (err) {
        res.status(500).send('Erro ao atualizar usuário');
        return;
      }
      res.status(200).send('Usuário atualizado com sucesso');
    });
  });
  
  // Deleta um usuário
  router.delete('/:id', (req, res) => {
    const id = req.params.id;
    db.query('DELETE FROM users WHERE id = ?', id, (err, results) => {
      if (err) {
        res.status(500).send('Erro ao deletar usuário');
        return;
      }
      res.status(200).send('Usuário deletado com sucesso');
    });
  });
  
  module.exports = router;

module.exports = router;
