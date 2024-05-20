const express = require('express')

// Classe Customer e serviço para logica
const Customer = require('../models/customer')
const CustomerAddress = require('../models/customerAddress')
const customerAddressService = require('../services/customerAddressService')

// Erros customizados
const handleErrorService = require('../services/handleErrorService')

const router = express.Router()

// Buscar todos os endereços
router.get('/', async (req, res) => {

    try {
        const data = await customerAddressService.getAllCustomersAddress()
        res.json({ message: "Consulta concluida", data })
    } catch (error) {
        handleErrorService(error, res)
    }
})

// Buscar todos os endereços de um usuário
router.get('/:id', async (req, res) => {

    const customerId = req.params.id

    try {
        const data = await customerAddressService.getAllAddressToCustomer(customerId)
        res.json({ message: "Consulta concluida", data })
    } catch (error) {
        handleErrorService(error, res)
    }
})

// buscar o endereço padrão do usuário
router.get('/default/:id', async (req, res) => {

    const customerId = req.params.id

    try {
        const data = await customerAddressService.getDefaultCustomerAddress(customerId)
        res.json({ message: "Consulta concluida", data })
    } catch (error) {
        handleErrorService(error, res)
    }

})

// Cadastrar um novo endereço
router.post('/', async (req, res) => {

    const customerAddress = new CustomerAddress(
        null,
        req.body.customerId,
        req.body.name,
        req.body.address,
        req.body.addressNumber,
        req.body.city,
        req.body.state,
        req.body.zipCode,
        req.body.defaultAddress
    )

    try {
        const data = await customerAddressService.createNewCustomerAddress(customerAddress)
        res.json({ message: 'Endereço cadastrado com sucesso' })
    } catch (error) {
        handleErrorService(error, res)
    }
})

// Alterar um endereo
router.put('/', async (req, res) => {

    const customerAddress = new CustomerAddress(
        req.body.id,
        req.body.customerId,
        req.body.name,
        req.body.address,
        req.body.addressNumber,
        req.body.city,
        req.body.state,
        req.body.zipCode,
        req.body.defaultAddress
    )

    try {
        await customerAddressService.updateCustomerAddress(customerAddress)
        res.status(200).send({ message: 'Endereço atualizado com sucesso' })
    } catch (error) {
        handleErrorService(error, res)
    }

})

// Deletar um usuário
router.delete('/:id', async (req, res) => {
    const id = req.params.id

    try {
        await customerAddressService.deleteCustomerAddress(id)
        res.json({ message: 'Endereço deletado com sucesso' })

    } catch (error) {
        handleErrorService(error, res)
    }
})

module.exports = router