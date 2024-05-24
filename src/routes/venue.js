const express = require('express')
const router = express.Router()

const venueService = require('../services/venueService')
const handleErrorService = require('../utils/handleErrorService')
const Venue = require('../models/Venue')
const tokenVerify = require('../utils/tokenVerify')

router.get('/', tokenVerify, async (req, res) => {
    try {
        const data = await venueService.getAllVenues()
        res.json({ message: "Consulta concluida", data })
    } catch (error) {
        handleErrorService(error, res)
    }
})

router.get('/:id', tokenVerify, async (req, res) => {
    const id = req.params.id

    try {
        const data = await venueService.getVenue(id)
        res.json({ message: "Consulta concluida", data })
    } catch (error) {
        handleErrorService(error, res)
    }
})

router.post('/', tokenVerify, async (req, res) => {
    const venue = new Venue(
        null,
        req.body.name,
        req.body.address,
        req.body.addressNumber,
        req.body.complement,
        req.body.province,
        req.body.city,
        req.body.state,
        req.body.postalCode,
        req.body.capacity,
        null,
    )

    try {
       const data = await venueService.createNewVenue(venue)
        res.json({ message: "Local cadastrado com sucesso", data })
    } catch (error) {
        handleErrorService(error, res)
    }
})

router.put('/', tokenVerify, async (req, res) => {
    const venue = new Venue(
        req.body.id,
        req.body.name,
        req.body.address,
        req.body.addressNumber,
        req.body.complement,
        req.body.province,
        req.body.city,
        req.body.state,
        req.body.postalCode,
        req.body.capacity,
        null,
    )

    try {
        const data = await venueService.updateVenue(venue)
        res.json({ message: "Local atualizado com sucesso", data })
    } catch (error) {
        handleErrorService(error, res)
    }
})

router.delete('/:id', tokenVerify, async (req, res) => {
    const id = req.params.id

    try {
        await venueService.deleteVenue(id)
        res.json({message: "Local deletado com sucesso"})
    } catch (error) {
        handleErrorService(error, res)
    }
})

module.exports = router
