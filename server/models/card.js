const mongoose = require('mongoose');

const cardSchema = new mongoose.Schema({
  question: { type: String, required: true },
  answer: { type: String, required: true },
  next: { type: mongoose.Schema.Types.ObjectId, ref: 'Card', default: null},
  module: { type: mongoose.Schema.Types.ObjectId, ref: 'Module', default: null},
});

const Card = mongoose.model('Card', cardSchema);

const moduleSchema = new mongoose.Schema({
    name: { type: String, required: true },
    cards: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Card' }],
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null},
    cardCount: { type: Number, default: 0},
  });
  
  const Module = mongoose.model('Module', moduleSchema);

  const categorySchema = new mongoose.Schema({
    name: { type: String, required: true },
    modules: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Module' }],
    user: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
  });
  
  const Category = mongoose.model('Category', categorySchema);
  
  module.exports = { Card, Module, Category };

