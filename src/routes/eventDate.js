const express = require('express');
const router = express.Router();

const eventDateService = require('../services/eventDateService');
const handleErrorService = require('../utils/handleErrorService');
const EventDate = require('../models/EventDate');
const tokenVerify = require('../utils/tokenVerify');

router.get('/', tokenVerify, async (req, res) => {
    try {
        const data = await eventDateService.getAllEventDates();
        res.json({ message: "Consulta concluída", data });
    } catch (error) {
        handleErrorService(error, res);
    }
});

router.get('/:id', tokenVerify, async (req, res) => {
    const id = req.params.id;

    try {
        const data = await eventDateService.getEventDate(id);
        res.json({ message: "Consulta concluída", data });
    } catch (error) {
        handleErrorService(error, res);
    }
});

router.post('/', tokenVerify, async (req, res) => {
    const eventDate = new EventDate(
        null,
        req.body.eventId,
        req.body.startTime,
        req.body.endTime,
        null
    );

    try {
        const data = await eventDateService.createNewEventDate(eventDate);
        res.json({ message: "Data de evento cadastrada com sucesso", data });
    } catch (error) {
        handleErrorService(error, res);
    }
});

router.put('/', tokenVerify, async (req, res) => {
    const eventDate = new EventDate(
        req.body.id,
        req.body.eventId,
        req.body.startTime,
        req.body.endTime,
        null
    );

    try {
        const data = await eventDateService.updateEventDate(eventDate);
        res.json({ message: "Data de evento atualizada com sucesso", data });
    } catch (error) {
        handleErrorService(error, res);
    }
});

router.delete('/:id', tokenVerify, async (req, res) => {
    const id = req.params.id;

    try {
        await eventDateService.deleteEventDate(id);
        res.json({ message: "Data de evento deletada com sucesso" });
    } catch (error) {
        handleErrorService(error, res);
    }
});

module.exports = router;
