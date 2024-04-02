const usersRouter = require('express').Router()

const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

let Database;
Database = require('../database/database');



function generateToken(userForToken) {
    return jwt.sign(userForToken, process.env.SECRET);
}

usersRouter.post('/login', async (request, response) => {
  
    if (request.body.password.length < 4)
      return(response.status(500).json({ error: 'Internal Server Error', detailedError: "Forged request or old client" }));
  
    const user = await Database.findUserByLogin(request.body.username);

    if (user) {
      const passwordCorrect = await bcrypt.compare(request.body.password, user.password);
  
      if (!passwordCorrect) {
        return response.status(401).json({
          errorMessage: 'Invalid credentials.', error:"INVALID_CREDENTIALS"
        })
      }
      else {
        const token = generateToken({login: user.login, id: user._id});
        return(response.status(200).send({token, login: user.login}));
      }
    }
    else  {
      return response.status(401).json({
        errorMessage: 'Invalid credentials.', error:"INVALID_CREDENTIALS"
      })
    }
  })


  usersRouter.post('/register', async (request, response) => {
  
    if (request.body.password.length < 4)
      return(response.status(500).json({ error: 'Internal Server Error', detailedError: "Password is too short" }));
  
    const user = await Database.findUserByLogin(request.body.username);

    if (user) {
        return response.status(401).json({
          errorMessage: 'Username exists', error:"USER_EXISTS"
        })
    }
  
    // user doesn't exist, create the user
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(request.body.password, saltRounds);

    Database.createUser({login : request.body.username, password : passwordHash}).then(async result => {
      const userForToken = {
        login: request.body.username,
        id: result
      }
      const token = jwt.sign(userForToken, process.env.SECRET)
    
      response.status(200).send({token, login: request.body.username});
    }).catch(error => {
      console.error('Error saving account:', error);
  
      response.status(500).json({ error: 'Internal Server Error', detailedError: error.message });
    });

  })
  
module.exports = usersRouter