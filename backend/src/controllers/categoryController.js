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
//add category to database.
const createCategory = async (req, res) => {
    try {
        const { category_name, description } = req.body;

        if (!category_name || !category_name.trim()) {
            return res.status(400).json({
                success: false,
                message: "Category name is required"
            });
        }

        const categoryName = category_name.trim();

        const existingCategory =
            await categoryService.getCategoryByName(categoryName);

        if (existingCategory) {
            return res.status(409).json({
                success: false,
                message: "Category already exists"
            });
        }

        const category = await categoryService.createCategory(
            categoryName,
            description ? description.trim() : null
        );

        res.status(201).json({
            success: true,
            message: "Category created successfully",
            data: category
        });

    } catch (error) {
        console.error("Error creating category:", error.message);

        res.status(500).json({
            success: false,
            message: "Failed to create category"
        });
    }
};

//update category
const updateCategory = async (req, res) => {
    try {
        const categoryId = Number(req.params.id);
        const { category_name, description } = req.body;

        if (!Number.isInteger(categoryId) || categoryId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid category ID"
            });
        }

        if (!category_name || !category_name.trim()) {
            return res.status(400).json({
                success: false,
                message: "Category name is required"
            });
        }

        const categoryName = category_name.trim();

        const existingCategory =
            await categoryService.getCategoryById(categoryId);

        if (!existingCategory) {
            return res.status(404).json({
                success: false,
                message: "Category not found"
            });
        }

        const duplicateCategory =
            await categoryService.getCategoryByName(categoryName);

        if (
            duplicateCategory &&
            duplicateCategory.category_id !== categoryId
        ) {
            return res.status(409).json({
                success: false,
                message: "Another category with this name already exists"
            });
        }

        await categoryService.updateCategory(
            categoryId,
            categoryName,
            description ? description.trim() : null
        );

        const updatedCategory =
            await categoryService.getCategoryById(categoryId);

        res.status(200).json({
            success: true,
            message: "Category updated successfully",
            data: updatedCategory
        });

    } catch (error) {
        console.error("Error updating category:", error.message);

        res.status(500).json({
            success: false,
            message: "Failed to update category"
        });
    }
};

//delete cataegory
const deleteCategory = async (req, res) => {
    try {
        const categoryId = Number(req.params.id);

        if (!Number.isInteger(categoryId) || categoryId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid category ID"
            });
        }

        const category =
            await categoryService.getCategoryById(categoryId);

        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Category not found"
            });
        }

        const resourceCount =
            await categoryService.getResourceCountByCategory(categoryId);

        if (resourceCount > 0) {
            return res.status(409).json({
                success: false,
                message: "Category cannot be deleted because resources are associated with it"
            });
        }

        await categoryService.deleteCategory(categoryId);

        res.status(200).json({
            success: true,
            message: "Category deleted successfully"
        });

    } catch (error) {
        console.error("Error deleting category:", error.message);

        res.status(500).json({
            success: false,
            message: "Failed to delete category"
        });
    }
};
module.exports = {
    getCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory,


};