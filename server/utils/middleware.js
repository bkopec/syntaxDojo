const logger = require('./logger')
const jwt = require('jsonwebtoken');
const Database = require('../database/database'); // Replace with your actual database module


const validateModule = async (request, response, next) => {
  try {
    const moduleId = request.params.moduleId;
    const category = request.category; // Assuming category is already attached to the request

    const module = await Database.findModuleById(moduleId);

    if (!module) {
      return response.status(404).json({ error: 'Module not found' });
    }

    if (module.category.toString() !== category._id.toString()) {
      return response.status(403).json({ error: 'Forbidden' });
    }

    // Attach the module to the request for later use
    request.module = module;

    // Proceed to the next middleware or route handler
    next();
  } catch (error) {
    // Pass any error to the error-handling middleware
    next(error);
  }
};

const checkCategoryOwnership = async (request, response, next) => {
  try {
    const categoryId = request.params.categoryId;
    const category = await Database.findCategoryById(categoryId);

    if (!category) {
      return response.status(404).json({ error: 'Category not found' });
    }

    if (category.user.toString() !== request.user._id.toString()) {
      return response.status(403).json({ error: 'Forbidden' });
    }

    request.category = category; // Attach the category to the request for later use
    next(); // Continue to the next middleware or route handler
  } catch (error) {
    next(error); // Pass the error to the error-handling middleware
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

    request.user = user; // Attach the user to the request for later use
    next(); // Continue to the next middleware or route handler
  } catch (error) {
    next(error); // Pass the error to the error-handling middleware
  }
};

module.exports = authenticateUser;

const requestLogger = (request, response, next) => {
  //logger.info('Method:', request.method)
  //logger.info('Path:  ', request.path)
  //logger.info('Body:  ', request.body)
  //logger.info('---')
  next()
}

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

const errorHandler = (error, request, response, next) => {
  //logger.error(error.message)
  console.log("grrrr");
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
  checkCategoryOwnership,
  authenticateUser,
  requestLogger,
  unknownEndpoint,
  errorHandler
}