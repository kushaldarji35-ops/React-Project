import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import adminModel from "../models/adminModel.js";

// // ─── Helper: Generate a random N-digit numeric OTP ─────────────────────────
// const generateOtp = (digits = 4) => {
//   const min = Math.pow(10, digits - 1);
//   const max = Math.pow(10, digits) - 1;
//   return String(Math.floor(Math.random() * (max - min + 1)) + min);
// };


//register
const register = async (req, res) => {
    const { name, email, mobile, password } = req.body;
    //required fields
    if (!name || !email || !mobile || !password) {
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
                    name,
                    email,
                    mobile,
                    hashedpassword,
                    "customer",
                    (err, result) => {
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
    const { emailOrMobile, password } = req.body;
    if (!emailOrMobile || !password) {
        return res.status(400).json({
            message: "Email/Mobile & password are required"
        });
    }
    //user find by email or mobile
    adminModel.getuserbyemailormobile(emailOrMobile, async (err, users) => {
        if (err) {
            return res.status(500).json({
                message: "Database error"
            });
        }
        //user not found
        if (users.length === 0) {
            return res.status(401).json({
                message: "Invalid email/mobile or password"
            });
        }
        const user = users[0];
        //compare password
        const passwordmatch = await bcrypt.compare(
            password, user.password
        );
        if (!passwordmatch) {
            return res.status(401).json({
                message: "Invalid email/mobile or password"
            });
        }
        //jwt create session
        const sessionExpiry = user.role?.toLowerCase() === "admin"
            ? "7d"
            : process.env.JWT_EXPIRES_IN || "1d";
        const token = jwt.sign(
            {
                id: user.id, email: user.email, role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: sessionExpiry
            }
        );
        //send response
        res.json({
            message: "Login successful",
            token,
            sessionExpiry,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                mobile: user.mobile,
                role: user.role
            }
        });
    });
};

export { register, login };
