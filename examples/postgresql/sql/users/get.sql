/*
 Get a User record.
 */
SELECT
    *
FROM
    users
WHERE
    id = ($1)