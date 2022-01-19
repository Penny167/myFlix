/**
 * @file This file implements the login route for registered users. 
 */

const passport = require('passport');
require('./passport.js');
const jwt = require('jsonwebtoken');
const jwtSecret = 'secret';

/**
 * Generates a json web token that will be used to authorize requests to other routes.
 * @param {*} user - Authenticated user returned by the local passport strategy.
 * @returns jwt used to authorize requests that implement the jwt passport strategy.
 */
const generateToken = (user) => {
  return jwt.sign(user, jwtSecret, {subject: user.Username, algorithm: 'HS256', expiresIn: '7d'});
}

/**
 * Implements the log in route. This route makes a post request to the database to log in a registered
 * user. The request is authenticated using the local passport strategy. If successful, a json web
 * token is created by calling the generateToken function and a json object is returned containing 
 * the authenticated user and the token. The token is used to authorize requests by the user to access
 * routes that implement the jwt strategy.
 * @param {*} app The Express application created in the index file that accesses the api routes.
 */
module.exports = (app) => {
  app.post('/login', passport.authenticate('local', {session: false}), (req, res) => {
    // If this function gets called, authentication was successful.
    // `req.user` contains the authenticated user.
      let token = generateToken((req.user).toJSON());
      return res.json({user: req.user, token: token});
    });
  }
