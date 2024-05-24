const DuplicateError = require('../CustomErrors/DuplicateError')
const NoContentError = require('../CustomErrors/NoContentError')
const NotFoundError = require('../CustomErrors/NotFoundError')

const dbPool = require('../config/dbPool')
const CustomerAddress = require('../models/CustomerAddress')

// Função para verificar se o usuário já existe no banco de dados
const checkExistingCustomerAddress = async (customerAddress) => {
    let connection = null
    try {
        connection = await dbPool.getConnection()

        const sql = 'SELECT * FROM customers_address WHERE customer_id = ? and postal_code = ? and address_number = ?'
        const [query] = await connection.execute(sql, [customerAddress.customerId,
        customerAddress.postalCode,
        customerAddress.addressNumber
        ])
        return query.length !== 0
    } catch (error) {
        console.log(error)
        throw new Error('Erro ao verificar existência do endereço')
    } finally {
        if (connection) {
            connection.release()
        }
    }
}

// Buscar todos os endereços
const getAllCustomersAddress = async () => {
    let connection = null

    try {
        connection = await dbPool.getConnection()

        const sql = 'SELECT * FROM customers_address'
        const [rows] = await connection.execute(sql)

        // Verificar se algum endereço foi encontrado
        if (rows.length === 0) {
            throw new NotFoundError('Nenhum endereço encontrado');
        }

        return rows.map(row => new CustomerAddress(
            row.id,
            row.customer_id,
            row.name,
            row.address,
            row.address_number,
            row.complement,
            row.province,
            row.city,
            row.state,
            row.postal_code,
            row.default_address,
            row.created_at
        ))
    } catch (error) {
        console.log(error)
        if (error instanceof NotFoundError) {
            throw error
        }
        throw new Error('Erro ao buscar endereços')
    } finally {
        if (connection) {
            connection.release()
        }
    }
}

// Buscar todos os endereços de um cliente
const getAllAddressToCustomer = async (customerId) => {
    let connection = null

    try {
        connection = await dbPool.getConnection()

        const sql = 'SELECT * FROM customers_address WHERE customer_id = ?'
        const [rows] = await connection.execute(sql, [customerId])

        // Verificar se algum endereço foi encontrado
        if (rows.length === 0) {
            throw new NotFoundError('Nenhum endereço encontrado');
        }

        return rows.map(row => new CustomerAddress(
            row.id,
            row.customer_id,
            row.name,
            row.address,
            row.address_number,
            row.complement,
            row.province,
            row.city,
            row.state,
            row.postal_code,
            row.default_address,
            row.created_at
        ))
    } catch (error) {
        console.log(error)
        if (error instanceof NotFoundError) {
            throw error
        }
        throw new Error('Erro ao buscar endereços')
    } finally {
        if (connection) {
            connection.release()
        }
    }
}

// Buscar o endereço padrão do cliente
const getDefaultCustomerAddress = async (customerId) => {
    let connection = null

    try {
        connection = await dbPool.getConnection()

        const sql = 'SELECT * FROM customers_address WHERE customer_id = ? and default_address = "Y" '
        const [rows] = await connection.execute(sql, [customerId])

        // Verificar se algum endereço foi encontrado
        if (rows.length === 0) {
            throw new NotFoundError('Nenhum endereço encontrado');
        }

        return new CustomerAddress(
            rows[0].id,
            rows[0].customer_id,
            rows[0].name,
            rows[0].address,
            rows[0].address_number,
            rows[0].complement,
            rows[0].province,
            rows[0].city,
            rows[0].state,
            rows[0].postal_code,
            rows[0].default_address,
            rows[0].created_at
        )
    } catch (error) {
        console.log(error)
        if (error instanceof NoContentError) {
            throw error
        }
        throw new Error('Erro ao buscar endereços')
    } finally {
        if (connection) {
            connection.release()
        }
    }
}

