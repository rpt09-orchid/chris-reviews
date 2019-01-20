# Firebnb reviews

> This is the reviews microservice for the Airbnb clone, Firebnb

## 1.1. Related Projects


  - [rooms](https://github.com/rpt09-orchid/meng-rooms) *:3001*
  - [gallery](https://github.com/rpt09-orchid/allen-gallery) *:3002*
  - reviews [current] *:3003*
  - [booking](https://github.com/rpt09-orchid/jon-booking) *:3004*
  
## 1.2. Table of Contents
<!-- TOC -->

- [1. Firebnb reviews](#1-firebnb-reviews)
  - [1.1. Related Projects](#11-related-projects)
  - [1.2. Table of Contents](#12-table-of-contents)
  - [1.3. Usage](#13-usage)
    - [1.3.1. API endpoints](#131-api-endpoints)
    - [1.3.2. Component](#132-component)
  - [1.4. Development Setup](#14-development-setup)
  - [1.5. Log](#15-log)
    - [1.5.1. Development setup (+ Refactoring)](#151-development-setup--refactoring)

<!-- /TOC -->
## 1.3. Usage
This App is part of an Airbnb clone.  
This service/ component is the reviews service, which consists of two main aspects: displaying reviews, and searching for reviews.  
In order to display the proper data to the user, the endpoints below are used:

### 1.3.1. API endpoints
- `/reviews/:id` 
  - returns all data (reviews, users, ratings)
- `/reviews/:id?search=true&keyWords=word1,word2...` 
  - returns reviews with included keyWords
- `/reviews/:id?search=false` 
  - returns all reviews
- `/ratings/:id` 
  - returns average rating and number of reviews.  

### 1.3.2. Component
The Reviews component has the two main features (displaying reviews and allows searching).  Secondary features includes displaying a ...see more for text with 280 characters or greater, and pagination for quanities of reviews of greater than 7.  

## 1.4. Development Setup
This service uses the following dev stack:

 - Server: node / NPM
 - Deployment: ??
 - Client: react
 - DB: PostgreSQL (installed via brew)
 - Testing: jest
 - Important Libs:
   - faker.js
   - jw-react-pagination
 
Postgres can be installed through homebrew.  For more information, see [postgres install guide](https://www.digitalocean.com/community/tutorials/how-to-install-and-use-postgresql-on-ubuntu-18-04)

Inside `.env` place your Server + SQL credentials
```
HOST=localhost
PORT=3003
DB_NAME=firebnb-reviews
DB_HOST=localhost
DB_PORT=5432
DB_USER=
DB_PASS= 
```  

Installing

```sh
## install npm dependencies in both server and client folders
$> cd /path/to/reviews-service
$> npm install
$> cd client/ && npm install
# install and start service (if no brew, see above note!)
$> brew install PostgreSQL
$> brew services start postgresql
# create the db with `createdb` command
$> createdb firebnb-reviews
# seed  db, this will also download jpegs and upload to S3 so make sure you ahve your credentials in your .env
$> npm run seed-database
$> psql firebnb-reviews #to enter psql repl,  to confirm creation
$ (repl)> \dt; #to show all tables (should see 'paths now)
$ (repl)> \q; #to exit repl
```  


``` sh
$> npm test #synonymous with jest
# To execute:
$> npm start #should be running on 3003
# To build in react:
$> npm run start (builds once to /dist)
$> npm run build (builds once to /dist with minified version)
# or for watching file changes
$> npm run start-client (builds to /dist with --watch flag)
```


## 1.5. Log

### 1.5.1. Development setup (+ Refactoring)

**Readme Refactor**

First thing was to get setup from [original repo](https://github.com/rpt09-mulder/reviews). I ran into a few snags due to missing README content such as:

  - explicit .env values needed or that should be specified
  - npm install in client folder as well
  - missing css-loader and style-loader in dev dependencies for client folder
  - S3 bucket setup (which i later gutted as not needed for this service)
  - having to create tables by  using `db\postgres.sql` as a dump. I introduced this into the seed script

**Refactor Tests**


The tests seemed to be broken mainly due to some route issues probably not address later on in development so had to refactor these slightly.

**React componeent**

For react dev there was also hardcoded prduction urls that I took out to and converted into env variables, using `localhost` if in development and `http://[random-production-url-to-be-determined]/` if in production. This was stored at top level and passed down to apps that needed the `HOSTS` vars. This allows to test on client side. Some refactoring to proxy also had to occur which can be seen [here](https://github.com/rpt09-orchid/chris-proxy/commit/6a900c2cbd3fa87a48996f21ef43f157dbedbcd3).  
The code for looks something like this:

``` js
// in root level APP.jsx constructor
if (process.env.NODE_ENV === 'production') {
  this.HOSTS = {
    reviews: 'http://firebnb-reviews.8di9c2yryn.us-east-1.elasticbeanstalk.com',
    rooms: 'http://[to-be-determined]/'
  }
} else {
  this.HOSTS = {
    reviews: 'http://localhost:3003',
    rooms: 'http://localhost:3001'
  }
}

```

**Gutting S3 Requirements**

Previously there was an S3 bucket requirement for a `users` table profile images. But later I found the `user` service is part of another service's (`rooms`) jurisdiction. This then became unnnecessary and was only use to supply urls that aren't needed so I removed this requirement in seeding db and will remove associated functions involving this for the future. This keeps seeding a lot more simple and I can completely remove this table leaving only `reviews` and `ratings`. I will likely also have to check client/server app and refactor if using anything from this table...
