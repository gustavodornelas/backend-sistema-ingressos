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
        res.json({ message: "Consulta concluida", customers: { data } })
    } catch (error) {
        handleErrorService(error, res)
    }
})

// Busca um único usuário
router.get('/:id', async (req, res) => {

    const customerId = req.params.id

    try {
        const data = await customerService.getCustomer(customerId)
        res.json({ message: "Consulta concluida", customer: { data } })
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
        await customerService.createNewCustomer(customer)
        res.json({ message: "Cadastro conluido com sucesso!" })
    } catch (error) {
        handleErrorService(error, res)
    }
})

// Altera um usuário
router.put('/:id', async (req, res) => {

    const customer = new Customer(
        req.params.id,
        req.body.name,
        req.body.email,
        req.body.cpfCnpj,
        req.body.personType,
        req.body.password,
        req.body.asaasId)
    
    try {
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

module.exports = router