// Cadastrar um novo endereço
const createNewCustomerAddress = async (customerAddress) => {
    let connection = null

    try {
        connection = await dbPool.getConnection()
        await connection.beginTransaction()

        // Consulte o banco de dados para obter o usuário
        const sqlSelect1 = 'SELECT * FROM customers WHERE id = ?'
        let [rows] = await connection.execute(sqlSelect1, [customerAddress.customerId])

        // Verifique se foi encontrado algum usuário
        if (rows.length === 0) {
            throw new NotFoundError('Usuário não encontrado')
        }

        // Verificando se o endereço do usuário existe
        const existingCustomerAddress = await checkExistingCustomerAddress(customerAddress)
        if (existingCustomerAddress) {
            throw new DuplicateError("Endereço já cadastradado para o usuário")
        }

        // Verificando se o novo endereço é o padrão do cliente
        if (customerAddress.defaultAddress == 'Y') {
            const sqlUpdate = 'UPDATE customers_address SET default_address = "" WHERE customer_id = ?'
            await connection.execute(sqlUpdate, [customerAddress.customerId])
        }

        const sqlInsert = 'INSERT INTO customers_address (customer_id, name, address, address_number, complement, province, city, state, postal_code, default_address) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
        const [insertResult] = await connection.execute(sqlInsert, [customerAddress.customerId,
                                                                    customerAddress.name,
                                                                    customerAddress.address,
                                                                    customerAddress.addressNumber,
                                                                    customerAddress.complement,
                                                                    customerAddress.province,
                                                                    customerAddress.city,
                                                                    customerAddress.state,
                                                                    customerAddress.postalCode,
                                                                    customerAddress.defaultAddress]
                                                                    )

        const customerId = insertResult.insertId

        const sqlSelect2 = 'SELECT * FROM customers_address WHERE id = ?'
        const [rows2] = await connection.execute(sqlSelect2, [customerId])

        // Verificando se o endereço cadastrado foi recuperado
        if (rows2.length === 0) {
            throw new NotFoundError('Erro ao recuperar o usuário cadastrado')
        }

        await connection.commit()

        return new CustomerAddress(
            rows2[0].id,
            rows2[0].customer_id,
            rows2[0].name,
            rows2[0].address,
            rows2[0].address_number,
            rows2[0].complement,
            rows2[0].province,
            rows2[0].city,
            rows2[0].state,
            rows2[0].postal_code,
            rows2[0].default_address,
            rows2[0].created_at
        )  // Retorna o endereço criado

    } catch (error) {
        console.log(error)
        await connection.rollback()
        if (error instanceof DuplicateError || NotFoundError) {
            throw error
        }
        throw new Error('Erro ao cadastrar endereço')
    } finally {
        if (connection) {
            connection.release()
        }
    }
}

// Atualizar um endereço
const updateCustomerAddress = async (customerAddress) => {
    let connection = null

    try {
        connection = await dbPool.getConnection()
        connection.beginTransaction()

        // Verificando se o novo endereço é o padrão do cliente
        if (customerAddress.defaultAddress == 'Y') {
            const sql = 'UPDATE customers_address SET default_address = "" WHERE customer_id = ?'
            await connection.execute(sql, [customerAddress.customerId])
        }

        // Atualizando endereço
        const sql = 'UPDATE customers_address SET customer_id = ?, name = ?, address = ?, address_number = ?, complement = ?, province = ?, city = ?, state = ?, postal_code = ?, default_address = ? WHERE id = ?'
        const [ResultSetHeader] = await connection.execute(sql, [customerAddress.customerId,
                                                                customerAddress.name,
                                                                customerAddress.address,
                                                                customerAddress.addressNumber,
                                                                customerAddress.complement,
                                                                customerAddress.province,
                                                                customerAddress.city,
                                                                customerAddress.state,
                                                                customerAddress.postalCode,
                                                                customerAddress.defaultAddress,
                                                                customerAddress.id]
        )

        // Verificando se houve alterações
        if (ResultSetHeader.changedRows === 0) {
            if (ResultSetHeader.affectedRows === 1) {
                throw new NoContentError('Local atualizado sem alterações')
            }
            throw new NotFoundError('Local não encontrado')
        }

        const sqlSelect2 = 'SELECT * FROM customers_address WHERE id = ?'
        const [rows2] = await connection.execute(sqlSelect2, [customerAddress.id])

        // Verificando se o endereço atualizado foi recuperado
        if (rows2.length === 0) {
            throw new NotFoundError('Erro ao recuperar o usuário atualizado')
        }

        await connection.commit()

        return new CustomerAddress(
            rows2[0].id,
            rows2[0].customer_id,
            rows2[0].name,
            rows2[0].address,
            rows2[0].address_number,
            rows2[0].complement,
            rows2[0].province,
            rows2[0].city,
            rows2[0].state,
            rows2[0].postal_code,
            rows2[0].default_address,
            rows2[0].created_at
        )  // Retorna o endereço criado

    } catch (error) {
        console.log(error)
        await connection.rollback()
        if (error instanceof NotFoundError || NoContentError) {
            throw error
        }
        throw new Error('Erro ao buscar usuário')
    } finally {
        if (connection) {
            connection.release()
        }
    }
}

// Deletar um endereço
const deleteCustomerAddress = async (customerAddressId) => {
    let connection = null

    try {
        connection = await dbPool.getConnection()

        // Deletando um endereço
        const sql = 'DELETE FROM customers_address WHERE id = ?'
        const [ResultSetHeader] = await connection.execute(sql, [customerAddressId])

        // Verificando se o endereço for alterado
        if (ResultSetHeader.affectedRows === 0) {
            throw new NotFoundError('Endereço não encontrado')
        }

    } catch (error) {
        console.log(error)
        if (error instanceof NotFoundError) {
            throw error
        }
        throw new Error('Erro ao buscar endereço')
    } finally {
        if (connection) {
            connection.release()
        }
    }
}

module.exports = {
    getAllCustomersAddress,
    getAllAddressToCustomer,
    getDefaultCustomerAddress,
    createNewCustomerAddress,
    updateCustomerAddress,
    deleteCustomerAddress
}
