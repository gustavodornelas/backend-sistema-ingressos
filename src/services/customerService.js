const bcrypt = require('bcrypt')

const Customer = require('../models/Customer')
const dbPool = require('../config/dbPool')

// Custom errors
const NoContentError = require('../CustomErrors/NoContentError')
const UnauthorizedError = require('../CustomErrors/UnauthorizedError')
const DuplicateError = require('../CustomErrors/DuplicateError')
const NotFoundError = require('../CustomErrors/SystemError')

// Função para verificar se o cliente já existe no banco de dados
const checkExistingCustomer = async (customer) => {

    let connection = null

    try {
        connection = await dbPool.getConnection()

        const sql = 'SELECT * FROM customers WHERE cpf_cnpj = ?'
        const [query] = await connection.execute(sql, [customer.cpfCnpj])
        return query.length !== 0
    } catch (error) {
        console.log(error)
        throw new Error('Erro ao verificar existência do cliente')
    } finally {
        if (connection) {
            connection.release()
        }
    }
}

// Buscar todos os clientes
const getAllCustomers = async () => {

    let connection = null

    try {
        connection = await dbPool.getConnection()

        const sql = 'SELECT * FROM customers'
        const [rows] = await connection.execute(sql)

        // Verificando se algum cliente foi encontrado
        if (rows.length === 0 ) {
            throw new NotFoundError('Nenhum cliente encontrado')
        }

        return rows.map(row => new Customer(
            row.id,
            row.name,
            row.email,
            row.phone,
            row.mobile_phone,
            row.cpf_cnpj,
            row.person_type,
            undefined, // Ocultando o campo de senha
            row.asaas_id,
            row.created_at
        ))
    } catch (error) {
        console.log(error)
        if(error instanceof NotFoundError) {
            throw error
        }
        throw new Error('Erro ao buscar clientes')
    }finally {
        if (connection) {
            connection.release()
        }
    }
}

// Buscar um único cliente
const getCustomer = async (customerId) => {

    let connection = null

    try {
        connection = await dbPool.getConnection()

        const sql = 'SELECT * FROM customers WHERE id = ?'
        const [rows] = await connection.execute(sql, [customerId])
        
        // Verifique se o cliente foi encontrado
        if (rows.length === 0) {
            throw new NotFoundError('Cliente não encontrado')
        }

        const row = (rows[0])
        return new Customer(
            row.id,
            row.name,
            row.email,
            row.phone,
            row.mobile_phone,
            row.cpf_cnpj,
            row.person_type,
            undefined, // Ocultando o campo de senha
            row.asaas_id,
            row.created_at
        )
    } catch (error) {
        console.log(error)
        if (error instanceof NotFoundError) {
            throw error
        }
        throw new Error('Erro ao buscar cliente')
    }finally {
        if (connection) {
            connection.release()
        }
    }
}

// Cadastrar cliente
const createNewCustomer = async (customer) => {

    let connection = null

    try {
        connection = await dbPool.getConnection()

        const existingCustomer = await checkExistingCustomer(customer)
        if (existingCustomer) {
            throw new DuplicateError("Já existe um cliente com este CPF ou CNPJ cadastrado")
        }

        // Hash da senha antes de armazenar no banco de dados
        const hashPassword = await bcrypt.hash(customer.password, 10)
        const sqlInsert = 'INSERT INTO customers (name, email, phone, mobile_phone, cpf_cnpj, person_type, password, asaas_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
        const [insertResult] = await connection.execute(sqlInsert, [customer.name, 
                                 customer.email,
                                 customer.phone,
                                 customer.mobilePhone,
                                 customer.cpfCnpj,
                                 customer.personType,
                                 hashPassword,
                                 customer.asaasId
                                ])
        
        // Recupera o usuário criado no banco de dados
        const newCustomerId = insertResult.insertId
        const sqlSelect = 'SELECT * FROM customers WHERE id = ?'
        const [rows] = await connection.execute(sqlSelect, [newCustomerId])

        if (rows.length > 0) {
            return new Customer(
                rows[0].id,
                rows[0].name,
                rows[0].email,
                rows[0].phone,
                rows[0].mobile_phone,
                rows[0].cpf_cnpj,
                rows[0].person_type,
                undefined,
                rows[0].asaas_id,
                rows[0].created_at
            )  // Retorna o pagamento criado
        } else {
            throw new Error('Erro ao recuperar o usuário criado')
        }
    } catch (error) {
        console.log(error)
        if (error instanceof DuplicateError) {
            throw error
        }
        throw new Error('Erro ao cadastrar cliente')
    } finally {
        if (connection) {
            connection.release()
        }
    }
}

