const express = require('express');
const router = express.Router();
const ticketBatchService = require('../services/ticketBatchService');
const handleErrorService = require('../utils/handleErrorService');
const tokenVerify = require('../utils/tokenVerify');
const TicketBatch = require('../models/TicketBatch');

router.get('/', tokenVerify, async (req, res) => {
    try {
        const data = await ticketBatchService.getAllTicketBatches();
        res.json({ message: "Consulta concluída", data });
    } catch (error) {
        handleErrorService(error, res);
    }
});

router.get('/:id', tokenVerify, async (req, res) => {
    const id = req.params.id;

    try {
        const data = await ticketBatchService.getTicketBatch(id);
        res.json({ message: "Consulta concluída", data });
    } catch (error) {
        handleErrorService(error, res);
    }
});

router.get('/event/:id', tokenVerify, async (req, res) => {
    const id = req.params.id;

    try {
        const data = await ticketBatchService.getAllEventTicketBatches(id);
        res.json({ message: "Consulta concluída", data });
    } catch (error) {
        handleErrorService(error, res);
    }
});


router.post('/', tokenVerify, async (req, res) => {
    const ticketBatch = new TicketBatch(
        null,
        req.body.eventId,
        req.body.singleDateBatch,
        req.body.eventDateId,
        req.body.batchName,
        req.body.quantity,
        req.body.availableQuantity ? req.body.availableQuantity: req.body.quantity,
        req.body.price,
        req.body.batchDate,
        req.body.status
    );

    try {
        const data = await ticketBatchService.createNewTicketBatch(ticketBatch);
        res.json({ message: "Lote de ingressos cadastrado com sucesso", data });
    } catch (error) {
        handleErrorService(error, res);
    }
});

router.put('/', tokenVerify, async (req, res) => {
    const ticketBatch = new TicketBatch(
        req.body.id,
        req.body.eventId,
        req.body.singleDateBatch,
        req.body.eventDateId,
        req.body.batchName,
        req.body.quantity,
        req.body.availableQuantity,
        req.body.price,
        req.body.batchDate,
        req.body.status,
        req.body.createdAt
    );

    try {
        const data = await ticketBatchService.updateTicketBatch(ticketBatch);
        res.json({ message: "Lote de ingressos atualizado com sucesso", data });
    } catch (error) {
        handleErrorService(error, res);
    }
});

router.delete('/:id', tokenVerify, async (req, res) => {
    const id = req.params.id;

    try {
        await ticketBatchService.deleteTicketBatch(id);
        res.json({ message: "Lote de ingressos deletado com sucesso" });
    } catch (error) {
        handleErrorService(error, res);
    }
});

module.exports = router;
