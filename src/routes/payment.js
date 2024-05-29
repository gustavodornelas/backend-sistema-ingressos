const express = require('express')
const handleErrorService = require('../utils/handleErrorService')
const router = express.Router()

const paymentService = require('../services/paymentService')
const asaasService = require('../services/asaasService')
const Payment = require('../models/Payment')
const Refund = require('../models/Refund')
const tokenVerify = require('../utils/tokenVerify')

router.get('/', tokenVerify, async (req, res) => {
    try {
        const data = await paymentService.getAllPayments()
        res.json({message: "Consulta concluida", data})
    } catch (error) {
        handleErrorService(error, res)
    }
})

router.get('/:id', tokenVerify, async (req, res) => {
    try {
         
        const id = req.params.id
        const data = await paymentService.getPayment(id)
        res.json({ message: "Consulta concluida", data })
    }catch(error) {
        handleErrorService(error, res)
    }
})

router.post('/', tokenVerify, async (req, res) => {
    try {

        const payment = new Payment(
            null,
            req.body.customerId,
            req.body.eventId,
            null,
            req.body.value,
            req.body.billingType,
            null,
            req.body.dueDate,
            req.body.description,
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

router.post('/refund/:id', tokenVerify, async (req, res) => {

    try {

        // Recuperando pagamento
        const id = req.params.id
        const { payment } = await paymentService.getPayment(id)

        // Gerando estorno no Asaas
        const response = await asaasService.refundPayment(payment)

        // Criando estorno no banco de dados
        const refund = new Refund(
            null,
            payment.id,
            response.status,
            response.value,
            response.dateCreated,
            null
        )

        const data = await paymentService.refundPayment(refund)
        res.json( { message: "Pagamento estornado", data })
    } catch (error) {
        handleErrorService(error, res)
    }

})

module.exports = router