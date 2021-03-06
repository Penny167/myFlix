/**
 * @file Contains code to establish a local connection to the database if needed, for testing any changes
 * before updating the live Api hosted on Heroku. Also contains basic versions of the express requests. 
 * These were used on in-memory data as practice, prior to implementing requests that use authentication 
 * and models to query data held in the database.
 */

// Copying out local connection but retaining for test purposes
// mongoose.connect('mongodb://localhost:27017/myFlixDB', {useNewUrlParser: true, useUnifiedTopology: true});

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
