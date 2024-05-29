const express = require('express')
const router = express.Router()

const cartService = require('../services/cartService')
const handleErrorService = require('../utils/handleErrorService')
const tokenVerify = require('../utils/tokenVerify')

// Consulta todos os itens do carrinho de um cliente
router.get('/', tokenVerify, async (req, res) => {
    const { customerId } = req.body

    try {
        const data = await cartService.getAllCartItems(customerId)
        res.json({ message: "Itens do carrinho recuperados com sucesso", data })
    } catch (error) {
        handleErrorService(error, res)
    }
})

// Consulta um unico item do Carrinho
router.get('/:id', tokenVerify, async (req, res) => {
    const id = req.params.id

    try {
        const data = await cartService.getCartItemById(id)
        res.json({ message: "Item do carrinho recuperado com sucesso", data })
    } catch (error) {
        handleErrorService(error, res)
    }
})

// Adiciona um item ao carrinho do cliente
router.post('/', tokenVerify, async (req, res) => {
    const { customerId, ticketBatchId, quantity } = req.body

    try {
        const data = await cartService.addItemToCart(customerId, ticketBatchId, quantity)
        res.json({ message: "Item adicionado ao carrinho com sucesso", data })
    } catch (error) {
        handleErrorService(error, res)
    }
})

// Altera um item do carrinho do cliente
router.put('/', tokenVerify, async (req, res) => {
    const { customerId, ticketBatchId, quantity } = req.body

    try {
        const data = await cartService.updateCartItem(customerId, ticketBatchId, quantity)
        res.json({ message: "Item atualizado no carrinho com sucesso", data })
    } catch (error) {
        handleErrorService(error, res)
    }
})

// Deleta um item do carrinho do cliente
router.delete('/', tokenVerify, async (req, res) => {
    const { customerId, ticketBatchId } = req.body

    try {
        const data = await cartService.removeItemFromCart(customerId, ticketBatchId)
        res.json({ message: "Item removido do carrinho com sucesso", data })
    } catch (error) {
        handleErrorService(error, res)
    }
})

// Esvazia o carrinho do cliente
router.delete('/empty', tokenVerify, async (req, res) => {
    const { customerId } = req.body

    try {
        const data = await cartService.emptyCart(customerId)
        res.json({ message: "Carrinho esvaziado com sucesso", data })
    } catch (error) {
        handleErrorService(error, res)
    }
})

module.exports = router
