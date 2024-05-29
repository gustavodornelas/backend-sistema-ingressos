const express = require('express')
const handleErrorService = require('../utils/handleErrorService')
const router = express.Router()

const tokenVerify = require('../utils/tokenVerify')
const transactionService = require('../services/transactionService')

// Cadastrar um Pedido
router.post('/', tokenVerify, async (req, res) => {
    try {
        const data = await transactionService.createNewOrder(req.body)
        res.json( {message: 'Pedido gerado com sucesso', data} )
    } catch (error) {
        handleErrorService(error, res)
    }

})

module.exports = router