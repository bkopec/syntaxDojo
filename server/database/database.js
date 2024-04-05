require('dotenv').config()
const User = require('../models/user');
const { Card, Module, Deck } = require('../models/card');

class Database {

  static async findUserById(id) {
    return User.findById(id);
  }

  static async findUserByLogin(login) {
    return User.findOne({login: login});
  }

  static async findDeckById(deckId) {
    return Deck.findById(deckId)
    .populate({
      path: 'user',
      select: 'login'
    });
  }

  static async findModuleById(moduleId) {
    return Module.findById(moduleId);
  }


  static async findDecksByUserId(userId) {
    return Deck.find({user: userId});
  }

  static async findPublicDecksByUserId(userId) {
    return Deck.find({user: { $ne: userId }})
    .populate({
      path: 'user',
      select: 'login'
    });
  }

  static async findModulesByDeckId(deckId) {
    return Module.find({deck: deckId});
  }

  
  static async moveCard(cardId, moduleId, targetModuleId) {
    const module = await Module.findById(moduleId);
    const targetModule = await Module.findById(targetModuleId);
    const card = await Card.findById(cardId);

    module.cards = module.cards.filter(c => c.toString() !== cardId.toString());
    module.cardCount -= 1;
    targetModule.cards.push(card._id);
    targetModule.cardCount += 1;
    card.moduleId = targetModule._id;

    try {
        await module.save();
        await targetModule.save();
        await card.save();
    }
    catch (error) {
        throw error;
    }
  }

  static async renameDeck(deck, name) 
  {
    deck.name = name;
    try {
        await deck.save();
    }
    catch (error) {
        throw error;
    }
  }

static async resetScheduleDeck(deck, userId) {
  try {
    await deck.populate({ path: 'modules', populate: { path: 'cards' } });
    for (const module of deck.modules) {
      for (const card of module.cards) {
        if (card.reviews.has(userId.toString())) {
          card.reviews.delete(userId.toString());
          await card.save();
        }
      }
    }
  }
    catch (error) {
        throw error;
    }
}
    

  static async reviewCard(cardId, userId, nextReviewInterval, nextReviewDate) {
    const card = await Card.findById(cardId);
    card.reviews.set(userId, { nextReviewDate: nextReviewDate, nextReviewInterval: nextReviewInterval });
    try {
        await card.save();
        return card;
    }
    catch (error) {
        throw error;
    }
  }


  static async deleteDeck(deck) {
    for (const deckModule of deck.modules) {
      const module = await Module.findById(deckModule);
      const cardIds = module.cards.map(card => card.toString());
      await Card.deleteMany({ _id: { $in: cardIds } });
      await Module.deleteOne({ _id: module._id });
    }

    try {
        await Deck.findByIdAndDelete(deck._id);
    } catch (error) {
        throw error;
    }
  }

  static async updateCard(cardId, updatedCard) {
    try {
        await Card.findByIdAndUpdate
        (cardId, updatedCard);
    }
    catch (error) {
        throw error;
    }
  }


  static async deleteCard(cardId, module) {
    module.cards = module.cards.filter(c => c.toString() !== cardId.toString());
    module.cardCount -= 1;

    try {
        await module.save();
        await Card.deleteOne({ _id:
        cardId });
        return (cardId);
    }
    catch (error) {
        throw error;
    }
  }

static async createCard(card, module) {
    const newCard = new Card({
        ...card,
        moduleId: module._id,
    })

    module.cards.push(newCard._id);
    module.cardCount += 1;

    try {
        await newCard.save();
        await module.save();
        return (newCard._id);
      } catch (error) {
        throw new Error('Failed to save card');
      }
  }

  static async deleteModule(deck, module) {
      const cardIds = module.cards.map(card => card.toString());
    
      await Card.deleteMany({ _id: { $in: cardIds } });
    
      deck.modules = deck.modules.filter(m => m.toString() !== module._id.toString());
    
      try {
        await deck.save();
        await Module.deleteOne({ _id: module._id });
      } catch (error) {
        throw error;
      }
  }


  static async createDeck(name, userId) {
    const newDeck = new Deck({
        name:name,
        modules:[],
        user: userId,
    })
  
  
    try {
        await newDeck.save();
        return (newDeck._id);
      } catch (error) {
        throw new Error('Failed to save deck');
      }

  }

  static async getDeckPopulatedById(deckId, study, userId) {
    const deck = await Deck.findById(deckId)
  .populate({
    path: 'modules',
    populate: {
      path: 'cards',
      model: 'Card', 
    },
  })
  .populate({
    path: 'user',
    select: 'login'
  });

    for (const module of deck.modules) {
      for (const card of module.cards) {
        console.log(card);
        if (card.reviews.has(userId)) {
          const userReview = card.reviews.get(userId);
          card.nextReviewDate = userReview.nextReviewDate;
          card.nextReviewInterval = userReview.nextReviewInterval;
        }
        else {
          card.nextReviewDate = Date.now() - 1;
          card.nextReviewInterval = -1;
        }
        card.reviews = undefined;
      }
      if (study)
        module.cards = module.cards.filter(card => card.nextReviewDate <= Date.now());
    }
  return(deck);
  }

  static async createModule(name, deck) {
    const newModule = new Module({
        name:name,
        deck:deck._id,
        cards:[],
    })

    deck.modules.push(newModule._id);
  
    try {
        await newModule.save();
        await deck.save();
        return (newModule._id);
      } catch (error) {
        throw new Error('Failed to save module');
      }

  }



  static async createUser(user) {
    const newUser = new User({
        ...user
    })
  
    try {
        await newUser.save();
        return (newUser._id);
    } catch (error) {
        throw error;
    }
  }
 

  static async init() {
    const config = require('../utils/config');
    const url = config.DB_URL;

    const mongoose = require('mongoose')
    mongoose.set('strictQuery',false)
    mongoose.connect(url)
    .then(() => {
    console.log('Connected to MongoDB');
    })
    .catch((error) => {
    console.error('Error connecting to MongoDB:', error.message);
    });
  }
  
}

module.exports = Database;