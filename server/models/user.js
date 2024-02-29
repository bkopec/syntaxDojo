const mongoose = require('mongoose')

const { Category } = require('./card');

const userSchema = new mongoose.Schema({
    login: String,
    password: String,
    categories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
  })

userSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model('User', userSchema)