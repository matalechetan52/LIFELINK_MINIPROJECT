const db = require("../utils/db");
//get all maintenance
const getAllMaintenance = async () => {
    const [rows] = await db.query(`
        SELECT
            m.maintenance_id,
            m.resource_id,
            r.name AS resource_name,
            m.start_date,
            m.end_date,
            m.reason,
            m.status
        FROM maintenance m
        INNER JOIN resources r
            ON m.resource_id = r.resource_id
        ORDER BY m.start_date ASC
    `);

    return rows;
};
//get maintenance by id;
const getMaintenanceById = async (maintenanceId) => {
    const [rows] = await db.query(`
        SELECT
            m.maintenance_id,
            m.resource_id,
            r.name AS resource_name,
            m.start_date,
            m.end_date,
            m.reason,
            m.status
        FROM maintenance m
        INNER JOIN resources r
            ON m.resource_id = r.resource_id
        WHERE m.maintenance_id = ?
    `, [maintenanceId]);

    return rows[0];
};

//get resourceBy Id
const getResourceById = async (resourceId) => {
    const [rows] = await db.query(
        "SELECT resource_id FROM resources WHERE resource_id = ?",
        [resourceId]
    );

    return rows[0];
};

//getBookingConflict
const getBookingConflict = async (resourceId, startDate, endDate) => {
    const [rows] = await db.query(
        `SELECT
            booking_id,
            start_time,
            end_time,
            status
         FROM bookings
         WHERE resource_id = ?
           AND status != 'CANCELLED'
           AND start_time < ?
           AND end_time > ?
         LIMIT 1`,
        [resourceId, endDate, startDate]
    );

    return rows[0];
};

//getmaintenanceConflict
const getMaintenanceConflict = async (
    resourceId,
    startDate,
    endDate
) => {
    const [rows] = await db.query(
        `SELECT
            maintenance_id,
            start_date,
            end_date,
            status
         FROM maintenance
         WHERE resource_id = ?
           AND status IN ('SCHEDULED', 'ONGOING')
           AND start_date < ?
           AND end_date > ?
         LIMIT 1`,
        [resourceId, endDate, startDate]
    );

    return rows[0];
};

//add maintenance.
const createMaintenance = async (
    resourceId,
    startDate,
    endDate,
    reason
) => {
    const [result] = await db.query(
        `INSERT INTO maintenance
        (resource_id, start_date, end_date, reason)
        VALUES (?, ?, ?, ?)`,
        [
            resourceId,
            startDate,
            endDate,
            reason
        ]
    );

    return result.insertId;
};
//update Maintenance
const updateMaintenance = async (
    maintenanceId,
    startDate,
    endDate,
    reason,
    status
) => {
    const [result] = await db.query(
        `UPDATE maintenance
         SET start_date = ?,
             end_date = ?,
             reason = ?,
             status = ?
         WHERE maintenance_id = ?`,
        [
            startDate,
            endDate,
            reason,
            status,
            maintenanceId
        ]
    );

    return result.affectedRows;
};

//delete
const deleteMaintenance = async (maintenanceId) => {
    const [result] = await db.query(
        "DELETE FROM maintenance WHERE maintenance_id = ?",
        [maintenanceId]
    );

    return result.affectedRows;
};

module.exports = {
    getAllMaintenance,
    getMaintenanceById,
    getResourceById,
    getBookingConflict,
    getMaintenanceConflict,
    createMaintenance,
    updateMaintenance,
    deleteMaintenance
};