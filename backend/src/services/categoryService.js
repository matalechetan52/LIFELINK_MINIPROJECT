const { get } = require("../routes/categoryRoutes");
const db = require("../utils/db");

//for all categories
const getAllCategories = async () => {
    const [rows] = await db.query(
        "SELECT category_id, category_name, description FROM categories"
    );

    return rows;
};

//for one 
const getCategoryById = async (categoryId) => {
    const [rows] = await db.query(
        "SELECT category_id, category_name, description FROM categories WHERE category_id = ?",
        [categoryId]
    );

    return rows[0];
};

module.exports = {
    getAllCategories,
    getCategoryById
};