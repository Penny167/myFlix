# myFLix

myFlix is a REST API that interacts with a database hosted on MongoDB Atlas to provide a complete back end for a movie web application. The database contains a movies collection with data about a variety of classic films, as well as a users collection with data about registered users of applications that consume the API. The API can be used to perform a variety of CRUD operations on the data by sending HTTP requests to the API endpoints. These are documented in detail here: 

An example movie web application that implements myFlix with a front end built using React is available here.
An example movie web application that implements myFlix with a front end built using Angular is available here.

The API is hosted on Heroku. It was built using Node.js and the Express framework.

## Key Features

- myFlix implements a server and connects it to a non-relational database that holds data about movies and users.
- Data is organised using defined schemas implemented by models.
- A number of API endpoints are available to perform CRUD operations on the movie and user data. User records can be created, read, updated and deleted. Movie data can be read and users can add or remove "favourite" movies to or from their user records.
- Requests to endpoints are protected by authentication and authorisation strategies implemented using Passport and jsonwebtoken.
- Data validation checks are performed when creating and updating user records using express-validator.

## Technologies used

- NODE
- EXPRESS
- MONGODB
- MONGOOSE
- PASSPORT
- JWT
- EXPRESS-VALIDATOR
- HEROKU

## Installation and set up

To install myFlix run 
```
npm install
```
This will provide the code and modules required to create myFlix. Next, you will need to set up a unique database for your specific project and decide where the API will be hosted. 

A database can be created and hosted locally using MongoDB or hosted using MongoDB Atlas, where you can also create databases and collections directly. In order to recreate myFlix, two collections must be created: movies and users. Movies can be populated with movie data of your choice, following the movieSchema defined in the models.js file. Similarly, any manual user records created should follow the userSchema.

Once the database has been set up, the mongoose connect method in the index.js file must be updated to replace the current URI string with the URI of your database. Similarly, the port reference defined when setting up the server must be configured to reflect where the API is hosted. In the current code, the database URI and port number reference environment variables stored on Heroku and it is recommended environment variables saved outside git are used to keep your application secure.

To launch myFlix locally run
```
npm start
```
## AUTHOR
Github [@penny167](https://github.com/Penny167)











