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

//to add category to database
const createCategory = async (categoryName, description) => {
    const [result] = await db.query(
        "INSERT INTO categories (category_name, description) VALUES (?, ?)",
        [categoryName, description]
    );

    return {
        category_id: result.insertId,
        category_name: categoryName,
        description: description
    };
};


const getCategoryByName = async (categoryName) => {
    const [rows] = await db.query(
        "SELECT category_id FROM categories WHERE category_name = ?",
        [categoryName]
    );

    return rows[0];
};

//update category
const updateCategory = async (categoryId, categoryName, description) => {
    const [result] = await db.query(
        `UPDATE categories
         SET category_name = ?, description = ?
         WHERE category_id = ?`,
        [categoryName, description, categoryId]
    );

    return result.affectedRows;
};
//get count of resources before deletion of category
const getResourceCountByCategory = async (categoryId) => {
    const [rows] = await db.query(
        "SELECT COUNT(*) AS count FROM resources WHERE category_id = ?",
        [categoryId]
    );

    return rows[0].count;
};

//delete category
const deleteCategory = async (categoryId) => {
    const [result] = await db.query(
        "DELETE FROM categories WHERE category_id = ?",
        [categoryId]
    );

    return result.affectedRows;
};


module.exports = {
    getAllCategories,
    getCategoryById,
    getCategoryByName,
    createCategory,
    updateCategory,
    getResourceCountByCategory,
    deleteCategory
};