/**
 * This file implements two passport strategies that are used to authenticate requests to the Api
 * endpoints. The local strategy is used when a user logs in; it validates the username and password
 * against the users collection in the database. For subsequent requests, the JWT strategy is used.
 * This validates the request by decoding the Jason Web Token returned to the user on a successful login,
 * and checking the user ID from the payload against the users collection in the database.
 * @module passport
 */
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const JWTStrategy = require('passport-jwt').Strategy;
const ExtractJWT = require('passport-jwt').ExtractJwt;

const Models = require('./models.js');
const Users = Models.User;

/**
 * Authenticates request using passport local strategy and returns either authenticated user or error.
 */
passport.use(new LocalStrategy(
  {
  // Parameters: Changing default request parameter names becaused capitalized versions will be used
  usernameField: 'Username',
  passwordField: 'Password'
},
  // Verify callback takes username, password and invokes done where credentials are valid
  (username, password, done) => {
    console.log(username + ' ' + password);
    Users.findOne({Username: username}, (err, user) => {
      if (err) {
        console.log(err);
        return done(err);
      }
      if (!user) {
        console.log('Invalid username.');
        return done(null, false, {message: 'Invalid username.'});
      }
      if (!user.validatePassword(password)) {
        console.log('Incorrect password.');
        return done(null, false, {message: 'Incorrect password.'});
      }
      console.log('Authentication complete.');
      return done(null, user);
    });
  }
));

/**
 * Authenticates request using passport JWT strategy and returns either authenticated user or error.
 */
passport.use(new JWTStrategy(
  // Options object must contain the function to return the JWT and the secret to decode it
  {jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(), secretOrKey: 'secret'},
  //Verify callback takes decoded JWT payload and invokes done where userID valid
  (jwt_payload, done) => {
    Users.findById(jwt_payload._id, (err, user) => {
      if (err) {
        console.log(err);
        return done(err);
      }
      if (!user) {
        console.log('Invalid userID.')
        return done(null, false, {message: 'Invalid userID.'})
      } 
      console.log('Request authenticated.');
      return done(null, user)
    });
  }
));