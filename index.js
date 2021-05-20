const mongoose = require('mongoose');
const Models = require('./models.js');
const Movies = Models.Movie;
const Users = Models.User;
const express = require('express');
// Adding morgan
const morgan = require('morgan');
const app = express();
app.use(express.json());

mongoose.connect('mongodb://localhost:27017/myFlixDB', {useNewUrlParser: true, useUnifiedTopology: true});

// Setting up the server
app.listen(8080,() => {
  console.log('The server is listening on port 8080')
});

// Return a list of all movies
app.get('/movies', (req, res) => {
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
app.get('/movies/:Title', (req, res) => {
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
app.get('/movies/:Genre/:Name', (req, res) => {
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
app.get('/movies/:Director/:Details/:Name', (req, res) => {
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
app.post('/users', (req, res) => {
  Users.findOne({Username: req.body.Username})
  .then((user) => {
    if(user) {
    res.status(400).send(req.body.Username + ' already exists.');
    } else {
      Users.create({
        Username: req.body.Username,
        Password: req.body.Password,
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
app.delete('/users/:Username', (req, res) => {
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
app.put('/users/:Username', (req, res) => {
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
app.put('/users/:Username/:MovieID', (req, res) => {
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
app.delete('/users/:Username/:MovieID', (req, res) => {
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






/* Using morgan to log requests
app.use(morgan('common'));

// Routing the request for the JSON object
app.get('/movies',(req, res) => {
  res.json(topTenMovies);
});

// Creating a second endpoint, to '/', with textual response
app.get('/',(req,res) => {
  res.send('Welcome to myFlix!');
});

// Using express.static to serve documentation file from the public folder
app.use(express.static('public'));

// Error handling function to log errors to the console
app.use((err, req, res, next) => {
  console.error(err.stack);
}); */
