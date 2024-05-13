const express = require('express'), bodyParser = require('body-parser');
const cors = require('cors');
const usersRouter = require('./routes/users');
const authenticationRouter = require('./routes/authentication')

const app = express();
const PORT = 3000;

// Adicionando middleware
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

// Adcionando as rotas
app.use('/users', usersRouter);
app.use('/authentication', authenticationRouter);

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
