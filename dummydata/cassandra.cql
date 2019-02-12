CREATE KEYSPACE IF NOT EXISTS firebnbreviews WITH replication = {'class':'SimpleStrategy', 'replication_factor' : 1};
USE firebnbreviews;
DROP TABLE IF EXISTS ratings;
DROP TABLE IF EXISTS reviews;
DROP INDEX IF EXISTS property_idx;
DROP TABLE IF EXISTS counts;

CREATE TABLE reviews (
  id int,
  property_id int,
  user_id int,
  date text,
  review text,
  reply text,
  reply_date text,
  PRIMARY KEY(id, property_id)   
);

CREATE TABLE ratings (
  id int PRIMARY KEY,
  review_id int,
  average float,
  accuracy int,
  communication int,
  cleanliness int,
  location int,
  checkin int,
  value int
);

CREATE TABLE counts (
  table_name text,
  count counter,
  PRIMARY KEY(table_name)
);

