const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { v4: uuidv4 } = require('uuid')

const secretKey = 'Ticket$System'

const UnauthorizedError = require('../CustomErrors/UnauthorizedError')
const Customer = require('../models/Customer')
const dbPool = require('../config/dbPool')

// Rota para login
const login = async (email, password) => {
    let connection

    try {
        connection = await dbPool.getConnection()

        // Consulte o banco de dados para obter o usuário
        const sqlSelect = 'SELECT * FROM customers WHERE email = ?'
        const [rows] = await connection.execute(sqlSelect, [email])

        // Verifique se foi encontrado algum usuário
        if (rows.length === 0) {
            throw new UnauthorizedError('Credenciais inválidas')
        }

        // Os dados estão no primeiro elemento do array rows
        const row = (rows[0])
        const customer = new Customer(
            row.id,
            row.name,
            row.email,
            row.phone,
            row.mobile_phone,
            row.cpf_cnpj,
            row.personType,
            row.password,
            row.asaas_id,
            row.created_at
        )

        console.log('compare: ' + password + " and: " + customer.password)
        
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
        const sqlInsert = 'INSERT INTO tokens (id, token, customer_id) VALUES (?, ?, ?)'
        await connection.execute(sqlInsert, [
            "tok_" + uuidv4(),
            token, 
            customer.id
        ])

        // Retorne uma mensagem indicando que o usuário foi logado com sucesso
        customer.password = undefined
        return ({ token: token, customer: customer })

    } catch (error) {

        console.log(error)

        if (error instanceof UnauthorizedError) {
            throw error
        }

        throw new Error('Erro ao processar a solicitação')
    } finally {
        if (connection) {
            connection.release()
        }
    }
}

// Rota para logout
const logout = async (customer, token) => {
    let connection

    try {
        connection = await dbPool.getConnection()

        // Verifique se o token foi fornecido
        if (!token) {
            throw new UnauthorizedError('Token não fornecido')
        }

        // Verifique se o id foi fornecido
        if (!customer.id) {
            throw new UnauthorizedError('ID não fornecido')
        }

        // Altere a data de logout do token no banco de dados
        const [ResultSetHeader] = await connection.execute('UPDATE tokens SET logout_data = CURRENT_TIMESTAMP WHERE customer_id = ? AND token = ? AND logout_data is NULL', [customer.id, token])

        // Verifique se o token foi excluído (nenhuma correspondência encontrada)
        if (ResultSetHeader.affectedRows === 0) {
            throw new UnauthorizedError('Token inválido')
        }
    } catch (error) {

        console.log(error)

        if (error instanceof UnauthorizedError) {
            throw error
        }

        throw new Error('Erro ao processar a solicitação')
    } finally {
        if (connection) {
            connection.release()
        }
    }
}

module.exports = { login, logout }