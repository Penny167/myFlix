const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const Models = require('./models.js');
const Users = Models.User;
const JWTStrategy = require('passport-jwt').Strategy;
const ExtractJWT = require('passport-jwt').ExtractJwt;

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

passport.use(new JWTStrategy(
  // Options object must contain the function to return the JWT and the secret to decode it
  {jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(), secretOrKey: 'secret'},
  //Verify callback takes decoded JWT payload and invokes done where username valid
  (jwt_payload, done) => {
    Users.findById(jwt_payload._id, (err, user) => {
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