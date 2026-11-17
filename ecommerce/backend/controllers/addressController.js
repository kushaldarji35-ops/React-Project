import addressModel from "../models/addressModel.js";

// GET /api/address  — list all addresses for logged-in user
const getAddresses = (req, res) => {
    const userId = req.user?.id;
    if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
    }

    addressModel.getByUserId(userId, (err, results) => {
        if (err) {
            console.error("[addressController.getAddresses] Error:", err);
            return res.status(500).json({ message: err.sqlMessage || err.message || "Database error" });
        }
        res.json(results || []);
    });
};

// POST /api/address  — create a new address
const createAddress = (req, res) => {
    const userId = req.user?.id;
    if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
    }

    const { full_name, mobile, line1, city, state, pincode } = req.body;
    if (!full_name || !mobile || !line1 || !city || !state || !pincode) {
        return res.status(400).json({ message: "Please fill all required fields" });
    }

    addressModel.create(userId, req.body, (err, result) => {
        if (err) {
            console.error("[addressController.createAddress] Error saving address:", err);
            return res.status(500).json({
                message: err.sqlMessage || err.message || "Error saving address",
            });
        }
        res.status(201).json({ message: "Address saved", addressId: result.insertId });
    });
};

// PUT /api/address/:id  — update an address
const updateAddress = (req, res) => {
    const userId = req.user?.id;
    if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
    }

    const { id } = req.params;
    const { full_name, mobile, line1, city, state, pincode } = req.body;
    if (!full_name || !mobile || !line1 || !city || !state || !pincode) {
        return res.status(400).json({ message: "Please fill all required fields" });
    }

    addressModel.update(id, userId, req.body, (err, result) => {
        if (err) {
            console.error("[addressController.updateAddress] Error updating address:", err);
            return res.status(500).json({
                message: err.sqlMessage || err.message || "Error updating address",
            });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Address not found" });
        }
        res.json({ message: "Address updated" });
    });
};

// DELETE /api/address/:id  — delete an address
const deleteAddress = (req, res) => {
    const userId = req.user?.id;
    if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
    }

    const { id } = req.params;
    addressModel.remove(id, userId, (err, result) => {
        if (err) {
            console.error("[addressController.deleteAddress] Error deleting address:", err);
            return res.status(500).json({
                message: err.sqlMessage || err.message || "Error deleting address",
            });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Address not found" });
        }
        res.json({ message: "Address deleted" });
    });
};

const addressController = { getAddresses, createAddress, updateAddress, deleteAddress };
export default addressController;
