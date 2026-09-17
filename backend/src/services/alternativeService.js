const db = require("../utils/db");
const availabilityService =
    require("./availabilityService");

// Get available alternative resources
const getAlternativeResources = async (
    resourceId,
    startTime,
    endTime
) => {

    // 1. Get the requested resource
    const [resourceRows] = await db.query(
        `SELECT
            resource_id,
            category_id,
            name
         FROM resources
         WHERE resource_id = ?`,
        [resourceId]
    );

    if (resourceRows.length === 0) {
        throw new Error("RESOURCE_NOT_FOUND");
    }

    const resource = resourceRows[0];

    // 2. Get other resources from the same category
    const [alternativeRows] = await db.query(
        `SELECT
            resource_id,
            name,
            description,
            location,
            price_per_hour,
            status,
            category_id
         FROM resources
         WHERE category_id = ?
           AND resource_id != ?
         ORDER BY price_per_hour ASC, resource_id ASC`,
        [
            resource.category_id,
            resourceId
        ]
    );

    const alternatives = [];

    // 3. Check availability of each candidate
    for (const alternative of alternativeRows) {

        const availability =
            await availabilityService.checkResourceAvailability(
                alternative.resource_id,
                startTime,
                endTime
            );

        if (availability && availability.available) {

            alternatives.push({
                resource_id: alternative.resource_id,
                name: alternative.name,
                description: alternative.description,
                location: alternative.location,
                price_per_hour: alternative.price_per_hour,
                status: alternative.status,
                category_id: alternative.category_id
            });
        }
    }

    return alternatives;
};

// Search alternative resources using filters
const searchAlternativeResources = async (
    categoryId,
    location,
    startTime,
    endTime,
    maxPrice
) => {

    // Build the resource search query
    let query = `
        SELECT
            resource_id,
            name,
            description,
            location,
            price_per_hour,
            status,
            category_id
        FROM resources
        WHERE 1 = 1
    `;

    const params = [];

    // Filter by category
    if (categoryId) {
        query += ` AND category_id = ?`;
        params.push(categoryId);
    }

    // Filter by location
    if (location) {
        query += ` AND location LIKE ?`;
        params.push(`%${location}%`);
    }

    // Filter by maximum price
    if (maxPrice) {
        query += ` AND price_per_hour <= ?`;
        params.push(maxPrice);
    }

    query += `
        ORDER BY
            price_per_hour ASC,
            resource_id ASC
    `;

    const [resourceRows] =
        await db.query(query, params);

    const alternatives = [];

    // Check requested-period availability
    for (const resource of resourceRows) {

        if (startTime && endTime) {

            const availability =
                await availabilityService.checkResourceAvailability(
                    resource.resource_id,
                    startTime,
                    endTime
                );

            if (!availability || !availability.available) {
                continue;
            }
        } else {

            // Without a requested period,
            // only currently available resources are returned.
            if (resource.status !== "AVAILABLE") {
                continue;
            }
        }

        alternatives.push(resource);
    }

    return alternatives;
};

module.exports = {
    getAlternativeResources,
    searchAlternativeResources
};