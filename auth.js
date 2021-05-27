const passport = require('passport');
require('./passport.js');
const jwt = require('jsonwebtoken');
const jwtSecret = 'secret';

// Create function to generate jsonwebtoken
const generateToken = (user) => {
  return jwt.sign(user, jwtSecret, {subject: user.Username, algorithm: 'HS256', expiresin: '7d'});
}

// Create login route for registered users that authenticates using local strategy then assigns token
module.exports = (router) => {
  router.post('/login', passport.authenticate('local', {session: false}), (req, res) => {
  // If this function gets called, authentication was successful.
  // `req.user` contains the authenticated user.
    let token = generateToken((req.user).toJSON())
    .then(user, token)
      res.status(201).json({user, token})
    .catch((error) => {
      console.error(error);
      res.status(500).send('Error: ' + error);
    })
  });
}
 
