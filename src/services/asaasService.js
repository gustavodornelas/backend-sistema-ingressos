const axios = require('axios');
const dbPool = require('../config/dbPool');
const NotFoundError = require('../CustomErrors/SystemError');

const API_KEY = '$aact_YTU5YTE0M2M2N2I4MTliNzk0YTI5N2U5MzdjNWZmNDQ6OjAwMDAwMDAwMDAwMDAwODA1MDY6OiRhYWNoXzc5NTc2YmZlLWNjOTgtNDJmYi1hZWJkLTA2OTMwYWM1OTBjMg==$aact_YTU5YTE0M2M2N2I4MTliNzk0YTI5N2U5MzdjNWZmNDQ6OjAwMDAwMDAwMDAwMDAwODA1MDY6OiRhYWNoXzc5NTc2YmZlLWNjOTgtNDJmYi1hZWJkLTA2OTMwYWM1OTBjMg==';
const BASE_URL = 'https://sandbox.asaas.com/api/v3/';

// Criando uma instancia Axios
const apiClient = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        'access_token': API_KEY
    }
});


// Criando um novo cliente no asaas
const createCustomer = async (customerData) => {

    try {
    
        const data = {
            name: customerData.name,
            email: customerData.email,
            phone: customerData.phone,
            mobilePhone: customerData.mobilePhone,
            cpfCnpj: customerData.cpfCnpj,
        }
    
        const res = await apiClient.post('/customers', data);
        return res.data;
    } catch (error) {
        console.error(error);
        throw new Error("Erro ao criar Cliente no Asaas");
    }
}

// Atualizando um cliente no asaas
const updateCustomer = async (customerData) => {

    const data = {
        name: customerData.name,
        email: customerData.email,
        phone: customerData.phone,
        mobilePhone: customerData.mobilePhone,
        cpfCnpj: customerData.cpfCnpj,
    }

    try {

        // Atualizando cliente no asaas
        await apiClient.put('/customers/' + customerData.asaasId, data);
    } catch (error) {
        console.log(error)
        throw new Error("Erro ao atualizar Cliente no Asaas");
    }
}

const createPayment = async (paymentData) => {

    let connection = null

    try {

        connection = await dbPool.getConnection()
        const sql = 'SELECT * FROM customers WHERE id = ?'
        const [rows] = await connection.execute(sql, [paymentData.customerId])

        // Verificar se o usuário foi encontrado
        if (rows.length === 0) {
            throw new NotFoundError('Usuário não encontrado')
        }

        const asaasCustomerId = rows[0].asaas_id

        const data = {
            billingType: paymentData.billingType,
            value: paymentData.value,
            customer: asaasCustomerId,
            dueDate: paymentData.dueDate,
            description: paymentData.description
        }


        const res = await apiClient.post('/payments', data)
        return res.data
    } catch (error) {
        console.log(error)
        if (error instanceof NotFoundError) {
            throw error;
        }
        throw new Error("Erro ao criar Pagamento no Asaas");
    } finally {
        if (connection) {
            connection.release()
        }
    }
}

// Export the functions
module.exports = {
    createCustomer,
    updateCustomer,
    createPayment
};
