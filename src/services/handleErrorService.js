const DuplicateError = require("../CustomErrors/DuplicateError")
const NotFoundError = require("../CustomErrors/SystemError")
const UnauthorizedError = require("../CustomErrors/UnauthorizedError")

// errorService.js
const handleErrorService = (error, res) => {
    if (error instanceof UnauthorizedError) {
        return res.status(401).json({ message: error.message })
    } else if (error instanceof NotFoundError) {
        return res.status(404).json({ message: error.message })
    } else if (error instanceof DuplicateError) {
        return res.status(409).json({ message: error.message })
    } else {
        return res.status(500).json({ message: error.message })
    }
}

module.exports = handleErrorService