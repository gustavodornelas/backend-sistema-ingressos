const DuplicateError = require('../CustomErrors/DuplicateError');
const NotFoundError = require('../CustomErrors/SystemError');

const dbPool = require('../config/dbPool');

const Customer = require('../models/customer');
const CustomerAddress = require('../models/customerAddress');

// Função para verificar se o usuário já existe no banco de dados
const checkExistingCustomerAddress = async (customerAddress) => {
    let connection = null
    try {
        connection = await dbPool.getConnection()

        const sql = 'SELECT * FROM customers_address WHERE customer_id = ? and zip_code = ? and address_number = ?'
        const [query] = await connection.execute(sql, [customerAddress.customerId, customerAddress.zipCode, customerAddress.addressNumber])
        return query.length !== 0
    } catch (error) {

        console.log(error)

        throw new Error('Erro ao verificar existência do endereço')
    } finally {
        if (connection) {
            connection.release()
        }
    }
};

// Buscar todos os endereços
const getAllCustomersAddress = async () => {
    let connection = null

    try {
        connection = await dbPool.getConnection();

        const sql = 'SELECT * FROM customers_address';
        const [rows] = await connection.execute(sql);
        return rows.map(row => new CustomerAddress(
            row.id,
            row.customer_id,
            row.name,
            row.address,
            row.address_number,
            row.city,
            row.state,
            row.zip_code,
            row.default_address,
            row.created_at
        ));
    } catch (error) {

        console.log(error)

        throw new Error('Erro ao buscar endereços');
    } finally {
        if (connection) {
            connection.release()
        }
    }
};

// Buscar todos os endereços de um usuário
const getAllAddressToCustomer = async (customerId) => {
    let connection = null

    try {
        connection = await dbPool.getConnection();

        const sql = 'SELECT * FROM customers_address WHERE customer_id = ?';
        const [rows] = await connection.execute(sql, [customerId]);
        return rows.map(row => new CustomerAddress(
            row.id,
            row.customer_id,
            row.name,
            row.address,
            row.address_number,
            row.city,
            row.state,
            row.zip_code,
            row.default_address,
            row.created_at
        ));
    } catch (error) {
        throw new Error('Erro ao buscar endereços');
    } finally {
        if (connection) {
            connection.release()
        }
    }
};

// Buscar um único endereço
const getDefaultCustomerAddress = async (customerId) => {
    let connection = null

    try {
        connection = await dbPool.getConnection();

        const sql = 'SELECT * FROM customers_address WHERE customer_id = ? and default_address = "Y" ';
        const [rows] = await connection.execute(sql, [customerId]);
        return rows.map(row => new CustomerAddress(
            row.id,
            row.customer_id,
            row.name,
            row.address,
            row.address_number,
            row.city,
            row.state,
            row.zip_code,
            row.default_address,
            row.created_at
        ));
    } catch (error) {

        console.log(error)

        throw new Error('Erro ao buscar endereços');
    } finally {
        if (connection) {
            connection.release()
        }
    }
};

// Cadastrar um novo endereço
const createNewCustomerAddress = async (customerAddress) => {
    let connection = null

    try {
        connection = await dbPool.getConnection()
        await connection.beginTransaction()
        
        // Consulte o banco de dados para obter o usuário
        let sql = 'SELECT * FROM customers WHERE id = ?'
        const [rows] = await connection.execute(sql, [customerAddress.customerId])
                
        // Verifique se foi encontrado algum usuário
        if (rows.length === 0) {
            throw new NotFoundError('Usuário não encontrado')
        }

        const existingCustomerAddress = await checkExistingCustomerAddress(customerAddress)
        if (existingCustomerAddress) {
            throw new DuplicateError("Endereço já cadastradado para o usuário")
        }

        if (customerAddress.defaultAddress == 'Y') {
            const sql = 'UPDATE customers_address SET default_address = null WHERE customer_id = ?'
            let data = await connection.execute(sql, [customerAddress.customerId])
        }

        sql = 'INSERT INTO customers_address (customer_id, name, address, address_number, city, state, zip_code, default_address) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
        await connection.execute(sql, [customerAddress.customerId, 
                                       customerAddress.name,
                                       customerAddress.address,
                                       customerAddress.addressNumber,
                                       customerAddress.city,
                                       customerAddress.state,
                                       customerAddress.zipCode,
                                       customerAddress.defaultAddress]
                                    );
        
        

        await connection.commit()

    } catch (error) {

        console.log(error)
        await connection.rollback()

        if (error instanceof DuplicateError || NotFoundError) {
            throw error;
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

        if (customerAddress.defaultAddress == 'Y') {
            const sql = 'UPDATE customers_address SET default_address = null WHERE customer_id = ?'
            let data = await connection.execute(sql, [customerAddress.customerId])
        }

        const sql = 'UPDATE customers_address SET customer_id = ?, name = ?, address = ?, address_number = ?, city = ?, state = ?, zip_code = ?, default_address = ? WHERE id = ?'
        const [ResultSetHeader] = await connection.execute(sql, [customerAddress.customerId, 
                                                                 customerAddress.name, 
                                                                 customerAddress.address, 
                                                                 customerAddress.addressNumber, 
                                                                 customerAddress.city, 
                                                                 customerAddress.state, 
                                                                 customerAddress.zipCode, 
                                                                 customerAddress.defaultAddress, 
                                                                 customerAddress.id]
                                                                )

        if (ResultSetHeader.changedRows === 0) {
            throw new NotFoundError('Usuário não encontrado');
        }

        
        connection.commit()

    } catch (error) {
        
        console.log(error)
        await connection.rollback()

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

// Deletar um endereço
const deleteCustomerAddress = async (customerAddressId) => {
    let connection = null

    try {
        connection = await dbPool.getConnection();

        const sql = 'DELETE FROM customers_address WHERE id = ?'
        const [ResultSetHeader] = await connection.execute(sql, [customerAddressId])

        if (ResultSetHeader.affectedRows === 0) {
            throw new NotFoundError('Endereço não encontrado');
        }

    } catch (error) {

        console.log(error)

        if (error instanceof NotFoundError) {
            throw error;
        }
        throw new Error('Erro ao buscar endereço');
    } finally {
        if (connection) {
            connection.release()
        }
    }
}

module.exports = { getAllCustomersAddress, 
                   getAllAddressToCustomer, 
                   getDefaultCustomerAddress,
                   createNewCustomerAddress,
                   updateCustomerAddress,
                   deleteCustomerAddress
                };
