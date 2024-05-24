const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');

const ticketService = require('../services/ticketService');
const handleErrorService = require('../utils/handleErrorService');
const Ticket = require('../models/Ticket');
const tokenVerify = require('../utils/tokenVerify');

router.get('/', tokenVerify, async (req, res) => {
    try {
        const data = await ticketService.getAllTickets();
        res.json({ message: "Consulta concluída", data });
    } catch (error) {
        handleErrorService(error, res);
    }
});

router.get('/:id', tokenVerify, async (req, res) => {
    const id = req.params.id;

    try {
        const data = await ticketService.getTicket(id);
        res.json({ message: "Consulta concluída", data });
    } catch (error) {
        handleErrorService(error, res);
    }
});

router.post('/', tokenVerify, async (req, res) => {
    const ticket = new Ticket(
        null,
        req.body.eventId,
        req.body.eventDateId,
        req.body.customerId,
        req.body.paymentId,
        req.body.purchaseDate,
        req.body.price,
    );

    try {
        console.log(ticket)
        const data = await ticketService.createNewTicket(ticket);
        res.json({ message: "Ingresso cadastrado com sucesso", data });
    } catch (error) {
        handleErrorService(error, res);
    }
});

router.put('/', tokenVerify, async (req, res) => {
    const ticket = new Ticket(
        req.body.id,
        req.body.eventId,
        req.body.eventDateId,
        req.body.customerId,
        req.body.paymentId,
        req.body.purchaseDate,
        req.body.price,
        req.body.qrCode,
        req.body.createdAt
    );

    try {
        const data = await ticketService.updateTicket(ticket);
        res.json({ message: "Ingresso atualizado com sucesso", data });
    } catch (error) {
        handleErrorService(error, res);
    }
});

router.delete('/:id', tokenVerify, async (req, res) => {
    const id = req.params.id;

    try {
        await ticketService.deleteTicket(id);
        res.json({ message: "Ingresso deletado com sucesso" });
    } catch (error) {
        handleErrorService(error, res);
    }
});

module.exports = router;
