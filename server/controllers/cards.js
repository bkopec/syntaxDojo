const cardsRouter = require('express').Router()

const jwt = require('jsonwebtoken')

const config = require('../utils/config')

let Database;
Database = require('../database/database');


const getTokenFrom = request => {
  const authorization = request.get('authorization')
  if (authorization && authorization.startsWith('Bearer ')) {
    return authorization.replace('Bearer ', '')
  }
  return null
}

const authenticate = async (request, response) => {
  const decodedToken = jwt.verify(getTokenFrom(request), process.env.SECRET)
  if (!decodedToken.id) {
    response.status(401).json({ error: 'token invalid' })
    return null;
  }

  const user = await Database.findUserById(decodedToken.id)
  if (!user) {
    response.status(401).json({ error: 'token invalid or user deleted' })
    return null;
  }

  return user;
}

cardsRouter.get('/', async (request, response) => {

  const user = await authenticate(request, response);
  if (!user)
    return response.send();
     
    const tasks = await Database.findCardsByLogin(user.login);
    response.send({...tasks});
})
  
cardsRouter.delete('/category/:categoryId/module/:moduleId', async (request, response) => {
  const categoryId = request.params.categoryId;
  const moduleId = request.params.moduleId;

  const user = await authenticate(request, response);
  if (!user)
    return response.send();


  const category = await Database.findCategoryById(categoryId);
  if (!category) {
    return response.status(404).json({ error: 'Category not found' });
  }

  if (category.user.toString() !== user._id.toString()) {
    return response.status(403).json({ error: 'Forbidden' });
  }

  const module = await Database.findModuleById(moduleId);

  if (!module) {
    return response.status(404).json({ error: 'Module not found' });
  }

  if (module.category.toString() !== category._id.toString()) {
    return response.status(403).json({ error: 'Forbidden' });
  }

  try {
  await Database.deleteModule(category, module);
  response.status(200).end();
  }
  catch (error) {
    return response.status(500).json({ error: 'Internal Server Error', detailedError: error.message });
  }
});


cardsRouter.post('/category/:categoryId/module', async (request, response) => {
  const categoryId = request.params.categoryId;

  const decodedToken = jwt.verify(getTokenFrom(request), process.env.SECRET)
  if (!decodedToken.id)
    return response.status(401).json({ error: 'token invalid' })

  const user = await Database.findUserById(decodedToken.id)
  if (!user) {
    return response.status(401).json({ error: 'token invalid or user deleted' });
  }

  const category = await Database.findCategoryById(categoryId);
  if (!category) {
    return response.status(404).json({ error: 'Category not found' });
  }

  if (category.user.toString() !== user._id.toString()) {
    return response.status(403).json({ error: 'Forbidden' });
  }

  const moduleId = await Database.createModule(request.body.name, category);

  response.send({id : moduleId});
});

cardsRouter.get('/category/:categoryId/populated', async (request, response) => {
  const categoryId = request.params.categoryId;

  const decodedToken = jwt.verify(getTokenFrom(request), process.env.SECRET)
  if (!decodedToken.id)
    return response.status(401).json({ error: 'token invalid' })

  const user = await Database.findUserById(decodedToken.id)
  if (!user) {
    return response.status(401).json({ error: 'token invalid or user deleted' });
  }

  const category = await Database.findCategoryById(categoryId);
  if (!category) {
    return response.status(404).json({ error: 'Category not found' });
  }

  if (category.user.toString() !== user._id.toString()) {
    return response.status(403).json({ error: 'Forbidden' });
  }

  const populatedCategory = await Database.getCategoryPopulatedById(categoryId);
  response.send(populatedCategory);
});

cardsRouter.get('/category', async (request, response) => {

  const decodedToken = jwt.verify(getTokenFrom(request), process.env.SECRET)
  if (!decodedToken.id)
    return response.status(401).json({ error: 'token invalid' })

  const user = await Database.findUserById(decodedToken.id)
  if (!user) {
    return response.status(401).json({ error: 'token invalid or user deleted' });
  }
   
  const categories = await Database.findCategoriesByUserId(user._id);
  console.log(categories);
  response.send(categories);
})

cardsRouter.post('/category', async (request, response) => {
  
    const decodedToken = jwt.verify(getTokenFrom(request), process.env.SECRET)
    if (!decodedToken.id) {
      return response.status(401).json({ error: 'token invalid' })
    }
    const user = await Database.findUserById(decodedToken.id)
    if (!user) {
      return response.status(401).json({ error: 'token invalid or user deleted' })
    }

    Database.createCategory(request.body.name, user._id)
    .then(result => {
      return response.status(200).send({id : result});
    })
    .catch(error => {
      console.error('Error saving task:', error);
      return response.status(500).json({ error: 'Internal Server Error', detailedError: error.message });
    });
})

cardsRouter.post('/module', async (request, response) => {
  
  const decodedToken = jwt.verify(getTokenFrom(request), process.env.SECRET)
  if (!decodedToken.id) {
    return response.status(401).json({ error: 'token invalid' })
  }
  const user = await Database.findUserById(decodedToken.id)
  if (!user) {
    return response.status(401).json({ error: 'token invalid or user deleted' })
  }

  Database.createModule(request.body.name, request.body.category)
  .then(result => {
    return response.status(200).send({id : result});
  })
  .catch(error => {
    console.error('Error saving task:', error);
    return response.status(500).json({ error: 'Internal Server Error', detailedError: error.message });
  });
})
  
cardsRouter.delete('/:taskId', async (request, response) => {
  
    const taskId = request.params.taskId;
  
    const decodedToken = jwt.verify(getTokenFrom(request), process.env.SECRET)
    if (!decodedToken.id)
      return response.status(401).json({ error: 'token invalid' })
  
    const user = await Database.findUserById(decodedToken.id)
    if (!user)
      return response.status(401).json({ error: 'token invalid or user deleted' })

      Database.deleteTaskById(taskId)
  .then(result => {
      return response.status(204).end();
  })
  .catch(error => {
    return response.status(500).json({ error: 'Internal Server Error', detailedError: error.message })
  });
})
  
  
cardsRouter.put('/:taskId', async (request, response) => {

    const decodedToken = jwt.verify(getTokenFrom(request), process.env.SECRET)
    if (!decodedToken.id)
      return response.status(401).json({ error: 'token invalid' })
  
    const user = await Database.findUserById(decodedToken.id)
    if (!user)
      return response.status(401).json({ error: 'token invalid or user deleted' })

    Database.updateTaskCompletion(request.body.id)
    .then(result => {
      response.send();
    })
    .catch(error => {
      console.error('Error updating task:', error);
      return response.status(500).json({ error: 'Internal Server Error', detailedError: error.message });
    });
})

module.exports = cardsRouter