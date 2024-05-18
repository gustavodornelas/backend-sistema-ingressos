const express = require('express'), bodyParser = require('body-parser');
const cors = require('cors');
const customersRouter = require('./src/routes/customers');
const authenticationRouter = require('./src/routes/authentication')

const app = express();
const PORT = 3000;

// Adicionando middleware
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

// Adcionando as rotas
app.use('/customers', customersRouter);
app.use('/authentication', authenticationRouter);

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
