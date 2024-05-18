const express = require('express')

// Classe Customer e serviço para logica
const Customer = require('../models/customer');
const customerService = require('../services/customerService');

// Erros customizados
const NotFoundError = require('../CustomErrors/SystemError');
const DuplicateError = require('../CustomErrors/DuplicateError');

const router = express.Router()

// Buscar todos os usuários
router.get('/', async (req, res) => {

    try {
        const data = await customerService.getAllCustomers()
        res.json({ message: "Consulta concluida", customers: { data } })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
});

// Busca um único usuário
router.get('/:id', async (req, res) => {

    const customerId = req.params.id;

    try {
        const data = await customerService.getCustomer(customerId);
        res.json({ message: "Consulta concluida", customer: { data } })
    } catch (err) {
        if (err instanceof NotFoundError) {
            res.status(404).json({ message: err.message });
        } else {
            res.status(500).json({ message: err.message });
        }
    }
});


// Cadastra um usuário
router.post('/', async (req, res) => {

    const customer = new Customer(
        null,
        req.body.name,
        req.body.email,
        req.body.cpfCnpj,
        req.body.personType,
        req.body.password,
        req.body.asaasId);
    try {
        await customerService.createNewCustomer(customer);
        res.json({ message: "Cadastro conluido com sucesso!" })
    } catch (err) {
        if (err instanceof DuplicateError) {
            res.status(409).json({ message: err.message });
        } else {
            res.status(500).json({ message: err.message });
        }
    }
});

// Altera um usuário
router.put('/:id', async (req, res) => {

    const customer = new Customer(
        req.params.id,
        req.body.name,
        req.body.email,
        req.body.cpfCnpj,
        req.body.personType,
        req.body.password,
        req.body.asaasId);
    
    try {
        await customerService.updateCustomer(customer);
        res.status(200).send({ message: 'Usuário atualizado com sucesso' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }

});

// Deleta um usuário
router.delete('/:id', async (req, res) => {
    const id = req.params.id;

    try {
        await customerService.deleteCustomer(id);
        res.json({ message: 'Usuário deletado com sucesso' });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;