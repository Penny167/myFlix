/** 
 * @file The index file creates an Express application, sets up a server and implements routes to Api
 * endpoints used to access the database containing the myFlix data. The routes use the models created 
 * using mongoose in the models file, and the requests are authenticated using the strategies implemented
 * using passport in the passport file. The connect method is used to connect the mongoose models to the
 * database that contains the movies and users collections that the models reference. The database is 
 * hosted on MongoDB Atlas. The server and endpoints are hosted on Heroku.
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

// Connects mongoose to the myFlix database
mongoose.connect(process.env.CONNECTION_URI, {useNewUrlParser: true, useUnifiedTopology: true});

// Sets up the server
const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0',() => {
  console.log('The server is listening on port ' + port);
});

// Implements morgan to log requests
app.use(morgan('common'));

// Implements express.static to serve the documentation file from the public folder
app.use(express.static('public'));

// Implements cors to allow requests from all origins
app.use(cors());

/**
 * POST request to the log in endpoint implemented in the auth file.
 */ 
auth(app);

/**
 * GET request to the landing page ('/') endpoint. The response contains a text
 * response with a welcome message. */ 
app.get('/',(req,res) => {
  res.send('Welcome to myFlix!');
});

/**
 * GET request to the /movies endpoint. Retrieves data for all the movies in the movies collection
 * in the database. The request is validated using the jwt strategy. The response contains either 
 * a json object with the movie data or the error if the request was unsuccessful.
 */
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

/**
 * GET request to the /movies/[Title] endpoint. Retrieves data for a single movie that's title
 * is included in the URL. The request is validated using the jwt strategy. The response contains 
 * either a json object with the data for the movie requested or the error if the request was 
 * unsuccessful.
 */
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

/**
 * GET request to the /movies/genre/[Name] endpoint. Retrieves data for a movie genre that's name
 * is included in the URL. The request is validated using the jwt strategy. The response contains 
 * either a json object with data for the genre requested or the error if the request was unsuccessful.
 */
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

/**
 * GET request to the /movies/director/[Name] endpoint. Retrieves data for a movie director whose
 * name is included in the URL. The request is validated using the jwt strategy. The response
 * contains either a json object with data for the director requested or the error if the request
 * was unsuccessful.
 */
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

/**
 * POST request to the /users endpoint. Creates a new user in the database, using the data provided in
 * the request body, if the data meets validation requirements. If validation fails, returns a json 
 * object containing the errors. If the registration succeeds, returns a json object containing the
 * new user; if unsuccessful, returns the error.
 */
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
  Users.findOne({Username: req.body.Username})
  .then((user) => {
    if(user) {
    res.status(400).send(req.body.Username + ' already exists.');
    } else {
    Users.create({
      Username: req.body.Username,
      // Hashes password before storing in the database
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

/**
 * GET request to the /users/[Username] endpoint. Retrieves data for a single user whose username
 * is included in the URL. The request is validated using the jwt strategy. The response contains 
 * either a json object with the data for the user requested or the error if the request was 
 * unsuccessful.
 */
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

/**
 * DELETE request to the /users/[Username] endpoint. Deletes the database document for a single user 
 * whose username is included in the URL. The request is validated using the jwt strategy. If the user
 * cannot be found, returns a text message saying that the user does not exist. If the user is 
 * successfully deleted, returns a text message confirming the deregistration; if the request was 
 * unsuccessful, returns the error.
 */
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

/**
 * PUT request to the /users/[Username] endpoint. Updates the database document for a single user 
 * whose username is included in the URL using the data provided in the request body. The request 
 * is validated using the jwt strategy. If the data provided in the request body fails validation,
 * returns a json object containing the errors. If the user is successfully updated, returns a json 
 * object with the updated user; if the request was unsuccessful, returns the error.
 */
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

/**
 * GET request to the /users/favourites/[Username] endpoint. Retrieves favourite movies data for a 
 * single user whose username is included in the URL. The request is validated using the jwt strategy.
 * The response contains either a json object with the FavouriteMovies array of the user requested or
 * the error if the request was unsuccessful.
 */
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

/**
 * PUT request to the /users/[Username]/[MovieID] endpoint. Updates the database document for a single
 * user whose username is included in the URL, by adding the MovieID included in the URL to the array
 * of their favourite movies. The request is validated using the jwt strategy. If the update is
 * successful, the mongoose populate method is then used to replace the movie IDs in the response data
 * with the full movie data from the movies collection for each of the favourite movies. A response
 * containing a json object with the updated favourite movie data is returned, or the error if the 
 * request was unsuccessful.
 */
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

/**
 * DELETE request to the /users/[Username]/[MovieID] endpoint. Updates the database document for a single
 * user whose username is included in the URL, by deleting the MovieID included in the URL from the array
 * of their favourite movies. The request is validated using the jwt strategy. If the update is
 * successful, the mongoose populate method is then used to replace the movie IDs in the response data
 * with the full movie data from the movies collection for each of the remaining favourite movies. A 
 * response containing a json object with the updated favourite movie data is returned, or the error if 
 * the request was unsuccessful.
 */
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

// Error handling function to catch any previously uncaught errors and log them to the console
app.use((err, req, res, next) => {
  console.error(err.stack);
}); 
