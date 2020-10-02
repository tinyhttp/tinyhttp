/*
 Deletes a User record.
 */
DELETE FROM
    users
WHERE
    id = ($1) RETURNING *