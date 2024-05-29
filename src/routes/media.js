const express = require('express');
const upload = require('../config/MulterConfig');
const mediaService = require('../services/mediaService');
const Media = require('../models/Media');
const router = express.Router();
const path = require('path');
const handleErrorService = require('../utils/handleErrorService');
const tokenVerify = require('../utils/tokenVerify');

// Rota para upload de mídia
router.post('/upload', tokenVerify, upload.single('file'), async (req, res) => {
    const { originalname, filename } = req.file; // Use filename para obter o nome do arquivo salvo pelo multer
    const { eventId, type } = req.body;

    // Construir o caminho relativo incluindo o ID do evento
    const relativePath = path.join('uploads', eventId, filename);

    try {
        const media = new Media(
            null,
            originalname,
            relativePath,
            eventId,
            type
        );
        const data = await mediaService.saveMedia(media);
        
        res.json({ message: 'Upload realizado com sucesso', data });
    } catch (error) {
        handleErrorService(error, res);
    }
});

router.get('/:id', tokenVerify, async (req, res) => {

    const id = req.params.id

    try {
        const data = await mediaService.getEventMedia(id)
        res.json({ message: "Consulta concluida", data})
    } catch (error) {
        handleErrorService(error, res)
    }
})

module.exports = router;