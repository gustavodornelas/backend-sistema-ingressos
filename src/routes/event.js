const express = require('express')
const router = express.Router()

const eventService = require('../services/eventService')
const handleErrorService = require('../utils/handleErrorService')
const Event = require('../models/Event')
const tokenVerify = require('../utils/tokenVerify')

router.get('/', tokenVerify, async (req, res) => {
    try {
        const data = await eventService.getAllEvents()
        res.json({ message: "Consulta concluída", data })
    } catch (error) {
        handleErrorService(error, res)
    }
})

router.get('/:id', tokenVerify, async (req, res) => {
    const id = req.params.id

    try {
        const data = await eventService.getEvent(id)
        res.json({ message: "Consulta concluída", data })
    } catch (error) {
        handleErrorService(error, res)
    }
})

router.post('/', tokenVerify, async (req, res) => {
    const event = new Event(
        null,
        req.body.name,
        req.body.description,
        req.body.venueId,
        null,
    )

    try {
        const data = await eventService.createNewEvent(event)
        res.json({ message: "Evento cadastrado com sucesso", data })
    } catch (error) {
        handleErrorService(error, res)
    }
})

router.put('/', tokenVerify, async (req, res) => {
    const event = new Event(
        req.body.id,
        req.body.name,
        req.body.description,
        req.body.venueId,
        null,
    )

    try {
        const data = await eventService.updateEvent(event)
        res.json({ message: "Evento atualizado com sucesso", data })
    } catch (error) {
        handleErrorService(error, res)
    }
})

router.delete('/:id', tokenVerify, async (req, res) => {
    const id = req.params.id

    try {
        await eventService.deleteEvent(id)
        res.json({ message: "Evento deletado com sucesso" })
    } catch (error) {
        handleErrorService(error, res)
    }
})

module.exports = router
