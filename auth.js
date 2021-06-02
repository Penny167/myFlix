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
  app.post('/login', (req, res) => {
    passport.authenticate('local', { session: false }, (error, user, info) => {
      if (error || !user) {
        return res.status(400).json({
          message: 'Something is not right',
          user: user
        });
      }
      let token = generateToken(user.toJSON());
      return res.json({ user, token });
    })(req, res);
  });
  } 
