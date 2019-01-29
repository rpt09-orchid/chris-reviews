# 1. Firebnb reviews

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
    - [1.5.2. Million Records (2 Tables of 10million)](#152-million-records-2-tables-of-10million)
    - [1.5.3. nd Database](#153-nd-database)
    - [1.5.4. Comparison](#154-comparison)

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
# NOTE: for cassandra see installation and setup in log below
# create the db with `createdb` command
$> createdb firebnb-reviews
# seed  db,make sure you ahve your credentials in your .env
$> npm run seed-database
# Pfor 10 million records each for reviews and ratings..
# postgres do.. 
$> npm run megaseed
# cassandra do.. 
$> npm run megaseed --db=cassandra
$> psql firebnb-reviews #to enter psql repl,  to confirm creation
$ (repl)> \dt; #to show all tables (should see 'paths now)
$ (repl)> \q; #to exit repl
```  


``` sh
$> npm test #synonymous with jest
# To execute (load postgres db):
$> npm start #should be running on 3003
# Excecute (load cassandra db)
$> npm start --db=cassandra
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

### 1.5.2. Million Records (2 Tables of 10million)

** stats **

Ok to do the records in postgresql I used  `COPY` WITH CSV Format. The trick was to use only minimum amount of `1000` records, save that to CSV, and then repeat the `COPY` command on the same records over and over again (batches) until 10 million is achieved. This resulted in roughly about `10,000,000` records in `2.5 minutes` on my macbook pro. Doing more unique records, like `50,000`, this resulted in longer csv processing, and about `5 minutes` of processing.

Further more I needed `ratings` table as well as my primary `reviews` and was able to generate `20 million` in about `6 minutes`. All of these settings can be adjusted in the `megaseed.js` file like so:

``` js
const UNIQUE_RECORDS = 1000;
const TOTAL_RECORDS = 10000000;
const MAX_USER_ID = 1000000;
const MAX_PROPERTY_ID = 1000000;
```

**.env woes**

One annoying thing I ran into was my `.env` was in the root, and for the longest time `psql` was not throwing any connection errors, likely becuase it is loose with its credential requirements, but I couldnt figure out for the life of me why it wasn't updating the db. After change the config path like so:

``` js
// after resolving the path to the parent location, everything started working correctly
require('dotenv').config({path: path.resolve(__dirname + '/../.env')});
```

**console visuals**

![loading_visuals](http://g.recordit.co/PMgAFLKnQK.gif)

Also for fun I made the progress bar and colors in order to appease the waiting process. Turns out console.log had a little to no effect to overall wait times.

![finished](https://i.imgur.com/4eiaSdqr.png)

**specifying ids, replacing in csv**
if you do need unique ids for an entry outside of just  1000 unique ids, you could opt to try a replace file io routine on csv. I replaced an entry’s `property_id`, `id`, and `review_id` which is determined to be 'replaceable' by surrounding with curly braces. using a regex to add 1000 every batch to this first column of `aka id + 1000` and rewrote the file. definitely slower `8 minutes for 20 million` but  worked as an an option. It looks like this:

``` js
  for (let j of [...Array(iterations).keys()]) {
    // swap {number} to number + 1000 * iteration in csv file
    csv = origCsv.replace(/\{\d+\}/g, (val) => {
      return Number(val.replace(/\{|\}/g, '')) + (j * UNIQUE_RECORDS);
    });
```

### 1.5.3. nd Database

**installation**
I chose Cassandra as my 2nd database which is noSQL and also very performance focused and used by facebook, Netflix and ebay for large amounts of records and horizontal scaling.
To start I Installed and tested by doing the following. THis tutorial also was very nice : [Cassandra Tutorial from tutorialspoint](https://www.tutorialspoint.com/cassandra/cassandra_introduction.htm)


**Note: if in your python shell the arrow keys print characters when typed..you might need to create a symlink to readline lib that your have something like: `ln /usr/local/opt/readline/lib/libreadline.dylib /usr/local/opt/readline/lib/libreadline.7.dylib`
``` sh
# latest python (if dont have)
$> brew install python
# cassandra shell
$> pip install cql
# start it up
$> brew services start cassandra
# gointo shell, if error see next section about connection refused
$> cqlsh
# create and confirm creation of keyspace (keypsace is kind of similar to creating a database in sql)
$ cqlsh> CREATE KEYSPACE firebnbreviews WITH replication = {'class':'SimpleStrategy', 'replication_factor' : 1};
$ cqlsh> DESC KEYSPACES
$ cqlsh> USE firebnbreviews
# ok so the rest of this is if you just want to get familiar with the cql shell if not just exit...
$ cqlsh:firebnbreviews> USE firebnbreviews
# just to get familiar with shell and cassandra commands we'll add a table, insert, and drop it 
# here is a person table
$ cqlsh:firebnbreviews> CREATE TABLE persontest ( id int PRIMARY KEY, lastname text, firstname text );
$ cqlsh:firebnbreviews> INSERT INTO persontest (id,  lastname, firstname) VALUES(1, 'Malcolm', 'Chris');
$ cqlsh:firebnbreviews> SELECT * FROM persontest;
# you should see 
#  id | firstname | lastname
# ----+-----------+----------
#   1 |     Chris |  Malcolm
# k drop it we done here
$ cqlsh:firebnbreviews> DROP TABLE persontest;
# leave cqlsh
$ cqlsh:firebnbreviews> exit;
$> #back to reality
```

**connection refused if java 9**

I ran into an issue where it refused connection. Diving deeper, it seems if you type below it would spit out `Improperly specified VM option 'ThreadPriorityPolicy=42'`. Doing some googling this was becuase of java 9 instead of 8

``` sh
# reveal why its failing (if it is), or start it uP!
$> cassandra
# spit out a bunch of stuff Improperly specified VM option 'ThreadPriorityPolicy=42'
# java 9 has issues , revert to java 8, see if you have it 
$> /usr/libexec/java_home -V #prints java versions...i just had 9
# install java8
$> brew cask install java
$> brew tap caskroom/versions
$> brew cask install java8
# now you should have versions 8 and 9
$> /usr/libexec/java_home -V #prints java versions...i just had 9
``` 

Then add this line to you `~/.bash_profile` to change default java to 8
``` sh
# java 8
export JAVA_HOME='/Library/Java/JavaVirtualMachines/jdk1.8.0_202.jdk/Contents/Home'
```

**CQL**

cql, the query language of cassandra was actually pretty close to sql minus the relational part or joins. they even have a COPY routine for batch inserts. I thought this was very nice.

**other issues**

Other issues I ran into with cassandra was that cassandra’s  COPY routine is actually significantly slower than postgres sql if ran as a query over and over again. I read because `cqlsh`, the shell and tool with COPY is python based and so its an interpreted language it has to do a bunch of function name looks ups and what not every time. probably would take an` hour and a half for 10 million`..not to mention i had to execute this copy routine through `child subprocess exec shell command` because copy is not supported in the node driver…the looping over this execution causes the slowness not the actual copying i realized. thank god  cass supports passing a comma seperated list of csv files, so i can do batches.

So what i did was set a CSV_BATCH_SIZE of n (currently 100 csvs), it would generate 100 csvs of 10000 records, then do the copy routine with these. wipe em out and do another batch until we done. likely if i made even a larger batch size it would be even faster.

.. you can pass multiple csvs in cassandra’s `COPY` which looks like `COPY firebnbreviews.review (..fields) FROM 'batch-1.csv, batch-2.csv, batch-3.csv, ..'` etc which is pretty fast on my machine , after this change clocking in around `20 million in  a little over 13 minutes with 15,000 uniques`…so slightly longer than postgresql.

**even more issues**

I also was getting write timeouts occassionally so had to adjust the `cassandra.yaml` `writeTimeout` setting. I 10x'd it from `20000` to `20000` ms. that fixed this issue.

I also had drive issues running out of space, because on any creation of a table , cassandra creates data snapshots and backups which turned out to eat up my entire disk and just cause db instability crashing all the time. Clearing this out solved it but two nice commands to know were:

``` sh
# remove all data cached files taking up tons of memory and creating issues with future loads
$> data cd /usr/local/var/lib/cassandra/data/firebnbreviews && rm -rf ./*
# kill cassandra daemon and restart !
$> pgrep -f cassandra | xargs kill -9 && cassandra
```
### 1.5.4. Comparison

**command line flags**
To ease the megaseed process i made a flag for triggering a cassandra bulk load vs postgresql,

``` sh
# Pfor 10 million records each for reviews and ratings..
# postgres do.. 
$> npm run megaseed --db=psql
# cassandra do.. 
$> npm run megaseed --db=cassandra
# similarly for starting up node
# postgres do.. 
$> npm start --db=psql
# cassandra do.. 
$> npm start --db=cassandra

```

**indexing and primary/cluster keys**

Indexing was key to speeding up query times and joins. I introduced an index on `property_id` for postgresql  and index and added it as a `cluster key` for cassandra. This greatly sped up requests, as without this my read requests would timeout.

***PSQL vs. Cassandra**
Overall psql was faster for insertion and pretty close read times after this test as a monolith, although with horizontal decentralized scaling of cassandra, with more requests I hace a feeling it might be ther better option. Below you can see the results.

- Postgresql: `449s` *~7.5minutes* (15,0000 unique records, 20,0000,0000 records, 1 CSV overritten over and over 15,0000 each)
- Cassandra: `786s` *~13minutes* (15,0000 unique records, 20,0000,0000 records, 100 CSV batches of 15,0000)

![bulkload](https://i.snag.gy/PbKNq2.jpg)

![time](https://i.snag.gy/cErtou.jpg)