const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const connection = require('../config/connection');
const secretKey = 'Ticket$System';

// Rota para login
router.post('/login', (req, res) => {
    try {
        const { email, password } = req.body;

        // Consulte o banco de dados para obter o usuário
        const sql = 'SELECT * FROM users WHERE email = ?';
        connection.execute(sql, [email], async (err, data) => {
            if (err) throw err;

            // Verifique se foi encontrado algum usuário
            if (data.length === 0) {
                return res.status(401).json({ message: 'Credenciais inválidas' });
            }

            const userData = data[0];

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
            connection.query('INSERT INTO tokens (token, user_id, login_data) VALUES (?, ?, NOW())', [token, userData.id]);

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
        const { id } = user;

        // Verifique se o token foi fornecido
        if (!token) {
            return res.status(401).json({ message: 'Token não fornecido' });
        }

        // Verifique se o id foi fornecido
        if (!id) {
            return res.status(401).json({ message: 'ID não fornecido' });
        }

        // Altere a data de logout do token no banco de dados
        connection.query('UPDATE tokens SET logout_data = now() WHERE user_id = ? AND token = ? AND logout_data is NULL', [id, token], data)
        .then(data => {
            console.log(data.affectedRows);

            // Verifique se o token foi excluído (nenhuma correspondência encontrada)
            if (data.affectedRows === 0) {
                return res.status(401).json({ message: 'Token inválido' });
            }
        });

        

        

        res.json({ message: 'Logout realizado com sucesso' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erro ao processar a solicitação' });
    }
});

module.exports = router;