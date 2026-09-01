import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import authroutes from "./routes/authroutes.js";
import adminroutes from "./routes/adminroutes.js";
import orderroutes from "./routes/orderrouts.js";
import customerroutes from "./routes/customerroutes.js";
import customerOrderRoutes from "./routes/customerOrderRoutes.js";

dotenv.config();

const app = express();

//Middleware
app.use(cors());
app.use(express.json());

//Routes
app.use("/api/auth", authroutes);
app.use("/api/users", adminroutes);
app.use("/api/admin", adminroutes);
app.use("/api/order", orderroutes);
app.use("/api/customers", customerroutes);
app.use("/api/customer", customerOrderRoutes);


//Home API
app.get("/", (req, res) => {
    res.json({
        message: "Backend API is running"
    });
});

const PORT = process.env.PORT || 8081;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});