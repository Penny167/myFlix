/**
 * @file The models file implements schemas for documents held in the movies and users collections in
 * the myFlix database. The schemas are used to create models, which in turn are used in http requests
 * to Api endpoints to create, read, update and delete documents from the database. Mongoose is 
 * connected to the database using the connect method in the index file.
 * @requires mongoose Connects the app to the database and implements data schemas using models.
 * @requires bcrypt Used to implement encryption on user passwords.
 */

const mongoose = require('mongoose'); 
const bcrypt = require('bcrypt');

/** Schema for the movies collection */
let movieSchema = mongoose.Schema({
  Title: {type: String, required: true},
  Description: {type: String, required: true},
  Genre: {
    Name: {type: String, required: true},
    Description: {type: String, required: true}
  },
  Director: {
    Name: {type: String, required: true},
    Bio: {type: String, required: true},
    Birth: String,
    Death: String
  },
  ImagePath: String,
  Featured: Boolean
});

/** Schema for the users collection */
let userSchema = mongoose.Schema({
  Username: {type: String, required: true},
  Password: {type: String, required: true},
  Email: {type: String, required: true},
  Birthday: Date,
  FavouriteMovies: [{type: mongoose.Schema.Types.ObjectId, ref: 'Movie'}]
});

/**
 * Static method to encrypt user passwords. Used when creating or updating users. 
 * Available to each instance of a user created.
 * @param {*} password - The user's password taken from the request body.
 * @returns {string} String containing the encrypted password.
 */
userSchema.statics.hashPassword = (password) => {
  return bcrypt.hashSync(password, 10);
};

/**
 * Custom method used to validate a user's password against the encrypted version in the database
 * when the user attempts to log in. Available to each instance of a user created.
 * @param {*} password - Password submitted by the user when logging in.
 * @returns {boolean} True if the password submitted when encrypted matches the encrypted password
 * taken from the database. 
 */
userSchema.methods.validatePassword = function (password) {
  return bcrypt.compareSync(password, this.Password);
};

/**
 * Creates models for the movies and users database collections using the schemas and stores them in
 * the constants Movie and User.
 */
let Movie = mongoose.model('Movie', movieSchema);
let User = mongoose.model('User', userSchema);

module.exports.Movie = Movie;
module.exports.User = User;