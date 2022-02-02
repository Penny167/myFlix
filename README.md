# myFlix 🎬

myFlix is a **REST API** that interacts with a non-relational database to provide a **complete back end for a movie web application**. The database contains a movies collection holding data about a variety of classic films, as well as a users collection with data about registered users of applications that consume the API. 

A variety of CRUD operations can be performed on the data by sending HTTP requests to the API endpoints. These are documented in detail here: [myFlix API endpoints](https://intense-depths-38257.herokuapp.com/documentation.html).

- A movie app that implements myFlix with a front end built using React is available [here](https://github.com/Penny167/myFlix-client).

- A movie app with a front end built using Angular is available [here](https://github.com/Penny167/myFlix-Angular-client).

- myFlix was built using Node.js and the Express framework and is hosted on [Heroku](https://www.heroku.com/platform). The database is hosted on [MongoDB Atlas](https://www.mongodb.com/atlas/database). 

- Full application documentation is included in the [out](https://github.com/Penny167/myFlix/tree/main/out) folder of the project repository.

## Key Features

- The API is an Express application with a server that connects to a non-relational database.
- Schemas created using Mongoose define the structure of the database records for each collection. The schemas are implemented via models used within HTTP request handlers. 
- The API endpoints handle HTTP requests to perform a variety of CRUD operations on the data. User records can be created, read, updated and deleted. Movie data can be read. User records include an array of favourite movies and endpoints exist to allow users to add or remove movies from their favourites. 
- Requests to endpoints are protected by authentication and authorisation strategies implemented using Passport and jsonwebtoken.
- Data validation checks are performed when creating and updating user records using express-validator.

## Technologies used

- Node
- Express
- Mongoose
- Passport
- jsonwebtoken
- MongoDB Atlas
- Heroku

## Installation and set up

This project requires Node.js to be installed. The documentation can be found [here](https://nodejs.org/en/).

To install myFlix run: 
```
npm install
```
- This will provide the code and modules required to set up myFlix. Next, you will need to create a unique database for your specific project and decide where your API will be hosted. 

- A database can be created and hosted locally using MongoDB or hosted using MongoDB Atlas, where you can also create databases and collections directly. In order to recreate myFlix, two collections must be created: movies and users. Movies can be populated with movie data of your choice following the movieSchema defined in the models.js file. Similarly, any manual user records created should follow the userSchema.

- Once the database has been set up, the mongoose connect method in the index.js file must be updated to replace the current URI string with the URI of your database. Similarly, the port reference defined when setting up the server must be configured to reflect where the API is hosted. In the current code, the database URI and port number reference environment variables stored on Heroku and it is recommended environment variables saved outside git are used for these values to keep your application secure.

To launch myFlix locally run:
```
npm start
```
## Author
Github: [@penny167](https://github.com/Penny167)











