const categoryService = require("../services/categoryService");
//for all categories
const getCategories = async (req, res) => {
    try {
        const categories = await categoryService.getAllCategories();

        res.status(200).json({
            success: true,
            data: categories
        });
    } catch (error) {
        console.error("Error fetching categories:", error.message);

        res.status(500).json({
            success: false,
            message: "Failed to fetch categories"
        });
    }
};

//for one 
const getCategoryById = async (req, res) => {
    try {
        const categoryId = req.params.id;

        const category = await categoryService.getCategoryById(categoryId);

        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Category not found"
            });
        }

        res.status(200).json({
            success: true,
            data: category
        });

    } catch (error) {
        console.error("Error fetching category:", error.message);

        res.status(500).json({
            success: false,
            message: "Failed to fetch category"
        });
    }
};


module.exports = {
    getCategories,
    getCategoryById


};