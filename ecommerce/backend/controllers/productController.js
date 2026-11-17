import productModel from "../models/productModel.js";

// GET /api/products - list products with optional filters
const getProducts = (req, res) => {
    const { category_id, category, search, status } = req.query;

    productModel.getAll({ category_id, category, search, status }, (err, results) => {
        if (err) return res.status(500).json({ message: "Database error fetching products", error: err.message });
        res.json(results);
    });
};

// GET /api/products/:id - get single product by ID
const getProductById = (req, res) => {
    const { id } = req.params;
    productModel.getById(id, (err, results) => {
        if (err) return res.status(500).json({ message: "Database error", error: err.message });
        if (results.length === 0) return res.status(404).json({ message: "Product not found" });
        res.json(results[0]);
    });
};

// POST /api/products - create new product
const createProduct = (req, res) => {
    const {
        category_id,
        subcategory,
        name,
        description,
        original_price,
        originalPrice,
        discount_percent,
        discountPercent,
        current_price,
        price,
        image,
        imageUrl,
        images,
        status,
        rating,
        sizes,
        colors
    } = req.body;

    let finalCategoryId = Number(category_id);
    if (!finalCategoryId && req.body.category) {
        const catMap = { casual: 1, formal: 2, party: 3, gym: 4 };
        finalCategoryId = catMap[(req.body.category || "").toLowerCase()] || 1;
    }
    if (!finalCategoryId) finalCategoryId = 1;

    if (!name || (!current_price && !price)) {
        return res.status(400).json({ message: "Product name and price are required" });
    }

    const allImages = Array.isArray(images) && images.length > 0
        ? images
        : (image || imageUrl ? [image || imageUrl] : []);

    const newProduct = {
        category_id: finalCategoryId,
        subcategory: subcategory || null,
        name: name.trim(),
        description: description || null,
        original_price: original_price || originalPrice || null,
        discount_percent: discount_percent || discountPercent || null,
        current_price: current_price || price,
        image: image || imageUrl || allImages[0] || null,
        images: allImages.length > 0 ? JSON.stringify(allImages) : null,
        status: status || "active",
        rating: rating || 0.0,
        sizes: sizes ? (typeof sizes === "string" ? sizes : JSON.stringify(sizes)) : null,
        colors: colors ? (typeof colors === "string" ? colors : JSON.stringify(colors)) : null
    };

    productModel.create(newProduct, (err, result) => {
        if (err) return res.status(500).json({ message: "Error creating product", error: err.message });
        res.status(201).json({
            message: "Product created successfully",
            productId: result.insertId
        });
    });
};

// PUT /api/products/:id - update product
const updateProduct = (req, res) => {
    const { id } = req.params;
    const {
        category_id,
        subcategory,
        name,
        description,
        original_price,
        originalPrice,
        discount_percent,
        discountPercent,
        current_price,
        price,
        image,
        imageUrl,
        images,
        status,
        rating,
        sizes,
        colors
    } = req.body;

    let finalCategoryId = category_id !== undefined ? Number(category_id) : undefined;
    if (finalCategoryId === undefined && req.body.category) {
        const catMap = { casual: 1, formal: 2, party: 3, gym: 4 };
        finalCategoryId = catMap[(req.body.category || "").toLowerCase()] || 1;
    }

    let allImages = undefined;
    if (images !== undefined) {
        allImages = Array.isArray(images) ? JSON.stringify(images) : images;
    } else if (image || imageUrl) {
        allImages = JSON.stringify([image || imageUrl]);
    }

    const updatedData = {
        category_id: finalCategoryId,
        subcategory,
        name: name !== undefined ? name.trim() : undefined,
        description,
        original_price: original_price || originalPrice,
        discount_percent: discount_percent || discountPercent,
        current_price: current_price || price,
        image: image || imageUrl || (Array.isArray(images) ? images[0] : undefined),
        images: allImages,
        status,
        rating,
        sizes: sizes !== undefined ? (typeof sizes === "string" ? sizes : JSON.stringify(sizes)) : undefined,
        colors: colors !== undefined ? (typeof colors === "string" ? colors : JSON.stringify(colors)) : undefined
    };

    productModel.update(id, updatedData, (err, result) => {
        if (err) return res.status(500).json({ message: "Error updating product", error: err.message });
        if (result.affectedRows === 0) return res.status(404).json({ message: "Product not found" });
        res.json({ message: "Product updated successfully" });
    });
};

// DELETE /api/products/:id - delete product
const deleteProduct = (req, res) => {
    const { id } = req.params;
    productModel.remove(id, (err, result) => {
        if (err) {
            if (err.code === "ER_ROW_IS_REFERENCED_2") {
                return res.status(400).json({ message: "Cannot delete product referenced by existing orders" });
            }
            return res.status(500).json({ message: "Error deleting product", error: err.message });
        }
        if (result.affectedRows === 0) return res.status(404).json({ message: "Product not found" });
        res.json({ message: "Product deleted successfully" });
    });
};

const productController = {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
};

export default productController;
