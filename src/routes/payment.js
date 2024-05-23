const express = require('express')
const handleErrorService = require('../services/handleErrorService')
const router = express.Router()

const paymentService = require('../services/paymentService')
const asaasService = require('../services/asaasService')
const Payment = require('../models/Payment')

router.get('/', async (req, res) => {
    try {
        const data = await paymentService.getAllPayments()
        res.json({message: "Consulta concluida", data})
    } catch (error) {
        handleErrorService(error, res)
    }
})

router.post('/', async (req, res) => {
    try {

        const payment = new Payment(
            null,
            req.body.customerId,
            req.body.asaasCustomerId,
            req.body.eventId,
            null,
            req.body.value,
            req.body.billingType,
            null,
            req.body.dueDate,
            req.body.description,
            null,
            null,
        )

        // Criando pagamento no Asaas e complentando dados de Transação
        const asaasPayment = await asaasService.createPayment(payment)
        payment.importAsaasData(asaasPayment.id, asaasPayment.status, asaasPayment.invoiceUrl)

        // Criando pagamento no Banco de Dados
        const data = await paymentService.createPayment(payment)
        res.json({ message: "Pagamento cadastrado com sucesso", data })
    } catch (error) {
        handleErrorService(error, res)
    }
})

module.exports = router