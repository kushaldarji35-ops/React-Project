import couponModel from "../models/couponModel.js";

const isValidDate = (value) => {
    if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    const date = new Date(`${value}T00:00:00.000Z`);
    return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
};

const getTodayDate = () => {
    const today = new Date();
    return [
        today.getFullYear(),
        String(today.getMonth() + 1).padStart(2, "0"),
        String(today.getDate()).padStart(2, "0"),
    ].join("-");
};

const validateValidity = (startDate, endDate) => {
    if (!isValidDate(startDate) || !isValidDate(endDate)) {
        return "Valid start and end dates are required";
    }
    if (startDate < getTodayDate()) {
        return "Start date cannot be before today";
    }
    if (endDate < getTodayDate()) {
        return "End date cannot be before today";
    }
    if (endDate < startDate) {
        return "End date cannot be before start date";
    }
    return null;
};

// GET /api/coupons - list coupons
const getCoupons = (req, res) => {
    const { status, search } = req.query;
    couponModel.getAll({ status, search }, (err, results) => {
        if (err) return res.status(500).json({ message: "Database error fetching coupons", error: err.message });
        res.json(results);
    });
};

// GET /api/coupons/stats - coupon KPI stats
const getCouponStats = (req, res) => {
    couponModel.count((err, results) => {
        if (err) return res.status(500).json({ message: "Database error fetching coupon stats", error: err.message });
        res.json(results[0] || {});
    });
};

// GET /api/coupons/:id - single coupon
const getCouponById = (req, res) => {
    const { id } = req.params;
    couponModel.getById(id, (err, results) => {
        if (err) return res.status(500).json({ message: "Database error", error: err.message });
        if (!results || results.length === 0) return res.status(404).json({ message: "Coupon not found" });
        res.json(results[0]);
    });
};

// POST /api/coupons - create coupon
const createCoupon = (req, res) => {
    const { code, discount_percent, min_order_amount, max_discount_amount, start_date, end_date, status } = req.body;
    if (!code || !code.trim()) {
        return res.status(400).json({ message: "Coupon code is required" });
    }
    if (discount_percent == null || isNaN(discount_percent) || Number(discount_percent) <= 0 || Number(discount_percent) > 100) {
        return res.status(400).json({ message: "Discount percent must be between 1 and 100" });
    }
    const validityError = validateValidity(start_date, end_date);
    if (validityError) return res.status(400).json({ message: validityError });

    couponModel.create(
        {
            code,
            discount_percent,
            min_order_amount,
            max_discount_amount,
            start_date,
            end_date,
            status: status || "active",
        },
        (err, result) => {
            if (err) {
                if (err.code === "ER_DUP_ENTRY") {
                    return res.status(400).json({ message: "A coupon with this code already exists" });
                }
                return res.status(500).json({ message: "Error creating coupon", error: err.message });
            }
            res.status(201).json({
                message: "Coupon created successfully",
                couponId: result.insertId,
            });
        }
    );
};

// PUT /api/coupons/:id - update coupon
const updateCoupon = (req, res) => {
    const { id } = req.params;
    const { code, discount_percent, min_order_amount, max_discount_amount, start_date, end_date, status } = req.body;
    if (start_date || end_date) {
        const validityError = validateValidity(start_date, end_date);
        if (validityError) return res.status(400).json({ message: validityError });
    }

    couponModel.update(
        id,
        { code, discount_percent, min_order_amount, max_discount_amount, start_date, end_date, status },
        (err, result) => {
            if (err) {
                if (err.code === "ER_DUP_ENTRY") {
                    return res.status(400).json({ message: "A coupon with this code already exists" });
                }
                return res.status(500).json({ message: "Error updating coupon", error: err.message });
            }
            if (result.affectedRows === 0) return res.status(404).json({ message: "Coupon not found" });
            res.json({ message: "Coupon updated successfully" });
        }
    );
};

// DELETE /api/coupons/:id - delete coupon
const deleteCoupon = (req, res) => {
    const { id } = req.params;
    couponModel.remove(id, (err, result) => {
        if (err) return res.status(500).json({ message: "Error deleting coupon", error: err.message });
        if (result.affectedRows === 0) return res.status(404).json({ message: "Coupon not found" });
        res.json({ message: "Coupon deleted successfully" });
    });
};

// POST /api/coupons/validate - validate and calculate discount for customer
const validateCoupon = (req, res) => {
    const { code, orderTotal } = req.body;
    if (!code || !code.trim()) {
        return res.status(400).json({ message: "Please provide a coupon code" });
    }

    couponModel.getByCode(code.trim(), (err, results) => {
        if (err) return res.status(500).json({ message: "Error validating coupon", error: err.message });
        if (!results || results.length === 0) {
            return res.status(404).json({ message: "Invalid coupon code." });
        }

        const coupon = results[0];

        if (coupon.validity_invalid) {
            return res.status(400).json({
                message: "This coupon has invalid validity dates. Please update it.",
            });
        }

        // 1. Check status
        if (coupon.status && coupon.status.toLowerCase() !== "active") {
            return res.status(400).json({ message: "This coupon is currently inactive." });
        }

        // 2. Check validity dates
        const todayDate = getTodayDate();
        if (coupon.start_date && coupon.start_date > todayDate) {
            return res.status(400).json({ message: "This coupon is not active yet." });
        }
        if (coupon.end_date && coupon.end_date < todayDate) {
            return res.status(400).json({ message: "This coupon has expired." });
        }

        const total = Number(orderTotal) || 0;

        // 3. Check min order amount
        if (coupon.min_order_amount && total < Number(coupon.min_order_amount)) {
            return res.status(400).json({
                message: `Minimum order amount of $${coupon.min_order_amount} required to use this coupon.`,
            });
        }

        // 4. Calculate discount
        const percent = Number(coupon.discount_percent || 0);
        let discount = Math.round(total * (percent / 100));

        if (coupon.max_discount_amount && discount > Number(coupon.max_discount_amount)) {
            discount = Number(coupon.max_discount_amount);
        }

        res.json({
            valid: true,
            code: coupon.code,
            discountPercent: percent,
            discountAmount: discount,
            message: `${coupon.code} applied successfully!`,
        });
    });
};

const couponController = {
    getCoupons,
    getCouponStats,
    getCouponById,
    createCoupon,
    updateCoupon,
    deleteCoupon,
    validateCoupon,
};

export default couponController;

