const cardsRouter = require('express').Router()

let Database;
Database = require('../database/database');

const { authenticateUser, checkDeckOwnership, validateModule, getDeck} = require('../utils/middleware');

cardsRouter.post('/deck/:deckId/module/:moduleId/card/:cardId/review', authenticateUser, getDeck, validateModule, async (request, response) => {
  const cardId = request.params.cardId;
  
  const user = request.user;
  if (!user) {
    return response.status(401).json({ error: 'token invalid or user deleted' });
  }
  
  try {
    const card = await Database.reviewCard(cardId, user._id, request.body.nextReviewInterval, request.body.nextReviewDate);
    return response.status(200).send(card);
  }
  catch (error) {
    return response.status(500).json({ error: 'Internal Server Error', detailedError: error.message });
  }
});

cardsRouter.put('/deck/:deckId/module/:moduleId/card/:cardId/move', authenticateUser, checkDeckOwnership, validateModule, async (request, response) => {
  const cardId = request.params.cardId;
  const moduleId = request.params.moduleId;

  const user = request.user;
  if (!user) {
    return response.status(401).json({ error: 'token invalid or user deleted' });
  }

  try {
  await Database.moveCard(cardId, moduleId, request.body.newModuleId);
  return response.status(200).send({id : cardId});
  }
  catch (error) {
    return response.status(500).json({ error: 'Internal Server Error', detailedError: error.message });
  }
});


cardsRouter.put('/deck/:deckId/module/:moduleId/card/:cardId', authenticateUser, checkDeckOwnership, validateModule, async (request, response) => {
  const cardId = request.params.cardId;

  const user = request.user;
  if (!user) {
    return response.status(401).json({ error: 'token invalid or user deleted' });
  }

  try {
  await Database.updateCard(cardId, request.body);
  return response.status(200).send({id : cardId});
  }
  catch (error) {
    return response.status(500).json({ error: 'Internal Server Error', detailedError: error.message });
  }
});

cardsRouter.delete('/deck/:deckId/module/:moduleId/card/:cardId', authenticateUser, checkDeckOwnership, validateModule, async (request, response) => {
  const cardId = request.params.cardId;

  const user = request.user;
  if (!user) {
    return response.status(401).json({ error: 'token invalid or user deleted' });
  }

  const module = request.module;

  try {
  await Database.deleteCard(cardId, module);
  return response.status(200).send({id : cardId});
  }
  catch (error) {
    return response.status(500).json({ error: 'Internal Server Error', detailedError: error.message });
  }
});


cardsRouter.post('/deck/:deckId/module/:moduleId/addCard', authenticateUser, checkDeckOwnership, validateModule, async (request, response) => {
  const user = request.user;
  if (!user) {
    return response.status(401).json({ error: 'token invalid or user deleted' });
  }

  const module = request.module;

  try {
  const cardId = await Database.createCard(request.body, module);
  return response.status(200).send({id : cardId});
  }
  catch(error) {
    return response.status(500).json({ error: 'Internal Server Error', detailedError: error.message });
  }
});


cardsRouter.delete('/deck/:deckId/module/:moduleId', authenticateUser, checkDeckOwnership, validateModule, async (request, response) => {
  const user = request.user;
  if (!user) {
    return response.status(401).json({ error: 'token invalid or user deleted' });
  }

  const deck = request.deck;
  const module = request.module;

  try {
  await Database.deleteModule(deck, module);
  response.status(200).end();
  }
  catch (error) {
    return response.status(500).json({ error: 'Internal Server Error', detailedError: error.message });
  }
});


cardsRouter.put('/deck/:deckId/reset', authenticateUser, getDeck, async (request, response) => {
  const user = request.user;
  if (!user) {
    return response.status(401).json({ error: 'token invalid or user deleted' });
  }

  const deck = request.deck;

  try {
  await Database.resetScheduleDeck(deck, user._id);
  response.send({});
  }
  catch(error) {
    return response.status(500).json({ error: 'Internal Server Error', detailedError: error.message });
  }
});

cardsRouter.post('/deck/:deckId/module', authenticateUser, checkDeckOwnership, async (request, response) => {
  const user = request.user;
  if (!user) {
    return response.status(401).json({ error: 'token invalid or user deleted' });
  }

  const deck = request.deck;

  try {
  const moduleId = await Database.createModule(request.body.name, deck);
  response.send({id : moduleId});
  }
  catch (error) {
    return response.status(500).json({ error: 'Internal Server Error', detailedError: error.message });
  }
});

cardsRouter.get('/deck/:deckId/populated/:study?', authenticateUser, getDeck, async (request, response) => {
  const study = request.params.study;

  const user = request.user;
  if (!user) {
    return response.status(401).json({ error: 'token invalid or user deleted' });
  }

  const deck = request.deck;

  try {
  const populatedDeck = await Database.getDeckPopulatedById(deck._id, study !== undefined ? true : false, user._id.toString());
  response.send(populatedDeck);
  }
  catch (error) {
    return response.status(500).json({ error: 'Internal Server Error', detailedError: error.message });
  }
});

  cardsRouter.put('/deck/:deckId/rename', authenticateUser, checkDeckOwnership, async (request, response) => {
    const user = request.user;
    if (!user) {
      return response.status(401).json({ error: 'token invalid or user deleted' });
    }
  
    const deck = request.deck;
    
    try {
    await Database.renameDeck(deck, request.body.name);
    response.status(200).send({});
    }
    catch(error) {
      return response.status(500).json({ error: 'Internal Server Error', detailedError: error.message });
    }
  })

cardsRouter.delete('/deck/:deckId', authenticateUser, checkDeckOwnership, async (request, response) => {
  const user = request.user;
  if (!user) {
    return response.status(401).json({ error: 'token invalid or user deleted' });
  }

  const deck = request.deck;

  try {
  await Database.deleteDeck(deck);
  response.status(200).send({});
  }
  catch(error) {
    return response.status(500).json({ error: 'Internal Server Error', detailedError: error.message });
  }
})

cardsRouter.get('/deck/public', authenticateUser, async (request, response) => {
  const user = request.user;
  if (!user) {
    return response.status(401).json({ error: 'token invalid or user deleted' });
  }
   
  try {
  const decks = await Database.findPublicDecksByUserId(user._id);
  response.send(decks);
  }
  catch(error) {
    return response.status(500).json({ error: 'Internal Server Error', detailedError: error.message });
  }
})

cardsRouter.get('/deck', authenticateUser, async (request, response) => {
  const user = request.user;
  if (!user) {
    return response.status(401).json({ error: 'token invalid or user deleted' });
  }
   
  try {
  const decks = await Database.findDecksByUserId(user._id);
  response.send(decks);
  }
  catch(error) {
    return response.status(500).json({ error: 'Internal Server Error', detailedError: error.message });
  }
})

cardsRouter.post('/deck', authenticateUser, async (request, response) => {
  
  const user = request.user;
  if (!user) {
    return response.status(401).json({ error: 'token invalid or user deleted' });
  }

    Database.createDeck(request.body.name, user._id)
    .then(result => {
      return response.status(200).send({id : result});
    })
    .catch(error => {
      console.error('Error saving task:', error);
      return response.status(500).json({ error: 'Internal Server Error', detailedError: error.message });
    });
})

module.exports = cardsRouter