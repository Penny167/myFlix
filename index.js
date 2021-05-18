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
