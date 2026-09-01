import customerModel from "../models/customerModel.js";

// GET ALL CUSTOMERS
const getAllCustomers = (req, res) => {
    customerModel.getCustomers((err, customers) => {
        if (err) {
            return res.status(500).json({
                message: "Error fetching customers",
                error: err.message
            });
        }
        res.json(customers || []);
    });
};

// GET ONE CUSTOMER
const getOneCustomer = (req, res) => {
    const { id } = req.params;
    customerModel.getCustomerById(id, (err, customers) => {
        if (err) {
            return res.status(500).json({
                message: "Error fetching customer",
                error: err.message
            });
        }
        if (!customers || customers.length === 0) {
            return res.status(404).json({
                message: "Customer not found"
            });
        }
        res.json(customers[0]);
    });
};

// CREATE CUSTOMER
const addCustomer = (req, res) => {
    const { name, email, phone, address } = req.body;

    if (!name || !email || !phone) {
        return res.status(400).json({
            message: "Name, email and phone are required"
        });
    }

    customerModel.createCustomer(name, email, phone, address || "", (err, result) => {
        if (err) {
            return res.status(500).json({
                message: "Error creating customer",
                error: err.message
            });
        }
        res.status(201).json({
            message: "Customer created successfully",
            customerId: result.insertId
        });
    });
};

// UPDATE CUSTOMER
const editCustomer = (req, res) => {
    const { id } = req.params;
    const { name, email, phone, address } = req.body;

    if (!name || !email || !phone) {
        return res.status(400).json({
            message: "Name, email and phone are required"
        });
    }

    customerModel.updateCustomer(id, name, email, phone, address || "", (err, result) => {
        if (err) {
            return res.status(500).json({
                message: "Error updating customer",
                error: err.message
            });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Customer not found"
            });
        }
        res.json({
            message: "Customer updated successfully"
        });
    });
};

// DELETE CUSTOMER
const removeCustomer = (req, res) => {
    const { id } = req.params;
    customerModel.deleteCustomer(id, (err, result) => {
        if (err) {
            return res.status(500).json({
                message: "Error deleting customer",
                error: err.message
            });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Customer not found"
            });
        }
        res.json({
            message: "Customer deleted successfully"
        });
    });
};

// GET TOTAL CUSTOMERS COUNT
const getTotalCustomers = (req, res) => {
    customerModel.getTotalCustomers((err, result) => {
        if (err) {
            return res.status(500).json({
                message: "Error fetching total customers",
                error: err.message
            });
        }
        const total = result && result.length > 0 ? result[0].totalCustomers : 0;
        res.json({ totalCustomers: total });
    });
};

export default {
    getAllCustomers,
    getOneCustomer,
    addCustomer,
    editCustomer,
    removeCustomer,
    getTotalCustomers
};
