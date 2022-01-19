/** 
 * @file The index file creates an Express application, sets up a server and implements routes to Api
 * endpoints used to access the database containing the myFlix data. The routes use the models created 
 * using mongoose in the models file, and the requests are authenticated using the strategies implemented
 * using passport in the passport file. The connect method is used to connect the mongoose models to the
 * database that contains the movies and users collections that the models reference. The database is 
 * hosted on MongoDB Atlas.
 */

// Used to implement the database schema for requests made to the database
const mongoose = require('mongoose');
const Models = require('./models.js');
const Movies = Models.Movie;
const Users = Models.User;
// Used to create the express application 
const express = require('express');
// Used to log requests made to the database
const morgan = require('morgan');
// Calling the express function creates the application
const app = express();
// Used to create strategies for authenticating and authorising requests to the Api endpoints
const passport = require('passport');
require('./passport.js');
// Built in middleware function used to parse request bodies as json
app.use(express.json());
const auth = require('./auth.js');
// Used to control origins from which requests to the server can be made
const cors = require('cors');
// Used to implement validation checks on data provided by the user when submitting a registration request
const {check, validationResult} = require('express-validator');

mongoose.connect(process.env.CONNECTION_URI, {useNewUrlParser: true, useUnifiedTopology: true});

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

// Return an existing user's details
app.get('/users/:Username', passport.authenticate('jwt', {session: false}), (req, res) => {
  Users.findOne({Username: req.params.Username}).populate('FavouriteMovies')
  .then((user) => {
    res.status(200).json(user);
  })
  .catch((error) => {
    console.error(error);
    res.status(500).send('Error: ' + error);
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
      Password: Users.hashPassword(req.body.Password),
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

// Return an existing user's favourite movies array
app.get('/users/favourites/:Username', passport.authenticate('jwt', {session: false}), (req, res) => {
  Users.findOne({Username: req.params.Username})
  .then((user) => {
    res.status(200).json(user.FavouriteMovies);
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
  ).populate('FavouriteMovies')
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
  ).populate('FavouriteMovies')
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
