const express = require('express')
const router = express.Router()

const authenticationService = require('../services/authenticationService')

const Customer = require('../models/Customer')
const handleErrorService = require('../services/handleErrorService')

// Rota para login
router.post('/login', async (req, res) => {

    const { email, password } = req.body

    try {
        const data = await authenticationService.login(email, password)
        res.json({ message: 'Usuário logado com sucesso', data })
    } catch (error) {
        handleErrorService(error, res)
    }
})

// Rota para logout
router.put('/logout', async (req, res) => {
    const { token, customer } = req.body
    const customerData = new Customer(
        customer.id,
        customer.name,
        customer.email,
        customer.cpfCnpj,
        customer.personType,
        customer.password,
        customer.asaasId)

    try {
        await authenticationService.logout(customerData, token)
        res.json({ message: 'Logout realizado com sucesso' })
    } catch (error) {
        handleErrorService(error, res)
    }
})

module.exports = router