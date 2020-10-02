/*
 Inserting a few demo users into the database, and returning their id-s;
 
 NOTES:
 
 - You can do multiple separate inserts, if you want, but using
 a single concatenated insert is significantly faster.
 
 See also:
 https://github.com/vitaly-t/pg-promise/wiki/Performance-Boost
 */
INSERT INTO
  users(name)
VALUES
  ('Demo User 1'),
  -- user 1;
  ('Demo User 2'),
  -- user 2;
  ('Demo User 3'),
  -- user 3;
  ('Demo User 4'),
  -- user 4;
  ('Demo User 5') -- user 5;
  RETURNING id