/**
 * @file The auth file implements the login route for registered users.
 * @requires passport Used to create strategies for authenticating and authorising requests to the Api endpoints.
 * @requires './passport.js' The file where the passport strategies are implemented.
 * @requires jsonwebtoken Used to create json web tokens for authorising requests to protected endpoints. 
 */

const passport = require('passport');
// Run passport file where strategies are implemented
require('./passport.js');
const jwt = require('jsonwebtoken');

// Store value of the secret used to decode the json web tokens
const jwtSecret = 'secret';

/**
 * Generates a json web token that is used to authorise requests to protected routes that implement 
 * the jwt passport strategy.
 * @function generateToken 
 * @param {*} user - Authenticated user returned by the local passport strategy.
 * @returns {string} A json web token.
 */
const generateToken = (user) => {
  return jwt.sign(user, jwtSecret, {subject: user.Username, algorithm: 'HS256', expiresIn: '7d'});
}

/**
 * Implements and exports a POST request to the /login endpoint for logging in a registered user. 
 * There is no body required for this request but a Username and Password must be provided in the
 * request parameters. By submitting these fields in an html form in the front end, they can be
 * attached to the login URL as a query string. The request is authenticated using the local passport 
 * strategy and, if successful, a json web token is created by calling the generateToken function. The
 * token is returned along with the authenticated user.
 * @param {*} app The express application created in the index file.
 * @returns {Object} An object containing the record for the logged in user and the json web token.
 */
module.exports = (app) => {
  app.post('/login', passport.authenticate('local', {session: false}), (req, res) => {
      // If authentication is successful, this code gets executed
      let token = generateToken((req.user).toJSON()); // `req.user` contains the authenticated user
      return res.json({user: req.user, token: token});
  });
}
