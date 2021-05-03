const express = require('express');
const app = express();

// Creating a JSON object with the names of my top 10 movies
let topTenMovies = [
  {
    name: 'The Godfather'
  },
  {
    name: 'The Fellowship of the Ring'
  },
  {
    name: 'Out of Africa'
  },
  { 
    name: 'Indochine'
  },
  {
    name: 'Elizabeth'
  },
  {
    name: 'Casablanca'
  },
  {
    name: 'Doctor Zhivago'
  },
  {
    name: 'Ghandi'
  },
  {
    name: 'Amadeus'
  },
  {
    name: 'Moonstruck'
  }
];

// Setting up the server
app.listen(8080,() => {
  console.log('The server is listening on port 8080')
});

// Routing the request for the JSON object
app.get('/movies',(req, res) => {
  res.json(topTenMovies);
});