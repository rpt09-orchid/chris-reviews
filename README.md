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
    - [1.4.1. Cassandra setup](#141-cassandra-setup)
    - [1.4.2. Postgres setup (Not primary)](#142-postgres-setup-not-primary)
    - [1.4.3. React build setup](#143-react-build-setup)
  - [1.5. Log](#15-log)
    - [1.5.1. Development setup (+ Refactoring)](#151-development-setup--refactoring)
    - [1.5.2. Million Records (2 Tables of 10million)](#152-million-records-2-tables-of-10million)
    - [1.5.3. Cassandra: Second Database](#153-cassandra-second-database)
    - [1.5.4. Comparison](#154-comparison)
    - [1.5.5. CRUD (Create) UI and autoincrementing with Cassandra](#155-crud-create-ui-and-autoincrementing-with-cassandra)
    - [1.5.6. Deployment Docker-compose](#156-deployment-docker-compose)
    - [1.5.7. Local Load testing (Artillery)](#157-local-load-testing-artillery)
    - [1.5.8. Deployed Load testing (Loader.io)](#158-deployed-load-testing-loaderio)
    - [1.5.9. Analysis  (new relic)](#159-analysis--new-relic)
    - [1.5.10. Horizontally scale](#1510-horizontally-scale)
    - [1.5.11. Nginx Load balancer + multi instance](#1511-nginx-load-balancer--multi-instance)
    - [1.5.12. Final optimized results](#1512-final-optimized-results)

<!-- /TOC -->
## 1.3. Usage
This App is part of an Airbnb clone.  
This service/ component is the reviews service, which consists of two main aspects: displaying reviews, and searching for reviews.  
In order to display the proper data to the user, the endpoints below are used:

### 1.3.1. API endpoints
- `GET /reviews/:id` 
  - returns all data (reviews, users, ratings)
- `POST /reviews/:id` 
  - post a review to specified id (see below** for json data format)
- `GET /reviews/:id?search=true&keyWords=word1,word2...` 
  - returns reviews with included keyWords
- `GET /reviews/:id?search=false` 
  - returns all reviews
- `GET /ratings/:id` 
  - returns average rating and number of reviews.  

**Specified format should be JSONified string as follows:

``` json
{
    "review_body": "This is the body text of review",
    "user_id": "5",
    "user_ratings": {
        "acc": 2,
        "com": 3,
        "cle": 3,
        "loc": 3,
        "chk": 4.5,
        "val": 3
    },
    "property_id": "5"
}

```

### 1.3.2. Component
The Reviews component has the two main features (displaying reviews and allows searching).  Secondary features includes displaying a ...see more for text with 280 characters or greater, and pagination for quanities of reviews of greater than 7.  

## 1.4. Development Setup
This service uses the following dev stack:

 - Server: node / NPM
 - Deployment: ec2 / docker / docker-compose
 - Client: react
 - DB: Cassandra
 - Testing: jest
 - Important Libs:
   - faker.js
   - jw-react-pagination
 
Postgres can be installed through homebrew.  For more information, see [postgres install guide](https://www.digitalocean.com/community/tutorials/how-to-install-and-use-postgresql-on-ubuntu-18-04)




### 1.4.1. Cassandra setup

**cassandra**

For more indepth information check out [1.5.3. Cassandra: Second Database](#153-cassandra-second-database) Section in log.

Inside `.env` + also `.env.production`, place your DB Name credentials for each environmnent. 

```
HOST=localhost
PORT=3003 (80 in production)
DB_NAME=firebnb-reviews
DB_HOST=localhost
DB_PORT=5432
DB_USER=
DB_PASS=
DATACENTER=dc1
NETWORK_MODE=host
CASSANDRA_DB_NAME=firebnbreviews
NEW_RELIC_APP_NAME=[name]
NEW_RELIC_LICENSE_KEY=[hash]
```

``` sh
# latest python (if dont have)
$> brew install python
# cassandra shell
$> pip install cql
# start it up
$> brew install cassandra
$> brew services start cassandra
# gointo shell, if error see next section about connection refused
$> cqlsh
# create and confirm creation of keyspace (keypsace is kind of similar to creating a database in sql)
$ cqlsh> CREATE KEYSPACE firebnbreviews WITH replication = {'class':'SimpleStrategy', 'replication_factor' : 1};
$ cqlsh> DESC KEYSPACES
# cassandra do.. 
$> npm run megaseed
# Excecute (load cassandra db)
$> npm start
```

### 1.4.2. Postgres setup (Not primary)

**postgres:**

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


Installing + seeding

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
# great now check if you're in
$> psql firebnb-reviews #to enter psql repl,  to confirm creation
$ (repl)> \dt; #to show all tables
$ (repl)> \q; #to exit repl
# seed  db,make sure you ahve your credentials in your .env
# postgres do.. 
$> npm run megaseedPsql
# to test
$> npm test #synonymous with jest
# To execute (load postgres db):
$> npm startPsql #should be running on 3003
```  

### 1.4.3. React build setup

**React build**
``` sh
# To build in react, go to client folder package.json:
$> npm run start #(builds once to /dist)
$> npm run build #(builds once to /dist with minified version)
# or for watching file changes, from root
$> npm run buildWatch #(builds to /dist with --watch flag)
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

### 1.5.3. Cassandra: Second Database

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
$> brew install cassandra
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

I also was getting write timeouts occassionally so had to adjust the `/usr/local/etc/cassandra/cassandra.yaml` `write_request_timeout_in_ms` setting. I 10x'd it from `20000` to `20000` ms. that fixed this issue.

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
# For 10 million records each for reviews and ratings..
# postgres do.. 
$> npm run megaseed --db=psql
# cassandra do.. 
$> npm run megaseedCassandra
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

### 1.5.5. CRUD (Create) UI and autoincrementing with Cassandra


![screenshot](http://g.recordit.co/r4hJOAUHhL.gif)

I chose to do CRUD operation Create as to not remove from the seeded records. As such I used the `POST /reviews/:id` endpoint. This included:

- user form with interactive ratings hoverable states (lots of if else statements)
- validation error / success
- automatic updating of reviews on page.

One challenging issue is because I chose cassandra and not psql, I **didn't** have the `AUTO INCREMENT` feature for the id. I ended up creating a new table called `counts` which stores how many reviews there are via a special `counter` type column. Otherwise querying `count(*)` results in a complete tablescan and is not performant. Thus, this table stores the count in a single row and increments it on new reviews entries.  This column does not allow for insertion and can only be updated by doing `update`:

`await this.queryDB("UPDATE counts SET count=count+1 WHERE table_name='reviews'");`

### 1.5.6. Deployment Docker-compose

So I decided to use `docker compose` to deploy my db and web. I ended up deciding on  3 seperate images: 

  - `web` (node app)
  - `cassandra` (database , based off of cassandra image)
  - `seed-db` (seed app, which based off of node image, but installs cassandra and cqlsh for seeding)

The purpose of the web and cassandra should be obvious, kept seperate so i can update / fiddle with them independently. The third one `seed-db` was because this container was only needed at init, and after finishing could drop off, and because the data is persistent it wouldn't be needed unless the data is cleared!


**Useful Commands**

Similar to docker cli, but a little bit easier since the container ids don't need to be addressed, and instead are called by service name, docker-compose commands we're heavily used. Some useful commands for working with docker-compose were:

``` sh
- useful commands
# remove dangling unused containers / images
$> docker system prune
# if you've already built / done up before and then made changes, you'll want to run build
$> docker-compose build [service1 service2]
# start all services up in detached	mode, ie in the background	
$> docker-compose up -d  [service1 service2]
# follow logs for a specific containe, and start at last 500 linesr
$>  docker-compose logs --follow --tail 500 [service1 service2]
# get into a docker iamge
$> docker-compose exec [service1] bash
# see how much memory , cpu each docker container is taking up
$> docker stats
```
*network*

  The beauty of docker compose is the fact that it auto creates a bridge network between containers giving them a host name for each containe defaulting to the name of that service ...so web  could be available at `http://web` and 
  a mongo service could be available at mongo://mongo and if you had a Cassandra service named `db` its accessible at `db:9042`. This was the 'aha' moment for me, in understanding how the containers communicate with one another.

**volumes**

THe other important element was use of volumes, I wanted to make sure the data persisted so I used docker-compose's volumes to make this happen as well as transfer over settings that needed to change for cassandra to not time out during seeding. SO this resulted in the following:
``` yaml
# store cassandra docker files at user roots docker_cassandra_data folder
- ~/docker_cassandra_data:/var/lib/cassandra
# use the current folder's yaml file as the config!
- ./cassandra.yaml:/etc/cassandra/cassandra.yaml
```

**Difficulties (Memory + Secondary Index time)**

Cassandra / java caused a LOT of memory issues, so scaling to a `t2.small` and larger volume (`8gb -> 12-24gb`) was necessary, especially for the seeding process!

Secondary indexing on the needed `property_id` column took 9 hours, but without it querying was impossible. Note: After initial seeding, new nodes during the boostrap process do not take long at all, an average of 6 minutes. 

After resolving these issues, the single ec2 instance was up and running! It looked like this.

![singleInstance](https://i.imgur.com/clWoaYn.png)

My final docker compose was the following:


```yml
version: '2'
services:
  seed-db: 
    build: 
      context: ./dummydata
    command:  /bin/bash -c "sleep 60 && node megaseed.js --db=cassandra"
    network_mode: host
    depends_on:
      - cassandra
    # mem_limit: 512M
    # cpu_quota: 50000
  web:
    build: .
    ports:
     - "80:3003"
    command: /bin/bash -c "sleep 60 && npm start"
    network_mode: host
    depends_on:
      - cassandra
    mem_limit: 512M

  cassandra:
    image: "cassandra:3.11"
    environment:
      - "MAX_HEAP_SIZE=512M"
      - "HEAP_NEWSIZE=256M"
      - CASSANDRA_SEEDS=35.166.43.127
      - CASSANDRA_LISTEN_ADDRESS=auto
      - CASSANDRA_BROADCAST_ADDRESS=35.166.43.127
      - CASSANDRA_ENDPOINT_SNITCH=GossipingPropertyFileSnitch
    # mem_limit: 1024M
    # cpu_quota: 50000
    ports:
      - "9042:9042"
      - "9160:9160"
      - "7000:7000"
      - "7001:7001"
      - "7199:7199"
    restart: always
    # uncomment if seeding as cassandra is noisy
    # logging:
    #   driver: none
    network_mode: host
    volumes:
      - ~/docker_cassandra_data:/var/lib/cassandra
      - ./dummydata/cassandra_config/cassandra.yaml:/etc/cassandra/cassandra.yaml

```


### 1.5.7. Local Load testing (Artillery)

Local testing with artillery on my macbook pro was pretty successful up until the 1000rps. 

|                   | 1rps                     | 10rps                      | 100rps                    | 1000rps                     |
|-------------------|--------------------------|----------------------------|---------------------------|-----------------------------|
| Local (Artillery) | `34ms` Latency / `0%` errors | `28.5ms` Latency / `0%` errors | `156ms` Latency / `0%` errors | `4,000ms` Latency / `70%` error |


### 1.5.8. Deployed Load testing (Loader.io)



|                             | 1rps                      | 10rps                     | 100rps                     | 1000rps                       |
|-----------------------------|---------------------------|---------------------------|----------------------------|-------------------------------|
| Loader.io (single instance) | `100ms` Latency / `0%` errors | `120ms` Latency / `0%` errors | `1280ms` Latency / `0%` errors | `8000ms` Latency / `60%` errors |


As you can see here while 1rps + 10rps did decent, 100rps + 1000rps have significant latency increases and 1000 almost immediately dropped majority of results / failed completely.

![loaderio](https://i.imgur.com/v7dKdNxr.png)

### 1.5.9. Analysis  (new relic)

![newrelic](https://i.imgur.com/ShGSbCnr.png)


So looking at the new relic breakdown, we can see that mainly cassandra is taking up a majority of the latency increase. 

### 1.5.10. Horizontally scale

So my plan was to horizontally scale by adding a new cassandra node. The benefit of using cassandra, is that once you have a `seed` node, the new one will connect to the `ring` and autobootstrap its data

This makes it really easy to add new resources. SO what I ended up doing was add one new node.

Conceptually adding a node is easy as duplicating a `package.json` and `docker-comnpose.yml`, which I just had it stored in another folder. These can be seen in the [otherServers](/otherServers) folder. 

![diagram](https://i.imgur.com/YPlOUan.png)

THen you can see the status like so. Using the following code on a new `t2.small`, you can do `nodetool status` on any cassandra container that you have up, and will see the newly added one(s). `UJ` stands for `joining`. This usually lasts 5-6minutes. Then it is ready to be queried when it turns `UN` 

![connecting](https://i.imgur.com/4TOqyxi.png)

Awesome so now I tried to run my loader tests again, but unfortunately there wasn't very much progress. This made me think that nodejs web was still a bottleneck before cassandra's multi node cluster can be of use.


|                             | 1rps                      | 10rps                     | 100rps                     | 1000rps                       |
|-----------------------------|---------------------------|---------------------------|----------------------------|-------------------------------|
| Loader.io (single instance) | `100ms` Latency / `0%` errors | `120ms` Latency / `0%` errors | `1280ms` Latency / `0%` errors | `8000ms` Latency / `60%` errors |
| Loader.io (single instance + extra cassandra node) | `100ms` Latency / `0%` errors | `120ms` Latency / `0%` errors | `1280ms` Latency / `0%` errors | `8000ms` Latency / `60%` errors |

### 1.5.11. Nginx Load balancer + multi instance

![new architecture diagram](https://i.imgur.com/p9HY91Yr.png)


So I changed the architecture diagram a little bit where on top of everything is an nginx load balancer, and then underneath is an ec2 instance containing 1) independent node (web), and 2) cassandra (node). Now the cassandra node is not necessarilly only queried by the the web app it shares an instance with, but rather joins the larger cassandra ring. This architecture greatly improved the performance!

You can see these additional nodes in the folder  [otherServers](/otherServers). 
It basically has cassandra /load balancer config, and package.json just for npm scripts.
```
.
├── loadBalancer
│   ├── docker-compose.yml
│   ├── limits.conf
│   ├── nginx.conf
│   ├── package.json
│   └── www
│       └── loaderio-7e0ba27b4ef4b48bd8b2137797bfb78f.txt
├── node2
│   ├── cassandra-rackdc.properties
│   ├── cassandra.yaml
│   ├── docker-compose.yml
│   └── package.json
├── node3
│   ├── cassandra-rackdc.properties
│   ├── cassandra.yaml
│   ├── docker-compose.yml
│   └── package.json
├── node4
│   ├── cassandra-rackdc.properties
│   ├── cassandra.yaml
│   ├── docker-compose.yml
│   └── package.json
└── node5
    ├── cassandra-rackdc.properties
    ├── cassandra.yaml
    ├── docker-compose.yml
    └── package.json
```

To append to the node it typically looks like this in `docker-compose.yml`

```
version: '2'
services:
  web:
    build: .
    network_mode: host
    command: /bin/bash -c "sleep 60 && npm start"
    depends_on:
      - cassandra
  cassandra:
    image: "cassandra:3.11"
    network_mode: host
    environment:
      - "MAX_HEAP_SIZE=512M"
      - "HEAP_NEWSIZE=256M"
      - CASSANDRA_SEEDS=[the original cassandra ip]
      - CASSANDRA_LISTEN_ADDRESS=auto
      - CASSANDRA_BROADCAST_ADDRESS=[the public ip for this new node on amazon!]
      - CASSANDRA_ENDPOINT_SNITCH=GossipingPropertyFileSnitch
    restart: always
    volumes:
      - ~/docker_cassandra_data:/var/lib/cassandra
      - ./otherServers/node2/cassandra.yaml:/etc/cassandra/cassandra.yaml
      - ./otherServers/node2/cassandra-rackdc.properties:/etc/cassandra/cassandra-rackdc.properties
```



### 1.5.12. Final optimized results


As you can see below I was able to reduce `100rps` from `1.2s` to `91ms` with more nodes. And I can even get `1000rps` in just a little over `2 seconds`. Each node took roughly about 10 min to launch (that includes bootstrap / ready to use time). And since no instance is centralized, they can be added and removed at will. for the higher rps, it seemed to plateau after a while so other optimizations that might be able to be done

  - wide column approach (need reviews and ratings table aka 2 requests but could be one table)
  - scaling vertically (cass likes machines with more ram)
  - secondary index removal (have reviews a compound index?)



| loader.io                | 1rps                          | 10rps                         | 100rps                         | 300rps                 | 500rps                  | 1000rps                          |
|--------------------------|-------------------------------|-------------------------------|--------------------------------|------------------------|-------------------------|----------------------------------|
| single instance          | `100ms` Latency / `0%` errors | `120ms` Latency / `0%` errors | `1280ms` Latency / `0%` errors | -                      | -                       | `8000ms` Latency / `60%` errors  |
| nginx + 2 web/cass nodes | `80ms` Latency / `0%` errors  | `80ms` Latency / `0%` errors  | `900ms` Latency / `0%` errors  | `900rps` / `9%` errors | `650ms` / `37%` errors  | -                                |
| nginx + 3 web/cass nodes | -                             | -                             | `270ms` Latency / `0%` errors  | `600ms` / `10%` errors | `1800ms` / `30%` errors | -                                |
| nginx + 4 web/cass nodes | -                             | -                             | `150ms` Latency / `0% errors`  | -                      | `284ms` / `0%` errors   | `2000ms` Latency / `0.5%` errors |
| nginx + 5 web/cass nodes | -                             | -                             | `91ms` Latency / `0%` errors   | `97ms` / `0%` errors   | `325ms` / `0%` errors   | `2082ms` Latency / `1.1%` errors |


Below are some charts and final loader.io results

![graphs](https://i.imgur.com/2FFjpXs.png)

![final 100rps](https://i.imgur.com/XQoEeuJ.png)