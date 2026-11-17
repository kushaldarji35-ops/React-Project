import bcrypt from "bcryptjs";
import { adminModel } from "../models/adminModel.js";
import productModel from "../models/productModel.js";
import orderModel from "../models/orderModel.js";

// GET ALL USERS
const getusers = (req, res) => {
  adminModel.getusers((err, results) => {
    if (err) return res.status(500).json({ message: "Database error" });
    res.json(results);
  });
};

// GET ONE USER BY ID
const getuserbyid = (req, res) => {
  const { id } = req.params;
  adminModel.getuserbyid(id, (err, results) => {
    if (err) return res.status(500).json({ message: "Database error" });
    if (results.length === 0) return res.status(404).json({ message: "User not found" });
    res.json(results[0]);
  });
};

// CREATE USER (ADMIN)
const createuser = async (req, res) => {
  const { name, email, mobile, password, role } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: "Name, email and password are required" });
  }
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    adminModel.createuser(name, email, mobile || "", hashedPassword, role || "customer", (err, result) => {
      if (err) return res.status(500).json({ message: "Error creating user or email already exists" });
      res.status(201).json({ message: "User created successfully", userId: result.insertId });
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// UPDATE USER
const updateuser = (req, res) => {
  const { id } = req.params;
  const { name, email, mobile, role } = req.body;
  adminModel.updateuser(id, { name, email, mobile, role }, (err) => {
    if (err) return res.status(500).json({ message: "Database error" });
    res.json({ message: "User updated successfully" });
  });
};

// DELETE USER
const deleteuser = (req, res) => {
  const { id } = req.params;
  adminModel.deleteuser(id, (err) => {
    if (err) return res.status(500).json({ message: "Database error" });
    res.json({ message: "User deleted successfully" });
  });
};

// GET TOTAL USERS COUNT
const getTotalUsers = (req, res) => {
  adminModel.getTotalUsers((err, results) => {
    if (err) return res.status(500).json({ message: "Database error" });
    res.json(results[0] || { totalUsers: 0 });
  });
};

// GET TOTAL ORDERS COUNT
const getTotalOrders = (req, res) => {
  orderModel.getTotalOrders((err, results) => {
    if (err) return res.status(500).json({ message: "Database error" });
    res.json(results[0] || { totalOrders: 0 });
  });
};

// GET TOTAL PRODUCTS COUNT
const getTotalProducts = (req, res) => {
  productModel.count((err, results) => {
    if (err) return res.status(500).json({ message: "Database error" });
    res.json(results[0] || { totalProducts: 0 });
  });
};

// GET REVENUE
const getRevenue = (req, res) => {
  orderModel.getTotalRevenue((err, results) => {
    if (err) return res.status(500).json({ message: "Database error" });
    res.json(results[0] || { totalRevenue: 0, revenue: 0 });
  });
};

const adminController = { getusers, getuserbyid, createuser, updateuser, deleteuser, getTotalUsers, getTotalOrders, getTotalProducts, getRevenue };
export { getusers, getuserbyid, createuser, updateuser, deleteuser, getTotalUsers, getTotalOrders, getTotalProducts, getRevenue };
export default adminController;
