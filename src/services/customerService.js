const bcrypt = require('bcrypt')

const DuplicateError = require('../CustomErrors/DuplicateError');
const NotFoundError = require('../CustomErrors/SystemError');
const Customer = require('../models/customer');
const dbPool = require('../config/dbPool');
const NoContentError = require('../CustomErrors/NoContentError');
const UnauthorizedError = require('../CustomErrors/UnauthorizedError');


// Função para verificar se o usuário já existe no banco de dados
const checkExistingCustomer = async (customer) => {

    let connection = null

    try {
        connection = await dbPool.getConnection();

        const sql = 'SELECT * FROM customers WHERE cpf_cnpj = ?';
        const [query] = await connection.execute(sql, [customer.cpfCnpj]);
        return query.length !== 0;
    } catch (error) {

        console.log(error)

        throw new Error('Erro ao verificar existência do usuário');
    } finally {
        if (connection) {
            connection.release()
        }
    }
}

// Buscar todos os usuários
const getAllCustomers = async () => {

    let connection = null

    try {
        connection = await dbPool.getConnection();

        const sql = 'SELECT * FROM customers';
        const [rows] = await connection.execute(sql);
        return rows.map(row => new Customer(
            row.id,
            row.name,
            row.email,
            row.cpf_cnpj,
            row.person_type,
            undefined, // Ocultando o campo de senha
            row.asaas_id,
            row.created_at
        ));
    } catch (error) {

        console.log(error)

        throw new Error('Erro ao buscar usuários');
    }finally {
        if (connection) {
            connection.release()
        }
    }
}

// Buscar um único usuário
const getCustomer = async (customerId) => {

    let connection = null

    try {
        connection = await dbPool.getConnection();

        const sql = 'SELECT * FROM customers WHERE id = ?';
        const [rows] = await connection.execute(sql, [customerId]);
        // Verifique se o usuário foi encontrado
        if (rows.length === 0) {
            throw new NotFoundError('Usuário não encontrado');
        }

        const row = (rows[0])

        return new Customer(
            row.id,
            row.name,
            row.email,
            row.cpf_cnpj,
            row.person_type,
            undefined, // Limpando campo de senha
            row.asaas_id,
            row.created_at
        )
    } catch (error) {

        console.log(error)

        if (error instanceof NotFoundError) {
            throw error;
        }
        throw new Error('Erro ao buscar usuário');
    }finally {
        if (connection) {
            connection.release()
        }
    }
}

// Cadastrar usuário
const createNewCustomer = async (customer) => {

    let connection = null

    try {
        connection = await dbPool.getConnection();

        const existingCustomer = await checkExistingCustomer(customer);
        if (existingCustomer) {
            throw new DuplicateError("Já existe um usuário com este CPF ou CNPJ cadastrado");
        }

        // Hash da senha antes de armazenar no banco de dados
        const hashPassword = await bcrypt.hash(customer.password, 10);

        const sql = 'INSERT INTO customers (name, email, cpf_cnpj, person_type, password, asaas_id) VALUES (?, ?, ?, ?, ?, ?)'
        connection.execute(sql, [customer.name, customer.email, customer.cpfCnpj, customer.personType, hashPassword, customer.asaasId]);
    } catch (error) {

        console.log(error)

        if (error instanceof DuplicateError) {
            throw error;
        }
        throw new Error('Erro ao cadastrar usuário')
    } finally {
        if (connection) {
            connection.release()
        }
    }
}

// Atualizar usuário
const updateCustomer = async (customer) => {

    let connection = null

    try {
        connection = await dbPool.getConnection();

        const sql = 'UPDATE customers SET name = ?, email = ?, cpf_cnpj = ?, person_type = ?, asaas_id = ? WHERE id = ?'
        const [ ResultSetHeader ] = await connection.execute(sql, [customer.name, customer.email, customer.cpfCnpj, customer.personType, customer.asaasId, customer.id])

        if (ResultSetHeader.changedRows === 0) {
            if (ResultSetHeader.affectedRows === 1) {
                throw new NoContentError('Usuário atualizado sem alterações');
            }
            throw new NotFoundError('Usuário não encontrado');
        }

    } catch (error) {

        console.log(error)

        if (error instanceof NotFoundError || NoContentError) {
            throw error;
        }
        throw new Error('Erro ao buscar usuário');
    } finally {
        if (connection) {
            connection.release()
        }
    }
}

// Atualizar senha do usuário
const changePassword = async (customer, newPassword) => {

    let connection = null

    try {
        connection = await dbPool.getConnection()

        // Consulte o banco de dados para obter o usuário
        let sql = 'SELECT password FROM customers WHERE id = ?'
        const [rows] = await connection.execute(sql, [customer.id]);

        // Verifique se foi encontrado algum usuário
        if (rows.length === 0) {
            throw new UnauthorizedError('Usuário não encontrado')
        }

        // Os dados estão no primeiro elemento do array rows
        const row = (rows[0]);

        // Verifique a senha usando o campo correto (senha)
        const passwordVerify = await bcrypt.compare(customer.password, row.password)
        if (!passwordVerify) {
            throw new UnauthorizedError('Credenciais inválidas')
        }

        // Hash da senha antes de armazenar no banco de dados
        const hashPassword = await bcrypt.hash(newPassword, 10);
        sql = 'UPDATE customers SET password = ? WHERE id = ?'
        const [ResultSetHeader] = await connection.execute(sql, [hashPassword, customer.id])

        if (ResultSetHeader.affectedRows === 0) {
            throw new NotFoundError('Usuário não encontrado')
        }

    } catch (error) {

        console.log(error)

        if (error instanceof NotFoundError || UnauthorizedError) {
            throw error;
        }
        throw new Error('Erro ao buscar usuário');
    } finally {
        if (connection) {
            connection.release()
        }
    }
}

// Deletar Usuário
const deleteCustomer = async (customerId) => {

    let connection = null

    try {
        connection = await dbPool.getConnection();

        await connection.beginTransaction();

        // Deletar os tokens do cliente
        let sql = 'DELETE FROM tokens WHERE customer_id = ?';
        await connection.execute(sql, [customerId]);

        // Deletar o cliente
        sql = 'DELETE FROM customers WHERE id = ?';
        const [ResultSetHeader] = await connection.execute(sql, [customerId])

        if (ResultSetHeader.affectedRows === 0) {
            // Reverter a transação se o cliente não for encontrado
            await connection.rollback();
            throw new NotFoundError('Usuário não encontrado');
        }

        // Confirmar a transação
        await connection.commit();

    } catch (error) {

        console.log(error)

        if (error instanceof NotFoundError) {
            throw error;
        }
        throw new Error('Erro ao buscar usuário');
    } finally {
        if (connection) {
            connection.release()
        }
    }
}

module.exports = { getAllCustomers, 
                   getCustomer,
                   createNewCustomer,
                   updateCustomer,
                   deleteCustomer,
                   changePassword
                };
