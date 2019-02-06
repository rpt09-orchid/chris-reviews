DROP TABLE IF EXISTS ratings;
DROP TABLE IF EXISTS reviews;

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

 UPDATE counts set count=count+10000000 where table_name='reviews';