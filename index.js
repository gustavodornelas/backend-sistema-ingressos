const express = require('express'), bodyParser = require('body-parser')
const cors = require('cors')
const customersRouter = require('./src/routes/customers')
const customersAddressRouter = require('./src/routes/customersAddress')
const authenticationRouter = require('./src/routes/authentication')
const venueRouter = require('./src/routes/venue')
const eventsRouter = require('./src/routes/event')
const paymentRouter = require('./src/routes/payment')
const ticketsRouter = require('./src/routes/tickets')
const eventDateRouter = require('./src/routes/eventDate')

const app = express()
const PORT = 3000

// Adicionando middleware
app.use(cors())
app.use(express.json())
app.use(bodyParser.json())

// Adcionando as rotas
app.use('/customers', customersRouter)
app.use('/authentication', authenticationRouter)
app.use('/customersAddress', customersAddressRouter)
app.use('/venues', venueRouter)
app.use('/events', eventsRouter)
app.use('/payments', paymentRouter)
app.use('/tickets', ticketsRouter)
app.use('/eventsDates', eventDateRouter)

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`)
});
