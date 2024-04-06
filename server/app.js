
const express = require('express')
require('dotenv').config()

const cors = require('cors')
const config = require('./utils/config')

const app = express()
app.use(cors())
app.use(express.json())

let Database;
Database = require('./database/database');
Database.init();

const middleware = require('./utils/middleware')

const cardsRouter = require('./controllers/cards')
const usersRouter = require('./controllers/users')

app.use('/api/cards', cardsRouter)
app.use('/api/users', usersRouter)

app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

app.get('/', (req, res) => {
  // Set the response HTTP status code and send "Hello, World!" as the response
  res.status(200).send('Hello, World!\n');
});


const PORT = config.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
})

process.on('SIGINT', function() {
  process.exit(0);
});

module.exports = app