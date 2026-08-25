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

//getOwnerById .
const getOwnerById = async (ownerId) => {
    const [rows] = await db.query(
        "SELECT user_id, role FROM users WHERE user_id = ?",
        [ownerId]
    );

    return rows[0];
};

//getCategoryById
const getCategoryById = async (categoryId) => {
    const [rows] = await db.query(
        "SELECT category_id FROM categories WHERE category_id = ?",
        [categoryId]
    );

    return rows[0];
};
//create Resource.
const createResource = async (
    ownerId,
    categoryId,
    name,
    description,
    location,
    pricePerHour
) => {
    const [result] = await db.query(
        `INSERT INTO resources
        (owner_id, category_id, name, description, location, price_per_hour)
        VALUES (?, ?, ?, ?, ?, ?)`,
        [
            ownerId,
            categoryId,
            name,
            description,
            location,
            pricePerHour
        ]
    );

    return result.insertId;
};

//update resource 
const updateResource = async (
    resourceId,
    ownerId,
    categoryId,
    name,
    description,
    location,
    pricePerHour
) => {
    const [result] = await db.query(
        `UPDATE resources
         SET owner_id = ?,
             category_id = ?,
             name = ?,
             description = ?,
             location = ?,
             price_per_hour = ?
         WHERE resource_id = ?`,
        [
            ownerId,
            categoryId,
            name,
            description,
            location,
            pricePerHour,
            resourceId
        ]
    );

    return result.affectedRows;
};

//getBookingCountByResource
const getBookingCountByResource = async (resourceId) => {
    const [rows] = await db.query(
        "SELECT COUNT(*) AS count FROM bookings WHERE resource_id = ?",
        [resourceId]
    );

    return Number(rows[0].count);
};

//deleteResource.
const deleteResource = async (resourceId) => {
    const [result] = await db.query(
        "DELETE FROM resources WHERE resource_id = ?",
        [resourceId]
    );

    return result.affectedRows;
};

const getMaintenanceCountByResource = async (resourceId) => {
    const [rows] = await db.query(
        "SELECT COUNT(*) AS count FROM maintenance WHERE resource_id = ?",
        [resourceId]
    );

    return Number(rows[0].count);
};

module.exports = {
    getAllResources,
    getResourceById,
    getOwnerById,
    getCategoryById,
    createResource,
    updateResource,
    getBookingCountByResource,
    getMaintenanceCountByResource,
    deleteResource
};