// Atualizar cliente
const updateCustomer = async (customer) => {

    let connection = null

    try {
        connection = await dbPool.getConnection()

        const updateSql = 'UPDATE customers SET name = ?, email = ?, phone = ?, mobile_phone = ?, cpf_cnpj = ?, person_type = ? WHERE id = ?'
        const [ ResultSetHeader ] = await connection.execute(updateSql, [customer.name,
                                                                   customer.email,
                                                                   customer.phone,
                                                                   customer.mobilePhone,
                                                                   customer.cpfCnpj,
                                                                   customer.personType,
                                                                   customer.id
                                                                ])

        if (ResultSetHeader.changedRows === 0) {
            if (ResultSetHeader.affectedRows === 1) {
                throw new NoContentError('Cliente atualizado sem alterações')
            }
            throw new NotFoundError('Cliente não encontrado')
        }

        // Recupera o usuário atualizado no banco de dados
        const sqlSelect = 'SELECT * FROM customers WHERE id = ?'
        const [rows] = await connection.execute(sqlSelect, [customer.id])

        if (rows.length > 0) {
            return new Customer(
                rows[0].id,
                rows[0].name,
                rows[0].email,
                rows[0].phone,
                rows[0].mobile_phone,
                rows[0].cpf_cnpj,
                rows[0].person_type,
                undefined,
                rows[0].asaas_id,
                rows[0].created_at
            )  // Retorna o usuário atualizado
        } else {
            throw new Error('Erro ao recuperar o usuário atualizado')
        }


    } catch (error) {
        console.log(error)
        if (error instanceof NotFoundError || NoContentError) {
            throw error
        }
        throw new Error('Erro ao buscar cliente')
    } finally {
        if (connection) {
            connection.release()
        }
    }
}

// Atualizar senha do cliente
const changePassword = async (customer, newPassword) => {

    let connection = null

    try {
        connection = await dbPool.getConnection()

        // Consulte o banco de dados para obter o cliente
        let sql = 'SELECT password FROM customers WHERE id = ?'
        const [rows] = await connection.execute(sql, [customer.id])

        // Verifique se foi encontrado algum cliente
        if (rows.length === 0) {
            throw new UnauthorizedError('Cliente não encontrado')
        }

        // Os dados estão no primeiro elemento do array rows
        const row = (rows[0])

        // Verificar se o cliente digitou a senha antiga correta
        const passwordVerify = await bcrypt.compare(customer.password, row.password)
        if (!passwordVerify) {
            throw new UnauthorizedError('Credenciais inválidas')
        }

        // Hash da senha antes de armazenar no banco de dados
        const hashPassword = await bcrypt.hash(newPassword, 10)

        //Atualizando a senha do cliente
        sql = 'UPDATE customers SET password = ? WHERE id = ?'
        const [ResultSetHeader] = await connection.execute(sql, [hashPassword, customer.id])

        if (ResultSetHeader.affectedRows === 0) {
            throw new NotFoundError('Cliente não encontrado')
        }

    } catch (error) {
        console.log(error)
        if (error instanceof NotFoundError || UnauthorizedError) {
            throw error
        }
        throw new Error('Erro ao buscar cliente')
    } finally {
        if (connection) {
            connection.release()
        }
    }
}

// Deletar cliente
const deleteCustomer = async (id) => {

    let connection = null

    try {
        connection = await dbPool.getConnection()

        await connection.beginTransaction()

        // Deletar os tokens do cliente
        let sql = 'DELETE FROM tokens WHERE customer_id = ?'
        await connection.execute(sql, [id])

        // Deletar o cliente
        sql = 'DELETE FROM customers WHERE id = ?'
        const [ResultSetHeader] = await connection.execute(sql, [id])

        if (ResultSetHeader.affectedRows === 0) {
            // Reverter a transação se o cliente não for encontrado
            throw new NotFoundError('Cliente não encontrado')
        }

        // Confirmar a transação
        await connection.commit()

    } catch (error) {
        console.log(error)
        await connection.rollback()
        if (error instanceof NotFoundError) {
            throw error
        }
        throw new Error('Erro ao buscar cliente')
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
                }
