const db = require("../utils/db");

const getAllResources = async () => {
    const [rows] = await db.query(`
        SELECT
            r.resource_id,
            r.owner_id,
            r.category_id,
            c.category_name,
            r.name,
            r.description,
            r.location,
            r.price_per_hour,
            r.status,
            r.created_at
        FROM resources r
        INNER JOIN categories c
            ON r.category_id = c.category_id
        ORDER BY r.resource_id ASC
    `);

    return rows;
};

//get resource by id
const getResourceById = async (resourceId) => {
    const [rows] = await db.query(`
        SELECT
            r.resource_id,
            r.owner_id,
            r.category_id,
            c.category_name,
            r.name,
            r.description,
            r.location,
            r.price_per_hour,
            r.status,
            r.created_at
        FROM resources r
        INNER JOIN categories c
            ON r.category_id = c.category_id
        WHERE r.resource_id = ?
    `, [resourceId]);

    return rows[0];
};
module.exports = {
    getAllResources,
    getResourceById
};