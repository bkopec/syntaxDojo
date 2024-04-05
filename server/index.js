const app = require('./app')
const config = require('./utils/config')

app.listen(config.PORT, () => {
  logger.info(`Server running on port ${config.PORT}`)
})