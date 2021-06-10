const passport = require('passport');
require('./passport.js');
const jwt = require('jsonwebtoken');
const jwtSecret = 'secret';

// Create function to generate jsonwebtoken
const generateToken = (user) => {
  return jwt.sign(user, jwtSecret, {subject: user.Username, algorithm: 'HS256', expiresIn: '7d'});
}

// Create login route for registered users that authenticates using local strategy then assigns token
module.exports = (app) => {
  app.post('/login', passport.authenticate('local', {session: false}), (req, res) => {
    // If this function gets called, authentication was successful.
    // `req.user` contains the authenticated user.
      let token = generateToken((req.user).toJSON());
      return res.json({user: req.user, token: token});
    });
  }
