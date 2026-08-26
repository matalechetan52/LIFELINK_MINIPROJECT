const db = require("../utils/db");

const getResourceAvailability = async (resourceId) => {

    // 1. Get resource details
    const [resourceRows] = await db.query(
        `SELECT
            resource_id,
            name,
            status
         FROM resources
         WHERE resource_id = ?`,
        [resourceId]
    );

    if (resourceRows.length === 0) {
        return null;
    }

    const resource = resourceRows[0];

    // 2. Get active bookings
    const [bookingRows] = await db.query(
        `SELECT
            booking_id,
            start_time,
            end_time,
            status
         FROM bookings
         WHERE resource_id = ?
           AND status NOT IN ('CANCELLED', 'COMPLETED')
         ORDER BY start_time ASC`,
        [resourceId]
    );

    // 3. Get active maintenance
    const [maintenanceRows] = await db.query(
        `SELECT
            maintenance_id,
            start_date,
            end_date,
            reason,
            status
         FROM maintenance
         WHERE resource_id = ?
           AND status IN ('SCHEDULED', 'ONGOING')
         ORDER BY start_date ASC`,
        [resourceId]
    );

    // 4. Determine current availability
    const now = new Date();

    const activeBooking = bookingRows.find(
        (booking) =>
            new Date(booking.start_time) <= now &&
            new Date(booking.end_time) > now
    );

    const activeMaintenance = maintenanceRows.find(
        (maintenance) =>
            new Date(maintenance.start_date) <= now &&
            new Date(maintenance.end_date) > now
    );

    const isResourceStatusAvailable =
        resource.status === "AVAILABLE";

    const isAvailable =
        isResourceStatusAvailable &&
        !activeBooking &&
        !activeMaintenance;

    return {
        resource_id: resource.resource_id,
        resource_name: resource.name,
        resource_status: resource.status,
        available: isAvailable,
        active_booking: activeBooking || null,
        active_maintenance: activeMaintenance || null,
        upcoming_bookings: bookingRows,
        upcoming_maintenance: maintenanceRows
    };
};

module.exports = {
    getResourceAvailability
};