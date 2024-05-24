const AsaasError = require("../CustomErrors/AsaasError")
const DuplicateError = require("../CustomErrors/DuplicateError")
const NoContentError = require("../CustomErrors/NoContentError")
const NotFoundError = require("../CustomErrors/NotFoundError")
const UnauthorizedError = require("../CustomErrors/UnauthorizedError")

// errorService.js
const handleErrorService = (error, res) => {

    if (error instanceof NoContentError) {
        return res.status(202).json({ error: error.name, message: error.message })
    } else if (error instanceof UnauthorizedError) {
        return res.status(401).json({ error: error.name, message: error.message })
    } else if (error instanceof NotFoundError) {
        return res.status(404).json({ error: error.name, message: error.message })
    } else if (error instanceof DuplicateError) {
        return res.status(409).json({ error: error.name, message: error.message })
    } else if  (error instanceof AsaasError) {
        return res.status(502).json({ error: error.name, message: error.message })
    } else {
        return res.status(500).json({ error: error.name, message: error.message })
    }
}

module.exports = handleErrorService