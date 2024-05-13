const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const db = require('../db');
const secretKey = 'Ticket$System';

// Rota para login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Consulte o banco de dados para obter o usuário
        const sql = 'SELECT * FROM users WHERE email = ?';
        db.query(sql, [email], async (err, result) => {
            if (err) throw err;

            if (result.length === 0) {
                return res.status(401).json({ message: 'Credenciais inválidas' });
            }

            const userData = result[0];

            // Verifique a senha usando o campo correto (senha)
            const passwordVerify = await bcrypt.compare(password, userData.password);
            if (!passwordVerify) {
                return res.status(401).json({ message: 'Credenciais inválidas' });
            }

            // Credenciais válidas, gere um token JWT
            const token = jwt.sign(
                { user: userData.email, user_id: userData.id },
                secretKey
            );

            // Inserindo o token no banco de dados
            await db.query('INSERT INTO tokens (token, user_id, login_data) VALUES (?, ?, NOW())', [token, userData.id]);

            // Retorne uma mensagem indicando que o usuário foi logado com sucesso
            const userDataWithoutPassword = { ...userData, password: undefined };
            res.status(200).json({ message: 'Usuário logado com sucesso', token, user: userDataWithoutPassword });
        })

        
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erro ao processar a solicitação' });
    }
});

// Rota para logout
router.put('/logout', async (req, res) => {
    try {
        const { user, token } = req.body;
        console.log(user);
        const { id } = user;
        console.log ("USUARIO ID: " + id)
        console.log ("TOKEN: " + token)

        // Verifique se o token foi fornecido
        if (!token) {
            return res.status(401).send('Token não fornecido');
        }

        // Verifique se o id foi fornecido
        if (!id) {
            return res.status(401).send('ID não fornecido');
        }

        // Altere a data de logout do token do banco de dados
        const result = await db.query('UPDATE tokens SET logout_data = now() WHERE user_id = ? and token = ?', [id, token]);

        // Verifique se o token foi excluído (nenhuma correspondência encontrada)
        if (result.affectedRows === 0) {
            return res.status(401).send('Token inválido');
        }

        res.send('Logout realizado com sucesso');
    } catch (err) {
        console.error(err);
        res.status(500).send('Erro ao processar a solicitação');
    }
});

module.exports = router;