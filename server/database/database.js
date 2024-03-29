require('dotenv').config()
const Task = require('../models/task');
const User = require('../models/user');
const { Card, Module, Category } = require('../models/card');

class Database {

  static async findUserById(id) {
    return User.findById(id);
  }

  static async findUserByLogin(login) {
    return User.findOne({login: login});
  }

  static async findCategoryById(categoryId) {
    return Category.findById(categoryId);
  }

  static async findModuleById(moduleId) {
    return Module.findById(moduleId);
  }


  static async findCategoriesByUserId(userId) {
    return Category.find({user: userId});
  }

  static async findPublicCategoriesNotByUserId(userId) {
    return Category.find({user: { $ne: userId }});
  }

  static async findModulesByCategoryId(categoryId) {
    return Module.find({category: categoryId});
  }

  

  static async renameCategory(category, name) 
  {
    category.name = name;
    try {
        await category.save();
    }
    catch (error) {
        throw error;
    }
  }

static async resetScheduleCategory(category, userId) {
  try {
    await category.populate({ path: 'modules', populate: { path: 'cards' } });
    for (const module of category.modules) {
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


  static async deleteCategory(category) {
    for (const categoryModule of category.modules) {
      // get the module and delete all the cards in its cards array
      const module = await Module.findById(categoryModule);
      const cardIds = module.cards.map(card => card.toString());
      await Card.deleteMany({ _id: { $in: cardIds } });
      await Module.deleteOne({ _id: module._id });
    }

    try {
        await Category.findByIdAndDelete(category._id);
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

  static async deleteModule(category, module) {
      const cardIds = module.cards.map(card => card.toString());
    
      await Card.deleteMany({ _id: { $in: cardIds } });
    
      category.modules = category.modules.filter(m => m.toString() !== module._id.toString());
    
      try {
        await category.save();
        await Module.deleteOne({ _id: module._id });
      } catch (error) {
        throw error;
      }
  }


  static async createCategory(name, userId) {
    const newCategory = new Category({
        name:name,
        modules:[],
        user: userId,
    })
  
  
    try {
        await newCategory.save();
        return (newCategory._id);
      } catch (error) {
        throw new Error('Failed to save category');
      }

  }

  static async getCategoryPopulatedById(categoryId, study, userId) {
    const category = await Category.findById(categoryId)
  .populate({
    path: 'modules',
    populate: {
      path: 'cards',
      model: 'Card', 
      select: study ? '' : '-reviews'
    },
  });

  if (study) {
    for (const module of category.modules) {
      for (const card of module.cards) {
        if (card.reviews.has(userId)) {
          const userReview = card.reviews.get(userId);
          card.nextReviewDate = userReview.nextReviewDate;
          card.nextReviewInterval = userReview.nextReviewInterval;
        }
        else {
          card.nextReviewDate = Date.now() - 1;
          card.nextReviewInterval = 0;
        }
      }
      module.cards = module.cards.filter(card => card.nextReviewDate <= Date.now());
    }
  }
  
  return(category);
  }

  static async createModule(name, category) {
    const newModule = new Module({
        name:name,
        category:category._id,
        cards:[],
    })

    category.modules.push(newModule._id);
  
    try {
        await newModule.save();
        await category.save();
        return (newModule._id);
      } catch (error) {
        throw new Error('Failed to save module');
      }

  }

  static async createTask(task) {
    const newTask = new Task({
        ...task
    })
  
    try {
        await newTask.save();
        return (newTask._id);
      } catch (error) {
        throw error;
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
 
  static async deleteTaskById(id) {
    try {
        await Task.findByIdAndDelete(id);
    } catch (error) {
        throw error;
    }  
  }

  static async updateTaskCompletion(id) {
    const task = await Task.findById(id);
    task.completed = !task.completed;
    try {
        await task.save();
    }
    catch (error) {
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