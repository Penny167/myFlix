const mongoose = require('mongoose');
const Models = require('./models.js');
const Movies = Models.Movie;
const Users = Models.User;
const express = require('express');
const morgan = require('morgan');
const app = express();
const passport = require('passport');
require('./passport.js');
app.use(express.json());
const auth = require('./auth.js');
const cors = require('cors');
const {check, validationResult} = require('express-validator');

mongoose.connect('mongodb://localhost:27017/myFlixDB', {useNewUrlParser: true, useUnifiedTopology: true});

// Setting up the server
const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0',() => {
  console.log('The server is listening on port ' + port);
});

// Using morgan to log requests
app.use(morgan('common'));

// Using express.static to serve documentation file from the public folder
app.use(express.static('public'));

// Using cors to allow requests from all origins
app.use(cors());

// Calling the auth function, passing the app as the parameter
auth(app);

// Landing page
app.get('/',(req,res) => {
  res.send('Welcome to myFlix!');
});

// Return a list of all movies
app.get('/movies', passport.authenticate('jwt', {session: false}), (req, res) => {
  Movies.find()
  .then((movies) => {
    res.status(200).json(movies);
  })
  .catch((error) => {
    console.error(error);
    res.status(500).send('Error: ' + error);
  })
});

// Return data about a single movie by title:
app.get('/movies/:Title', passport.authenticate('jwt', {session: false}), (req, res) => {
  Movies.findOne({Title: req.params.Title})
  .then((movie) => {
    res.status(200).json(movie);
  })
  .catch((error) => {
    console.error(error);
    res.status(500).send('Error: ' + error);
  })
});

// Return the description of a genre searched for by name
app.get('/movies/genre/:Name', passport.authenticate('jwt', {session: false}), (req, res) => {
  Movies.findOne({"Genre.Name": req.params.Name})
  .then((movie) => {
    res.status(200).send(movie.Genre.Description);
  })
  .catch((error) => {
    console.error(error);
    res.status(500).send('Error: ' + error);
  })
});

// Return the details about a director searched for by name
app.get('/movies/director/:Name', passport.authenticate('jwt', {session: false}), (req, res) => {
  Movies.findOne({"Director.Name": req.params.Name})
  .then((movie) => {
    res.status(200).json(movie.Director);
  })
  .catch((error) => {
    console.error(error);
    res.status(500).send('Error: ' + error);
  })
});

// Register a new user
app.post('/users',
  [
    check('Username', 'Username must contain at least 5 characters.').isLength({min: 5}),
    check('Username', 'Username must only contain alphanumeric characters.').isAlphanumeric(),
    check('Password', 'Password must contain at least 8 characters.').isLength({min: 8}),
    check('Email', 'Email must be a valid email address.').isEmail()
  ],
  (req, res) => {
  let errors = validationResult(req);
  if(!errors.isEmpty()) {
    return res.status(422).json({errors: errors.array()});
  }
  // let hashedPassword = Users.hashPassword(req.body.Password);
  Users.findOne({Username: req.body.Username})
  .then((user) => {
    if(user) {
    res.status(400).send(req.body.Username + ' already exists.');
    } else {
    Users.create({
      Username: req.body.Username,
      Password: Users.hashPassword(req.body.Password),
      Email: req.body.Email,
      Birthday: req.body.Birthday
      })
    .then((user) => {
      res.status(201).json(user);
      })
    .catch((error) => {
      console.error(error);
      res.status(500).send('Error: ' + error);
      })
    }
  })
});

// Deregister an existing user
app.delete('/users/:Username', passport.authenticate('jwt', {session: false}), (req, res) => {
  Users.findOneAndDelete({Username: req.params.Username})
  .then((user) => {
    if(!user) {
    res.status(400).send(req.params.Username + ' does not exist.');
    } else {
        res.status(200).send(req.params.Username + ' has been deregistered');
    }
  })
  .catch((error) => {
    console.error(error);
    res.status(500).send('Error: ' + error);
  })
});

// Update an existing user's details
app.put('/users/:Username',
  [
    check('Username', 'Username must contain at least 5 characters.').isLength({min: 5}),
    check('Username', 'Username must only contain alphanumeric characters.').isAlphanumeric(),
    check('Password', 'Password must contain at least 8 characters.').isLength({min: 8}),
    check('Email', 'Email must be a valid email address.').isEmail()
  ],
  passport.authenticate('jwt', {session: false}), (req, res) => {
  let errors = validationResult(req);
  if(!errors.isEmpty()) {
    return res.status(422).json({errors: errors.array()});
  }  
  Users.findOneAndUpdate(
    {Username: req.params.Username},
    {$set: {
      Username: req.body.Username,
      Password: req.body.Password,
      Email: req.body.Email,
      Birthday: req.body.Birthday
    }
    },
    {new: true}
    )
    .then((user) => {
      res.status(200).json(user);
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send('Error: ' + error);
    })
});

// Add a movie to a user's favourites
app.put('/users/:Username/:MovieID', passport.authenticate('jwt', {session: false}), (req, res) => {
  Users.findOneAndUpdate(
  {Username: req.params.Username},
  {$push: {FavouriteMovies: req.params.MovieID}},
  {new: true}
  )
  .then((user) => {
    res.status(200).json(user.FavouriteMovies);
  })
  .catch((error) => {
    console.error(error);
    res.status(500).send('Error: ' + error);
  })
});

// Delete a movie from a user's favourites
app.delete('/users/:Username/:MovieID', passport.authenticate('jwt', {session: false}), (req, res) => {
  Users.findOneAndUpdate(
  {Username: req.params.Username},
  {$pull: {FavouriteMovies: req.params.MovieID}},
  {new: true}
  )
  .then((user) => {
    res.status(200).json(user.FavouriteMovies);
  })
  .catch((error) => {
    console.error(error);
    res.status(500).send('Error: ' + error);
  })
});

// Error handling function to log errors to the console
app.use((err, req, res, next) => {
  console.error(err.stack);
}); 
