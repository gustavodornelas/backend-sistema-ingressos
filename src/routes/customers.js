const express = require('express')

// Classe Customer e serviço para logica
const Customer = require('../models/Customer')
const customerService = require('../services/customerService')
const asaasService = require('../services/asaasService')

// Erros customizados
const NotFoundError = require('../CustomErrors/NotFoundError')
const DuplicateError = require('../CustomErrors/DuplicateError')
const handleErrorService = require('../utils/handleErrorService')
const tokenVerify = require('../utils/tokenVerify')

const router = express.Router()

// Buscar todos os usuários
router.get('/', tokenVerify, async (req, res) => {

    try {
        const data = await customerService.getAllCustomers()
        res.json({ message: "Consulta concluida", data })
    } catch (error) {
        handleErrorService(error, res)
    }
})

// Busca um único usuário
router.get('/:id', tokenVerify, async (req, res) => {

    const customerId = req.params.id

    try {
        const data = await customerService.getCustomer(customerId)
        res.json({ message: "Consulta concluida", data })
    } catch (error) {
        handleErrorService(error, res)
    }
})


// Cadastra um usuário
router.post('/', async (req, res) => {

    const customer = new Customer(
        null,
        req.body.name,
        req.body.email,
        req.body.phone,
        req.body.mobilePhone,
        req.body.cpfCnpj,
        req.body.personType,
        req.body.password,
        null,
        null)

    try {

        // Criando cliente no asaas e armazenando o ID do cliente asaas
        const asaasCustomer = await asaasService.createCustomer(customer)
        customer.asaasId = asaasCustomer.id

        // Criando cliente no banco de dados
        const data = await customerService.createNewCustomer(customer)
        res.json({ message: 'Usuário cadastrado com sucesso', data })
    } catch (error) {
        handleErrorService(error, res)
    }
})

// Altera um usuário
router.put('/', tokenVerify, async (req, res) => {

    const customer = new Customer(
        req.body.id,
        req.body.name,
        req.body.email,
        req.body.phone,
        req.body.mobilePhone,
        req.body.cpfCnpj,
        req.body.personType,
        null,
        req.body.asaasId)

    try {

        // atualizando cliente no asaas
        await asaasService.updateCustomer(customer)
        
        // Atualizando cliente no banco de dados
        const data = await customerService.updateCustomer(customer)
        res.json({ message: 'Usuário atualizado com sucesso', data })
    } catch (error) {
        handleErrorService(error, res)
    }

})

// Deleta um usuário
router.delete('/:id', tokenVerify, async (req, res) => {
    const id = req.params.id

    try {
        await customerService.deleteCustomer(id)
        res.json({ message: 'Usuário deletado com sucesso' })

    } catch (error) {
        handleErrorService(error, res)
    }
})

// Alterar senha do usuário
router.put('/changePassword', tokenVerify, async (req, res) => {

    try {
        const customer = new Customer(
            req.body.customer.id,
            req.body.customer.name,
            req.body.customer.email,
            req.body.phone,
            req.body.mobilePhone,
            req.body.customer.cpfCnpj,
            req.body.customer.personType,
            req.body.customer.password,
            req.body.customer.asaasId)

        const newPassword = req.body.newPassword

        await customerService.changePassword(customer, newPassword)
        res.json({ message: 'Senha alterada com sucesso' })
    } catch (error) {
        handleErrorService(error, res)
    }
})

module.exports = router
