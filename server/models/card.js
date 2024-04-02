const mongoose = require('mongoose');
const UserCardReview = require('./userCardReview');

const cardSchema = new mongoose.Schema({
  next: { type: mongoose.Schema.Types.ObjectId, ref: 'Card', default: null},
  moduleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Module', default: null},
  type: { type: String, enum: ['standard', 'multipleChoice', 'lineInput'], required: true },
  // Fields specific to each card type
  front: String,               // For standard cards
  back: String,                // For standard cards
  question: String,            // For multiple-choice cards
  correctAnswer: String,              // For multiple-choice cards
  choices: {type : [String], default : undefined},           // For multiple-choice cards
  instructions: String,        // For line/multiline input cards
  beforeInput: String,        // For line/multiline input cards
  afterInput: String,         // For line/multiline input cards
  answer: String,              // For line/multiline input cards & multiple-choice cards
  newlinesAroundInput: Boolean,
  name: String,
  nextReviewDate: { type: Date },
  nextReviewInterval: { type: Number },
  reviews: { type: Map, of: { type: UserCardReview.schema }, default: {} }, 
});

const Card = mongoose.model('Card', cardSchema);


const moduleSchema = new mongoose.Schema({
    name: { type: String, required: true },
    cards: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Card' }],
    deck: { type: mongoose.Schema.Types.ObjectId, ref: 'Deck', default: null},
    cardCount: { type: Number, default: 0},
  });
  
  const Module = mongoose.model('Module', moduleSchema);

  
  const deckSchema = new mongoose.Schema({
    name: { type: String, required: true },
    modules: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Module' }],
    user: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
  });
  
  const Deck = mongoose.model('Deck', deckSchema);
  
  module.exports = { Card, Module, Deck };


