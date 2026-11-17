import bcrypt from "bcryptjs";
import customerModel from "../models/customerModel.js";

// GET /api/customer/profile
const getProfile = (req, res) => {
    const id = req.user.id;
    customerModel.getProfileById(id, (err, results) => {
        if (err) return res.status(500).json({ message: "Database error" });
        if (results.length === 0) return res.status(404).json({ message: "User not found" });
        res.json(results[0]);
    });
};

// PUT /api/customer/profile
const updateProfile = (req, res) => {
    const id = req.user.id;
    const { name, mobile } = req.body;

    if (!name || !mobile) {
        return res.status(400).json({ message: "Name and mobile are required" });
    }

    customerModel.updateProfile(id, name, mobile, (err) => {
        if (err) return res.status(500).json({ message: "Database error" });
        res.json({ message: "Profile updated successfully" });
    });
};

// PUT /api/customer/change-password
const changePassword = async (req, res) => {
    const id = req.user.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: "Current and new password are required" });
    }

    customerModel.getPasswordById(id, async (err, results) => {
        if (err) return res.status(500).json({ message: "Database error" });
        if (results.length === 0) return res.status(404).json({ message: "User not found" });

        const isMatch = await bcrypt.compare(currentPassword, results[0].password);
        if (!isMatch) {
            return res.status(401).json({ message: "Current password is incorrect" });
        }

        try {
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            customerModel.updatePassword(id, hashedPassword, (err) => {
                if (err) return res.status(500).json({ message: "Database error" });
                res.json({ message: "Password changed successfully" });
            });
        } catch (error) {
            res.status(500).json({ message: "Server error" });
        }
    });
};

// DELETE /api/customer/delete-account
const deleteAccount = (req, res) => {
    const id = req.user.id;
    customerModel.deleteUserById(id, (err) => {
        if (err) return res.status(500).json({ message: "Database error" });
        res.json({ message: "Account deleted successfully" });
    });
};

const customerController = { getProfile, updateProfile, changePassword, deleteAccount };
export default customerController;
