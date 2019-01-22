DROP SCHEMA IF EXISTS public CASCADE;

CREATE SCHEMA public;


DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS reviews;
DROP TABLE IF EXISTS users;

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  first text,
  avatar text
);

CREATE TABLE IF NOT EXISTS reviews (
  id SERIAL PRIMARY KEY,
  property_id integer,
  user_id integer,
  date text,
  review text,
  reply text,
  reply_date text
);

CREATE TABLE IF NOT EXISTS ratings (
  id SERIAL PRIMARY KEY,
  review_id SERIAL,
  average numeric(4,2),
  accuracy integer,
  communication integer,
  cleanliness integer,
  location integer,
  checkin integer,
  value integer,
  FOREIGN KEY (review_id) 
  REFERENCES reviews(id) DEFERRABLE INITIALLY IMMEDIATE
);
