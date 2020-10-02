/*
 Updates a User record.
 */
UPDATE
    users
SET
    name = ($1)
WHERE
    id = ($2)