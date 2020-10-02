/*
 Inserts a new User record.
 */
INSERT INTO
    users(name)
VALUES
    ($1) RETURNING *