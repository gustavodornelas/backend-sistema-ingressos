const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const setupRoutes = require('./routes')

const app = express()
const hostname = '162.240.226.178'
const port = 3000

// Adicionando middleware
app.use(cors())
app.use(express.json())
app.use(bodyParser.json())

// Adicionando as rotas
setupRoutes(app)

app.listen(port, () => {
  console.log(`Server running at http://${hostname}:${port}/`)
})

