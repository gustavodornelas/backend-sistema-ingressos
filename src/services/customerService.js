const connection = require('../config/connection');
const bcrypt = require('bcrypt')

const DuplicateError = require('../CustomErrors/DuplicateError');
const NotFoundError = require('../CustomErrors/SystemError');
const Customer = require('../models/customer');


// Função para verificar se o usuário já existe no banco de dados
const checkExistingCustomer = async (customer) => {
    try {
        const sql = 'SELECT * FROM customers WHERE cpfCnpj = ?';
        const [query] = await connection.execute(sql, [customer.cpfCnpj]);
        return query.length !== 0;
    } catch (error) {
        throw new Error('Erro ao verificar existência do usuário');
    }
};

// Buscar todos os usuários
const getAllCustomers = async () => {
    try {
        const sql = 'SELECT * FROM customers';
        const [rows] = await connection.execute(sql);
        return rows.map(row => new Customer(
            row.id,
            row.name,
            row.email,
            row.cpfCnpj,
            row.personType,
            row.password,
            row.asaasId
        ));
    } catch (error) {
        throw new Error('Erro ao buscar usuários');
    }
};

// Buscar um único usuário
const getCustomer = async (customerId) => {
    try {
        const sql = 'SELECT * FROM customers WHERE id = ?';
        const [rows] = await connection.execute(sql, [customerId]);
        // Verifique se o usuário foi encontrado
        if (rows.length === 0) {
            throw new NotFoundError('Usuário não encontrado');
        }

        const customerData = (rows[0])
        return new Customer(
            customerData.id,
            customerData.name,
            customerData.email,
            customerData.cpfCnpj,
            customerData.personType,
            customerData.password,
            customerData.asaasId
        )
    } catch (error) {
        if (error instanceof NotFoundError) {
            throw error;
        }
        throw new Error('Erro ao buscar usuário');
    }
};

// Cadastrar usuário
const createNewCustomer = async (customer) => {

    try {
        const existingUser = await checkExistingCustomer(customer);
        if (existingUser) {
            throw new DuplicateError("Já existe um usuário com este CPF ou CNPJ cadastrado");
        }

        // Hash da senha antes de armazenar no banco de dados
        const hashPassword = await bcrypt.hash(customer.password, 10);

        const sql = 'INSERT INTO customers (name, email, cpfCnpj, personType, password, asaasId) VALUES (?, ?, ?, ?, ?, ?)'
        connection.execute(sql, [customer.name, customer.email, customer.cpfCnpj, customer.personType, hashPassword, customer.asaasId]);
    } catch (error) {
        if (error instanceof DuplicateError) {
            throw error;
        }
        throw new Error('Erro ao cadastrar usuário')
    }
}

// Atualizar usuário
const updateCustomer = async (customer) => {

    try {

        // Hash da senha antes de armazenar no banco de dados
        const hashPassword = await bcrypt.hash(customer.password, 10);

        const sql = 'UPDATE customers SET name = ?, email = ?, cpfCnpj = ?, personType = ?, password = ?, asaasId = ? WHERE id = ?'
        const [ResultSetHeader] = await connection.execute(sql, [customer.name, customer.email, customer.cpfCnpj, customer.personType, hashPassword, customer.asaasId, customer.id])

        if (ResultSetHeader.changedRows === 0) {
            throw new NotFoundError('Usuário não encontrado');
        }

    } catch (error) {
        if (error instanceof NotFoundError) {
            throw error;
        }
        throw new Error('Erro ao buscar usuário');
    }
}

// Deletar Usuário
const deleteCustomer = async (customerId) => {

    try {
        const sql = 'DELETE FROM customers WHERE id = ?'
        const [ResultSetHeader] = await connection.execute(sql, [customerId])

        if (ResultSetHeader.affectedRows === 0) {
            throw new NotFoundError('Usuário não encontrado');
        }

    } catch (error) {
        if (error instanceof NotFoundError) {
            throw error;
        }
        throw new Error('Erro ao buscar usuário');
    }
}

module.exports = { getAllCustomers, getCustomer, createNewCustomer, updateCustomer, deleteCustomer };
