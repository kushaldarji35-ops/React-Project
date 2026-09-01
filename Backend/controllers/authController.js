import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import adminModel from "../models/adminModel.js";

//register
const register = async (req, res) => {
    const { name, email, password } = req.body;
    //required fields
    if (!name || !email || !password) {
        return res.status(400).json({
            message: "All field are required"
        });
    }
    //check if already exist
    adminModel.getuserbyemail(email, async (err, results) => {
        if (err) {
            return res.status(500).json({
                message: "Database error"
            });
        }
        if (results.length > 0) {
            return res.status(400).json({
                message: "Email already registered"
            });
        }
        //hash password
        try {
            const hashedpassword = await bcrypt.hash(password, 10);
            adminModel.createuser(
                name, email, hashedpassword, (err, result) => {
                    if (err) {
                        return res.status(500).json({
                            message: "error creating user"
                        });
                    }
                    res.status(201).json({
                        message: "Registration successful",
                        userID: result.insertId
                    });
                }
            );
        } catch (error) {
            res.status(500).json({
                message: "Server error"
            });
        }
    });
};

//login
const login = (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({
            message: "Email & password are required"
        });
    }
    //user find
    adminModel.getuserbyemail(email, async (err, users) => {
        if (err) {
            return res.status(500).json({
                message: "Database error"
            });
        }
        //user not found
        if (users.length === 0) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }
        const user = users[0];
        //compare password
        const passwordmatch = await bcrypt.compare(
            password, user.password
        );   
        if (!passwordmatch) {
            return res.status(401).json({
                message: "Invalid email or Password"
            });
        }
        //jwt create
        const token = jwt.sign(
            {
                id: user.id, email: user.email, role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1h"
            }
        );
        //send response
        res.json({
            message: "Login successful", token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    });
};

export { register, login };
