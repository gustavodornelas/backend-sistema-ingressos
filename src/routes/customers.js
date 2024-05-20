const express = require('express')

// Classe Customer e serviço para logica
const Customer = require('../models/customer')
const customerService = require('../services/customerService')

// Erros customizados
const NotFoundError = require('../CustomErrors/SystemError')
const DuplicateError = require('../CustomErrors/DuplicateError')
const handleErrorService = require('../services/handleErrorService')

const router = express.Router()

// Buscar todos os usuários
router.get('/', async (req, res) => {

    try {
        const data = await customerService.getAllCustomers()
        res.json({ message: "Consulta concluida", data })
    } catch (error) {
        handleErrorService(error, res)
    }
})

// Busca um único usuário
router.get('/:id', async (req, res) => {

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
        req.body.cpfCnpj,
        req.body.personType,
        req.body.password,
        req.body.asaasId)
    try {
        const data = await customerService.createNewCustomer(customer)
        res.json({ message: 'Usuário cadastrado com sucesso' })
    } catch (error) {
        handleErrorService(error, res)
    }
})

// Altera um usuário
router.put('/', async (req, res) => {

    try {

        const customer = new Customer(
            req.body.id,
            req.body.name,
            req.body.email,
            req.body.cpfCnpj,
            req.body.personType,
            req.body.password,
            req.body.asaasId)

        await customerService.updateCustomer(customer)
        res.status(200).send({ message: 'Usuário atualizado com sucesso' })
    } catch (error) {
        handleErrorService(error, res)
    }

})

// Deleta um usuário
router.delete('/:id', async (req, res) => {
    const id = req.params.id

    try {
        await customerService.deleteCustomer(id)
        res.json({ message: 'Usuário deletado com sucesso' })

    } catch (error) {
        handleErrorService(error, res)
    }
})

// Alterar senha do usuário
router.put('/changePassword', async (req, res) => {

    try {
        const customer = new Customer(
            req.body.customer.id,
            req.body.customer.name,
            req.body.customer.email,
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
