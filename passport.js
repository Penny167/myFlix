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
    Users.findOne()
  }
  )
);

passport.use(new JWTStrategy(
  // options
  {jwtFromRequest = ExtractJWT.fromAuthHeaderAsBearerToken(),
  secretOrKey = 'secret'
  },
  //verify
  )
)