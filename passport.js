const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const Models = require('./models.js');
const Users = Models.User;
const JWTStrategy = require('passport-jwt').Strategy;
const ExtractJWT = require('passport-jwt').ExtractJWT;

passport.use(new LocalStrategy(
  // No options stated: Because our fields are called Username and Password we don't need to map these explicitly 
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
      console.log('Authentication complete.');
      return done(null, user);
    });
  }
));

passport.use(new JWTStrategy(
  // Options object requires the function to return the JWT and the secret to decode it
  {jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(), secretOrKey: 'secret'},
  //Verify callback takes decoded JWT payload and invokes done where userid valid
  (jwt_payload, done) => {
    Users.findOne({id: jwt_payload.sub}, (err, user) => {
      if (err) {
        console.log(err);
        return done(err);
      }
      if (!user) {
        console.log('Invalid username.')
        return done(null, false, {message: 'Invalid username.'})
      } 
      console.log('Request authenticated.');
      return done(null, user)
    });
  }
));