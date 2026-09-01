import adminModel from "../models/adminModel.js";

// Get all users
const getusers = (req, res) => {
    adminModel.getusers((err, users) => {
        if (err) {
            return res.status(500).json({
                message: "Error fetching users",
                error: err.message
            });
        }
        res.json(users || []);
    });
};

// Get user by ID
const getuserbyid = (req, res) => {
    const { id } = req.params;
    adminModel.getuserbyid(id, (err, users) => {
        if (err) {
            return res.status(500).json({
                message: "Error fetching user",
                error: err.message
            });
        }
        if (!users || users.length === 0) {
            return res.status(404).json({
                message: "User not found"
            });
        }
        res.json(users[0]);
    });
};

// Update user
const updateuser = (req, res) => {
    const { id } = req.params;
    const { name } = req.body;

    if (!name) {
        return res.status(400).json({
            message: "Name is required"
        });
    }

    adminModel.updateuser(id, name, (err, result) => {
        if (err) {
            return res.status(500).json({
                message: "Error updating user",
                error: err.message
            });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "User not found"
            });
        }
        res.json({
            message: "User updated successfully"
        });
    });
};

// Delete user
const deleteuser = (req, res) => {
    const { id } = req.params;
    adminModel.deleteuser(id, (err, result) => {
        if (err) {
            return res.status(500).json({
                message: "Error deleting user",
                error: err.message
            });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "User not found"
            });
        }
        res.json({
            message: "User deleted successfully"
        });
    });
};

// Get total users count
const getTotalUsers = (req, res) => {
    adminModel.getTotalUsers((err, result) => {
        if (err) {
            return res.status(500).json({
                message: "Error fetching total users",
                error: err.message
            });
        }
        const total = result && result.length > 0 ? result[0].totalUsers : 0;
        res.json({ totalUsers: total });
    });
};

export default { getusers, getuserbyid, updateuser, deleteuser, getTotalUsers };