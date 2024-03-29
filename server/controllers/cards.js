const cardsRouter = require('express').Router()

const jwt = require('jsonwebtoken')

const config = require('../utils/config')

let Database;
Database = require('../database/database');

const { authenticateUser, checkCategoryOwnership, validateModule} = require('../utils/middleware');


cardsRouter.get('/', authenticateUser, async (request, response) => {

  const user = request.user;
  if (!user) {
    return response.status(401).json({ error: 'token invalid or user deleted' });
  }
     
    const tasks = await Database.findCardsByLogin(user.login);
    response.send({...tasks});
})


cardsRouter.post('/category/:categoryId/module/:moduleId/card/:cardId/review', authenticateUser, checkCategoryOwnership, validateModule, async (request, response) => {
  const cardId = request.params.cardId;
  
  const user = request.user;
  if (!user) {
    return response.status(401).json({ error: 'token invalid or user deleted' });
  }

  const category = request.category;

  try {
    const card = await Database.reviewCard(cardId, user._id, request.body.nextReviewInterval, request.body.nextReviewDate);
    return response.status(200).send(card);
  }
  catch (error) {
    return response.status(500).json({ error: 'Internal Server Error', detailedError: error.message });
  }
});

cardsRouter.put('/category/:categoryId/module/:moduleId/card/:cardId', authenticateUser, checkCategoryOwnership, validateModule, async (request, response) => {
  const cardId = request.params.cardId;

  const user = request.user;
  if (!user) {
    return response.status(401).json({ error: 'token invalid or user deleted' });
  }

  const category = request.category;
  const module = request.module;

  try {
  await Database.updateCard(cardId, request.body);
  return response.status(200).send({id : cardId});
  }
  catch (error) {
    return response.status(500).json({ error: 'Internal Server Error', detailedError: error.message });
  }
});

cardsRouter.delete('/category/:categoryId/module/:moduleId/card/:cardId', authenticateUser, checkCategoryOwnership, validateModule, async (request, response) => {
  const cardId = request.params.cardId;

  const user = request.user;
  if (!user) {
    return response.status(401).json({ error: 'token invalid or user deleted' });
  }

  const category = request.category;
  const module = request.module;

  try {
  await Database.deleteCard(cardId, module);
  return response.status(200).send({id : cardId});
  }
  catch (error) {
    return response.status(500).json({ error: 'Internal Server Error', detailedError: error.message });
  }
});


cardsRouter.post('/category/:categoryId/module/:moduleId/addCard', authenticateUser, checkCategoryOwnership, validateModule, async (request, response) => {
  const user = request.user;
  if (!user) {
    return response.status(401).json({ error: 'token invalid or user deleted' });
  }


  const category = request.category;
  const module = request.module;

  const cardId = await Database.createCard(request.body, module);
  return response.status(200).send({id : cardId});
});


cardsRouter.delete('/category/:categoryId/module/:moduleId', authenticateUser, checkCategoryOwnership, validateModule, async (request, response) => {
  const user = request.user;
  if (!user) {
    return response.status(401).json({ error: 'token invalid or user deleted' });
  }

  const category = request.category;
  const module = request.module;

  try {
  await Database.deleteModule(category, module);
  response.status(200).end();
  }
  catch (error) {
    return response.status(500).json({ error: 'Internal Server Error', detailedError: error.message });
  }
});


cardsRouter.put('/category/:categoryId/reset', authenticateUser, checkCategoryOwnership, async (request, response) => {
  const user = request.user;
  if (!user) {
    return response.status(401).json({ error: 'token invalid or user deleted' });
  }

  const category = request.category;

  await Database.resetScheduleCategory(category, user._id);

  response.send({});
});

cardsRouter.post('/category/:categoryId/module', authenticateUser, checkCategoryOwnership, async (request, response) => {
  const user = request.user;
  if (!user) {
    return response.status(401).json({ error: 'token invalid or user deleted' });
  }

  const category = request.category;

  try {
  const moduleId = await Database.createModule(request.body.name, category);
  response.send({id : moduleId});
  }
  catch (error) {
    return response.status(500).json({ error: 'Internal Server Error', detailedError: error.message });
  }
});

cardsRouter.get('/category/:categoryId/populated/:study?', authenticateUser, checkCategoryOwnership, async (request, response) => {
  const study = request.params.study;

  const user = request.user;
  if (!user) {
    return response.status(401).json({ error: 'token invalid or user deleted' });
  }

  const category = request.category;

  const populatedCategory = await Database.getCategoryPopulatedById(category._id, study !== undefined ? true : false, user._id.toString());
  response.send(populatedCategory);
});

  cardsRouter.put('/category/:categoryId/rename', authenticateUser, checkCategoryOwnership, async (request, response) => {
    const user = request.user;
    if (!user) {
      return response.status(401).json({ error: 'token invalid or user deleted' });
    }
  
    const category = request.category;
  
    await Database.renameCategory(category, request.body.name);
    response.status(200).send({});
  })

cardsRouter.delete('/category/:categoryId', authenticateUser, checkCategoryOwnership, async (request, response) => {
  const user = request.user;
  if (!user) {
    return response.status(401).json({ error: 'token invalid or user deleted' });
  }

  const category = request.category;

  await Database.deleteCategory(category);
  response.status(200).send({});
})

cardsRouter.get('/category/public', authenticateUser, async (request, response) => {
  const user = request.user;
  if (!user) {
    return response.status(401).json({ error: 'token invalid or user deleted' });
  }
   
  const categories = await Database.findPublicCategoriesNotByUserId(user._id);
  response.send(categories);
})

cardsRouter.get('/category', authenticateUser, async (request, response) => {
  const user = request.user;
  if (!user) {
    return response.status(401).json({ error: 'token invalid or user deleted' });
  }
   
  const categories = await Database.findCategoriesByUserId(user._id);
  response.send(categories);
})

cardsRouter.post('/category', authenticateUser, async (request, response) => {
  
  const user = request.user;
  if (!user) {
    return response.status(401).json({ error: 'token invalid or user deleted' });
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

module.exports = cardsRouter