CREATE TABLE firebnbreviews.reviews (
  id int,
  property_id int,
  user_id int,
  date text,
  review text,
  reply text,
  reply_date text,
  PRIMARY KEY (id)
);