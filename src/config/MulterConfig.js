const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs').promises;

const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadPath = path.join(__dirname, '..', 'uploads');
    const eventId = req.body.eventId;
    const eventFolderPath = path.join(uploadPath, eventId.toString());
    
    try {
      // Verificar se a pasta do evento já existe
      await fs.access(eventFolderPath);
    } catch (error) {
      // Se a pasta não existir, criar ela
      await fs.mkdir(eventFolderPath);
    }

    cb(null, eventFolderPath);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = `${uuidv4()}${ext}`;
    cb(null, filename);
  }
});

const upload = multer({ storage });

module.exports = upload;
