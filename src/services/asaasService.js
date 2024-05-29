const axios = require('axios');
const dbPool = require('../config/dbPool');
const NotFoundError = require('../CustomErrors/NotFoundError');
const AsaasError = require('../CustomErrors/AsaasError');

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
        console.log(error.response.data.errors[0])
        throw new AsaasError(error)
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
        console.log(error.response.data.errors[0])
        throw new AsaasError(error)
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
        if (error instanceof NotFoundError) {
            console.log(error)
            throw error;
        }
        console.log(error.response.data.errors[0])
        throw new AsaasError(error)
    } finally {
        if (connection) {
            connection.release()
        }
    }
}

const refundPayment = async (payment) => {

    const {value, asaasId} = payment

    try {

        const data = {
            value: value,
        }

        const url = '/payments/' + asaasId + '/refund'

        const res = await apiClient.post(url, data)
        return res.data.refunds[0]
    } catch (error) {
        console.log(error.response.data.errors[0])
        throw new AsaasError(error)
    }

}

// Export the functions
module.exports = {
    createCustomer,
    updateCustomer,
    createPayment,
    refundPayment
};
