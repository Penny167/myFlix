/** 
 * @file The index file creates the Express application, sets up the server and implements routes to Api
 * endpoints used to access myFlix data. Requests made to these endpoints use mongoose models created in the 
 * models file and are authenticated using strategies implemented in the passport file. The connect method 
 * establishes a connection between mongoose and the database, which is hosted on MongoDB Atlas. The 
 * server and endpoints are hosted on Heroku.
 
 * @requires mongoose Connects the app to the database and implements data schemas using models.
 * @requires Models File where data schemas and models are defined.
 * @requires express Used to create an express application.
 * @requires morgan Used to log requests made to the database.
 * @requires passport Used to create strategies for authenticating and authorising requests to the Api endpoints.
 * @requires auth File implementing the user login route.
 * @requires cors Used to control origins from which requests to the server can be made.
 * @requires express-validator Used to perform validation on data provided when creating or updating a user.
 */
 
const mongoose = require('mongoose');
const Models = require('./models.js');
const Movies = Models.Movie;
const Users = Models.User;
const express = require('express');
const morgan = require('morgan');
const passport = require('passport');
const auth = require('./auth.js');
const cors = require('cors');
const {check, validationResult} = require('express-validator');

// Call the express function to create the application
const app = express();

// Run passport file where strategies are implemented
require('./passport.js');

// Use built in middleware function to parse request bodies as json
app.use(express.json());

// Connects mongoose to the myFlix database
mongoose.connect(process.env.CONNECTION_URI, {useNewUrlParser: true, useUnifiedTopology: true});

// Create a reference to the port on the hosted server
const port = process.env.PORT || 8080;

// Set up the server
app.listen(port, '0.0.0.0',() => {
  console.log('The server is listening on port ' + port);
});

// Implement morgan to log requests
app.use(morgan('common'));

// Implement express.static to serve the documentation file from the public folder
app.use(express.static('public'));

// Implement cors to allow requests from all origins
app.use(cors());

/**
 * API endpoints. Example request and response bodies are provided in the documentation.html file.
 */

/**
 * POST request to the log in endpoint implemented in the auth file.
 */ 
auth(app);

/**
 * All http requests in express take a callback function as a parameter. The function takes as parameters
 * the request and response objects, which can then be used to access the data associated with the request.
 * This callback type will be named: 'requestCallback'.
 * @callback requestCallback
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */

/**
 * Some endpoints are protected. The second parameter of requests made to these endpoints invokes a named 
 * authentication strategy. If authentication succeeds, the authenticated user is attached to the request 
 * object and the request callback is fired. This callback type will be named: 'authenticationCallback'.
 * @callback authenticationCallback
 * @param {string} strategy - the name of the passport strategy used.
 * @param {Object} config - configuration object. Used here to specify that sessions are not used.  
 */

/**
 * GET request to the landing page ('/') endpoint.
 * @method GET
 * @param {string} URL 
 * @param {requestCallback}
 * @returns {string} The welcome message.
 */ 
app.get('/',(req,res) => {
  res.send('Welcome to myFlix!');
});

/**
 * POST request to the /users endpoint to create a new user record. This request requires a request 
 * body containing the fields: Username, Password, Email, Birthday. The fields are first validated 
 * against specified validators before the new user record is created.
 * @method POST 
 * @param {string} URL
 * @param {object} validationChain Series of checks that validate specified fields in the request body.
 * @param {requestCallback}
 * @returns {Object} An object containing the new user record.
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
 * GET request to the /users/[Username] endpoint.
 * @method GET 
 * @param {string} URL
 * @example /users/myusername
 * @param {authenticationCallback} 
 * @param {requestCallback}
 * @returns {Object} An object containing the record for the user included in the URL. The mongoose
 * populate method is used to modify the favourite movies array on the response object, to return the
 * documents for the favourite movies, instead of their IDs.
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
 * PUT request to the /users/[Username] endpoint to update the user's details. This request requires 
 * a request body containing the fields: Username, Password, Email, Birthday. The fields are first 
 * validated against specified validators before the user record is updated.
 * @method PUT
 * @param {string} URL
 * @example /users/myusername
 * @param {object} validationChain Series of checks that validate specified fields in the request body.
 * @param {authenticationCallback}
 * @param {requestCallback}
 * @returns {Object} An object containing the updated user record.
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
 * DELETE request to the /users/[Username] endpoint.
 * @method DELETE
 * @param {string} URL
 * @example /users/myusername
 * @param {authenticationCallback} 
 * @param {requestCallback}
 * @returns {string} A text message: '[Username] has been deregistered'.
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
 * GET request to the /users/favourites/[Username] endpoint.
 * @method GET 
 * @param {string} URL
 * @example /users/favourites/myusername
 * @param {authenticationCallback} 
 * @param {requestCallback}
 * @returns {Object} An array of the IDs of the user's favourite movies.
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
 * PUT request to the /users/[Username]/[MovieID] endpoint.
 * @method PUT 
 * @param {string} URL
 * @example /users/myusername/60a110a28e923350a5340b06
 * @param {authenticationCallback} 
 * @param {requestCallback}
 * @returns {Object} An array with the user's updated favourite movies. The mongoose populate method 
 * is used to replace the ID of each movie with the document from the movies collection.
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
 * DELETE request to the /users/[Username]/[MovieID] endpoint.
 * @method DELETE 
 * @param {string} URL
 * @example /users/myusername/60a110a28e923350a5340b06
 * @param {authenticationCallback} 
 * @param {requestCallback}
 * @returns {Object} An array with the user's updated favourite movies. The mongoose populate method 
 * is used to replace the ID of each movie with the document from the movies collection.
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

/**
 * GET request to the /movies endpoint.
 * @method GET
 * @param {string} URL
 * @param {authenticationCallback} 
 * @param {requestCallback}
 * @returns {Object} An array of all the movie records in the database.
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
 * GET request to the /movies/[Title] endpoint.
 * @method GET
 * @param {string} URL
 * @example /movies/The Godfather
 * @param {authenticationCallback} 
 * @param {requestCallback}
 * @returns {Object} An object containing the movie record for the movie whose title is included in the URL. 
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
 * GET request to the /movies/genre/[Name] endpoint.
 * @method GET 
 * @param {string} URL
 * @example /movies/genre/Biopic
 * @param {authenticationCallback} 
 * @param {requestCallback}
 * @returns {string} A text description for the movie genre included in the URL. 
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
 * GET request to the /movies/director/[Name] endpoint.
 * @method GET 
 * @param {string} URL
 * @example /movies/director/David Lean
 * @param {authenticationCallback} 
 * @param {requestCallback}
 * @returns {Object} An object containing the data for the movie director included in the URL.
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

// Error handling function to catch any previously uncaught errors and log them to the console
app.use((err, req, res, next) => {
  console.error(err.stack);
}); 
