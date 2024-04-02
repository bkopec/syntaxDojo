const logger = require('./logger')
const jwt = require('jsonwebtoken');
const Database = require('../database/database'); // Replace with your actual database module


const validateModule = async (request, response, next) => {
  try {
    const moduleId = request.params.moduleId;
    const deck = request.deck; // Assuming deck is already attached to the request

    const module = await Database.findModuleById(moduleId);

    if (!module) {
      return response.status(404).json({ error: 'Module not found' });
    }

    request.module = module;

    next();
  } catch (error) {
    next(error);
  }
};


const getDeck = async (request, response, next) => {
  try {
    const deckId = request.params.deckId;
    const deck = await Database.findDeckById(deckId);

    if (!deck) {
      return response.status(404).json({ error: 'Deck not found' });
    }

    request.deck = deck;
    next(); 
  } catch (error) {
    next(error); 
  }
};

const checkDeckOwnership = async (request, response, next) => {
  try {
    const deckId = request.params.deckId;
    const deck = await Database.findDeckById(deckId);

    if (!deck) {
      return response.status(404).json({ error: 'Deck not found' });
    }

    if (deck.user._id.toString() !== request.user._id.toString()) {
      return response.status(403).json({ error: 'Forbidden' });
    }

    request.deck = deck; 
    next();
  } catch (error) {
    next(error);
  }
};


const getTokenFrom = request => {
  const authorization = request.get('authorization');
  if (authorization && authorization.startsWith('Bearer ')) {
    return authorization.replace('Bearer ', '');
  }
  return null;
};

const authenticateUser = async (request, response, next) => {
  try {
    const decodedToken = jwt.verify(getTokenFrom(request), process.env.SECRET);
    if (!decodedToken.id) {
      return response.status(401).json({ error: 'Token invalid' });
    }

    const user = await Database.findUserById(decodedToken.id);
    if (!user) {
      return response.status(401).json({ error: 'Token invalid or user deleted' });
    }

    request.user = user;
    next();
  } catch (error) {
    next(error); 
  }
};

module.exports = authenticateUser;

const requestLogger = (request, response, next) => {
  logger.info('Method:', request.method)
  logger.info('Path:  ', request.path)
  logger.info('Body:  ', request.body)
  logger.info('---')
  next()
}

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

const errorHandler = (error, request, response, next) => {
  //logger.error(error.message)
  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  } else if (error.name ===  'JsonWebTokenError') {
    return response.status(400).json({ error: 'token missing or invalid' })
  }
  else
     return (response.status(500).json({ error: 'Internal Server Error', detailedError: error.message }));
  next(error)
}

module.exports = {
  validateModule,
  checkDeckOwnership,
  authenticateUser,
  requestLogger,
  unknownEndpoint,
  errorHandler,
  getDeck
}