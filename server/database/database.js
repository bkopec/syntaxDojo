require('dotenv').config()
const Task = require('../models/task');
const User = require('../models/user');
const { Card, Module, Category } = require('../models/card');

class Database {

  static async findTaskById(id) {
    return Task.findById(id);
  }

  static async findTasksByLogin(login) {
    return Task.find({login: login});
  }

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

  static async findModulesByCategoryId(categoryId) {
    return Module.find({category: categoryId});
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

  static async getCategoryPopulatedById(categoryId) {
    const category = await Category.findById(categoryId)
  .populate({
    path: 'modules',
    populate: {
      path: 'cards',
      model: 'Card', 
    },
  });

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

  static async createCard(name, moduleId) {
    const newCard = new Card({
        name:name,
    })

    const module = Module.findById(moduleId);
    if (!module)
        throw new Error('Module not found');
    module.cards.push(newModule._id);
    module.cardCount += 1;

    try {
        await newCard.save();
        await module.save();
        return (newCategory._id);
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