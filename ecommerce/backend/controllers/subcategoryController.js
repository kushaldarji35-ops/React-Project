import subcategoryModel from "../models/subcategoryModel.js";

const toSlug = (value) =>
    String(value || "")
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

const getSubcategories = (req, res) => {
    subcategoryModel.getAll((err, results) => {
        if (err) {
            return res.status(500).json({
                message: "Database error fetching subcategories",
                error: err.message,
            });
        }
        res.json(results);
    });
};

const createSubcategory = (req, res) => {
    const name = typeof req.body.name === "string" ? req.body.name.trim() : "";
    if (!name) {
        return res.status(400).json({ message: "Subcategory name is required" });
    }

    const slug = toSlug(name);
    if (!slug) {
        return res.status(400).json({ message: "Enter a valid subcategory name" });
    }

    const status = (req.body.status || "active").toLowerCase();
    const category_id = req.body.category_id || null;

    subcategoryModel.create({ name, slug, category_id, status }, (err, result) => {
        if (err?.code === "ER_DUP_ENTRY") {
            return res.status(409).json({ message: "This subcategory already exists" });
        }
        if (err) {
            return res.status(500).json({
                message: "Error creating subcategory",
                error: err.message,
            });
        }
        res.status(201).json({
            message: "Subcategory created successfully",
            subcategory: { id: result.insertId, name, slug, category_id, status },
        });
    });
};

const updateSubcategory = (req, res) => {
    const { id } = req.params;
    const name = typeof req.body.name === "string" ? req.body.name.trim() : undefined;
    const slug = name ? toSlug(name) : (req.body.slug ? toSlug(req.body.slug) : undefined);
    const status = req.body.status ? req.body.status.toLowerCase() : undefined;
    const category_id = req.body.category_id !== undefined ? (req.body.category_id || null) : undefined;

    if (!name && !status && category_id === undefined) {
        return res.status(400).json({ message: "Provide name, status or category to update" });
    }

    subcategoryModel.update(id, { name, slug, category_id, status }, (err, result) => {
        if (err?.code === "ER_DUP_ENTRY") {
            return res.status(409).json({ message: "A subcategory with this name already exists" });
        }
        if (err) {
            return res.status(500).json({
                message: "Error updating subcategory",
                error: err.message,
            });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Subcategory not found" });
        }
        res.json({ message: "Subcategory updated successfully" });
    });
};

const deleteSubcategory = (req, res) => {
    const { id } = req.params;
    subcategoryModel.remove(id, (err, result) => {
        if (err) {
            return res.status(500).json({
                message: "Error deleting subcategory",
                error: err.message,
            });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Subcategory not found" });
        }
        res.json({ message: "Subcategory deleted successfully" });
    });
};

export default { getSubcategories, createSubcategory, updateSubcategory, deleteSubcategory };
