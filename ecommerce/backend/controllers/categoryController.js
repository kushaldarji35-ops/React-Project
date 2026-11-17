import categoryModel from "../models/categoryModel.js";

const toSlug = (value) =>
    String(value || "")
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

// GET /api/categories - list all categories
const getCategories = (req, res) => {
    const { status, search } = req.query;
    categoryModel.getAll({ status, search }, (err, results) => {
        if (err) return res.status(500).json({ message: "Database error fetching categories", error: err.message });
        res.json(results);
    });
};

// GET /api/categories/:id - get single category
const getCategoryById = (req, res) => {
    const { id } = req.params;
    categoryModel.getById(id, (err, results) => {
        if (err) return res.status(500).json({ message: "Database error", error: err.message });
        if (results.length === 0) return res.status(404).json({ message: "Category not found" });
        res.json(results[0]);
    });
};

// POST /api/categories - create new category
const createCategory = (req, res) => {
    const { name, slug, description, image, status } = req.body;
    if (!name || !name.trim()) {
        return res.status(400).json({ message: "Category name is required" });
    }

    categoryModel.create({
        name: name.trim(),
        slug: toSlug(slug || name),
        description,
        image,
        status: (status || "active").toLowerCase(),
    }, (err, result) => {
        if (err) return res.status(500).json({ message: "Error creating category", error: err.message });
        res.status(201).json({
            message: "Category created successfully",
            categoryId: result.insertId
        });
    });
};

// PUT /api/categories/:id - update category
const updateCategory = (req, res) => {
    const { id } = req.params;
    const { name, slug, description, image, status } = req.body;

    categoryModel.update(id, {
        name: name?.trim(),
        slug: slug ? toSlug(slug) : undefined,
        description,
        image,
        status: status?.toLowerCase(),
    }, (err, result) => {
        if (err) return res.status(500).json({ message: "Error updating category", error: err.message });
        if (result.affectedRows === 0) return res.status(404).json({ message: "Category not found" });
        res.json({ message: "Category updated successfully" });
    });
};

// DELETE /api/categories/:id - delete category
const deleteCategory = (req, res) => {
    const { id } = req.params;
    categoryModel.remove(id, (err, result) => {
        if (err) {
            if (err.code === "ER_ROW_IS_REFERENCED_2") {
                return res.status(400).json({ message: "Cannot delete category with associated products" });
            }
            return res.status(500).json({ message: "Error deleting category", error: err.message });
        }
        if (result.affectedRows === 0) return res.status(404).json({ message: "Category not found" });
        res.json({ message: "Category deleted successfully" });
    });
};

const categoryController = {
    getCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory
};

export default categoryController;
