const express = require('express');
const app = express();

app.use(express.json());

//set up in memory array of users for testing
let users = [
];

//set up in memory array of movies
let movies = [
  {
    title: 'The Godfather',
    description: 'Epic crime drama detailing the rise and fall of a mafia family in America',
    genre: 'Drama',
    director: 'Francis Ford Coppola',
    imageUrl: '#'
  },
  {
    title: 'Lord of the Rings: The Fellowship of the Ring',
    description: 'In this first part of the epic fantasy trilogy, a young hobbit and 8 companions set out to destroy the Ring of Power',
    genre: 'Fantasy adventure',
    director: 'Peter Jackson',
    imageUrl: '#'
  },
  {
    title: 'Indochine',
    description: 'Epic romance set against the decline of European imperialism in Indochina',
    genre: 'Period drama',
    director: 'Regis Wargnier',
    imageUrl: '#'
  },
  {
    title: 'Out of Africa',
    description: 'In 20th-century colonial Kenya, a Danish plantation owner has a passionate love affair with a free-spirited big-game hunter',
    genre: 'Romantic drama',
    director: 'Sydney Pollack',
    imageUrl: '#' 
  },
  {
    title: 'Elizabeth',
    description: 'Oscar-winning portrayal of the early years of the reign of Elizabeth I',
    genre: 'Period biopic',
    director: 'Shekhar Kapur',
    imageUrl: '#'  
  }
];

// set up in memory array of directors for testing
let directors = [
  {
    name: 'Sydney Pollack',
    bio: 'Sydney Pollack was an Academy Award-winning director, producer, actor, writer and public figure, who directed and produced over 40 films.',
    birthYear: 1934,
    deathYear: 2008
  }
];

// Returns data about all movies
app.get('/movies', (req,res) => {
  res.json(movies);
});

// Returns data about a single movie searched by title
app.get('/movies/:title', (req, res) => {
  res.json(movies.find((movie) => {
    return movie.title === req.params.title
  }));
});

// Returns the movie genre for a movie searched by title
app.get('/movies/:title/:genre', (req, res) => {
  let movie = movies.find((movie) => { return movie.title === req.params.title});
  if (movie) {
    res.send(movie.title + ' is a ' + movie.genre);
  } else {
    res.status(400).send('This movie is not in the myFlix database');
  }
});

// Returns data about a director searched by name
app.get('/directors/:name', (req, res) => {
  res.json(directors.find((director) => {
    return director.name === req.params.name
  }));
});

//Registers a new user
app.post ('/users', (req, res) => {
  let newUser = req.body;

  if (!newUser.username) {
    const message = 'You have not submitted a username';
    res.status(400).send(message);
  } else {
    users.push(newUser);
    res.status(201).send('Registration successful!');
  }
});

// Updates a users username
app.put('/users/:username/:newUsername', (req, res) => {
  let user = users.find((user) => {return user.username === req.params.username});

  if (user) {
    user.username = req.params.newUsername;
    res.send('Username updated!');
  } else {
    res.status(404).send('Username not found');
  }
});

// Adds a movie to users list of favourites
app.put('/users/:username/:favourites/:newFavourite', (req, res) => {
  let user = users.find((user) => {return user.username === req.params.username});

  if (user) {
    user.favourites.push(req.params.newFavourite);
    res.send(req.params.newFavourite + ' was added to favourites');
  } else {
    res.status(404).send('Username not found');
  }
});

// Deletes a movie from users list of favourites
app.delete('/users/:username/:favourites', (req, res) => {
  let user = users.find((user) => {return user.username === req.params.username});

  if (user) {
    let favourites = user.favourites;
    let index = favourites.indexOf(req.params.favourites);
    if (index > -1) {
      favourites.splice(index, 1);
    }

    res.send(req.params.favourites + ' was removed from favourites');
  } else {
    res.status(404).send('Username not found');
  }
});

// Deregisters a user
app.delete('/users/:username', (req, res) => {
  let user = users.find((user) => {return user.username === req.params.username});

  if(user) {
    users = users.filter((obj) => {return obj.username !== req.params.username});
    res.send('User ' + req.params.username + ' was deleted');
  }
});

app.listen(8080, () => {
  console.log('Your app is listening on port 8080');
});