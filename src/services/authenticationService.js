const connection = require('../config/connection');
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const secretKey = 'Ticket$System'

const UnauthorizedError = require('../CustomErrors/UnauthorizedError')
const Customer = require('../models/customer')

// Rota para login
const login = async (email, password) => {
    try {
        // Consulte o banco de dados para obter o usuário
        const sql = 'SELECT * FROM customers WHERE email = ?'
        const [rows] = await connection.execute(sql, [email]);

        // Verifique se foi encontrado algum usuário
        if (rows.length === 0) {
            throw new UnauthorizedError('Credenciais inválidas')
        }

        // Os dados estão no primeiro elemento do array rows
        const customerData = (rows[0]);
        const customer = new Customer(
            customerData.id,
            customerData.name,
            customerData.email,
            customerData.cpfCnpj,
            customerData.personType,
            customerData.password,
            customerData.asaasId
        )
        // Verifique a senha usando o campo correto (senha)
        const passwordVerify = await bcrypt.compare(password, customer.password)
        if (!passwordVerify) {
            throw new UnauthorizedError('Credenciais inválidas')
        }

        // Credenciais válidas, gere um token JWT
        const token = jwt.sign(
            { user: customer.email, user_id: customer.id },
            secretKey
        )

        // Inserindo o token no banco de dados
        connection.query('INSERT INTO tokens (token, customer_id, login_data) VALUES (?, ?, NOW())', [token, customer.id])

        // Retorne uma mensagem indicando que o usuário foi logado com sucesso
        customer.password = undefined
        return ({ token: token, customer: customer })

    } catch (error) {

        if (error instanceof UnauthorizedError) {
            throw error;
        }

        throw new Error('Erro ao processar a solicitação')
    }
}

// Rota para logout
const logout = async (customer, token) => {
    try {
        // Verifique se o token foi fornecido
        if (!token) {
            throw new UnauthorizedError('Token não fornecido')
        }

        // Verifique se o id foi fornecido
        if (!customer.id) {
            throw new UnauthorizedError('ID não fornecido')
        }

        // Altere a data de logout do token no banco de dados
        const [ResultSetHeader] = await connection.execute('UPDATE tokens SET logout_data = now() WHERE customer_id = ? AND token = ? AND logout_data is NULL', [customer.id, token])

        // Verifique se o token foi excluído (nenhuma correspondência encontrada)
        if (ResultSetHeader.affectedRows === 0) {
            throw new UnauthorizedError('Token inválido')
        }
    } catch (error) {

        if (error instanceof UnauthorizedError) {
            throw error;
        }

        throw new Error('Erro ao processar a solicitação')
    }
}

module.exports = { login, logout }