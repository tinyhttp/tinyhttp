/*
 Creates table Users.
 */
CREATE TABLE IF NOT EXISTS users (
    id serial PRIMARY KEY,
    name text NOT NULL
);

TRUNCATE TABLE users CASCADE