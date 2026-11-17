import db from "../config/db.js";

// Ensure addresses table and all columns exist on startup
const initAddressTable = () => {
    const createSql = `
        CREATE TABLE IF NOT EXISTS addresses (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            full_name VARCHAR(255) NULL,
            mobile VARCHAR(30) NULL,
            email VARCHAR(255) NULL,
            line1 VARCHAR(255) NOT NULL,
            line2 VARCHAR(255) NULL,
            line3 VARCHAR(255) NULL,
            city VARCHAR(100) NOT NULL,
            state VARCHAR(100) NOT NULL,
            pincode VARCHAR(20) NOT NULL,
            country VARCHAR(100) DEFAULT 'India',
            address_type VARCHAR(50) DEFAULT 'home',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX idx_address_user (user_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `;

    db.query(createSql, (err) => {
        if (err) {
            console.error("[addressModel] Error ensuring addresses table exists:", err.message);
            return;
        }

        // Add any missing columns to existing tables
        db.query("SHOW COLUMNS FROM addresses", (colErr, results) => {
            if (colErr || !Array.isArray(results)) return;
            const existingCols = results.map((r) => r.Field.toLowerCase());

            const requiredCols = [
                { name: "full_name", type: "VARCHAR(255) NULL" },
                { name: "mobile", type: "VARCHAR(30) NULL" },
                { name: "email", type: "VARCHAR(255) NULL" },
                { name: "line2", type: "VARCHAR(255) NULL" },
                { name: "line3", type: "VARCHAR(255) NULL" },
                { name: "country", type: "VARCHAR(100) DEFAULT 'India'" },
                { name: "address_type", type: "VARCHAR(50) DEFAULT 'home'" },
            ];

            requiredCols.forEach((col) => {
                if (!existingCols.includes(col.name.toLowerCase())) {
                    db.query(`ALTER TABLE addresses ADD COLUMN ${col.name} ${col.type}`, (alterErr) => {
                        if (!alterErr) {
                            console.log(`[addressModel] Added missing column '${col.name}' to addresses table`);
                        }
                    });
                }
            });
        });
    });
};

// Run table initialization
initAddressTable();

// Helper to get actual columns in addresses table
const getTableColumns = (callback) => {
    db.query("SHOW COLUMNS FROM addresses", (err, results) => {
        if (err || !Array.isArray(results)) {
            return callback(null, [
                "id",
                "user_id",
                "full_name",
                "mobile",
                "email",
                "line1",
                "line2",
                "line3",
                "city",
                "state",
                "pincode",
                "country",
                "address_type",
            ]);
        }
        callback(null, results.map((r) => r.Field.toLowerCase()));
    });
};

// Get all addresses for a user
const getByUserId = (userId, callback) => {
    const sql = "SELECT * FROM addresses WHERE user_id = ? ORDER BY id DESC";
    db.query(sql, [userId], (err, results) => {
        if (err) {
            console.error("[addressModel.getByUserId] Error:", err.message);
            // If table doesn't exist, initialize and return empty list
            if (err.errno === 1146 || err.code === "ER_NO_SUCH_TABLE") {
                initAddressTable();
                return callback(null, []);
            }
            return callback(err);
        }
        callback(null, results);
    });
};

// Get a single address by id (and verify it belongs to the user)
const getById = (id, userId, callback) => {
    const sql = "SELECT * FROM addresses WHERE id = ? AND user_id = ?";
    db.query(sql, [id, userId], callback);
};

// Create a new address dynamically matching database columns
const create = (userId, data, callback) => {
    getTableColumns((_, columns) => {
        const colSet = new Set(columns);

        const row = {};
        if (colSet.has("user_id")) row.user_id = userId;

        // Name
        if (colSet.has("full_name")) {
            row.full_name = data.full_name || data.fullName || "";
        } else if (colSet.has("name")) {
            row.name = data.full_name || data.fullName || "";
        }

        // Mobile
        if (colSet.has("mobile")) {
            row.mobile = data.mobile || data.phone || "";
        } else if (colSet.has("phone")) {
            row.phone = data.mobile || data.phone || "";
        }

        // Email
        if (colSet.has("email")) {
            row.email = data.email || null;
        }

        // Line 1
        if (colSet.has("line1")) {
            row.line1 = data.line1 || data.address_line1 || "";
        } else if (colSet.has("address_line1")) {
            row.address_line1 = data.line1 || data.address_line1 || "";
        }

        // Line 2 & Line 3 handling
        if (colSet.has("line3")) {
            if (colSet.has("line2")) row.line2 = data.line2 || null;
            row.line3 = data.line3 || null;
        } else {
            // If line3 column does not exist, merge line2 and line3 into line2
            const merged = [data.line2, data.line3].filter(Boolean).join(", ");
            if (colSet.has("line2")) {
                row.line2 = merged || null;
            } else if (colSet.has("address_line2")) {
                row.address_line2 = merged || null;
            }
        }

        // City, State, Pincode
        if (colSet.has("city")) row.city = data.city || "";
        if (colSet.has("state")) row.state = data.state || "";
        if (colSet.has("pincode")) {
            row.pincode = data.pincode || data.zip || "";
        } else if (colSet.has("zip")) {
            row.zip = data.pincode || data.zip || "";
        }

        // Country & Address Type
        if (colSet.has("country")) row.country = data.country || "India";
        if (colSet.has("address_type")) {
            row.address_type = (data.address_type || "home").toLowerCase();
        }

        const keys = Object.keys(row);
        const values = Object.values(row);
        const placeholders = keys.map(() => "?").join(", ");

        const sql = `INSERT INTO addresses (${keys.join(", ")}) VALUES (${placeholders})`;

        db.query(sql, values, (err, result) => {
            if (err) {
                console.error("[addressModel.create] SQL Error:", err);
                return callback(err);
            }
            callback(null, result);
        });
    });
};

// Update an existing address dynamically matching database columns
const update = (id, userId, data, callback) => {
    getTableColumns((_, columns) => {
        const colSet = new Set(columns);

        const updates = [];
        const values = [];

        if (colSet.has("full_name") && data.full_name !== undefined) {
            updates.push("full_name = ?");
            values.push(data.full_name);
        }
        if (colSet.has("mobile") && data.mobile !== undefined) {
            updates.push("mobile = ?");
            values.push(data.mobile);
        }
        if (colSet.has("email") && data.email !== undefined) {
            updates.push("email = ?");
            values.push(data.email || null);
        }
        if (colSet.has("line1") && data.line1 !== undefined) {
            updates.push("line1 = ?");
            values.push(data.line1);
        }

        if (colSet.has("line3")) {
            if (colSet.has("line2") && data.line2 !== undefined) {
                updates.push("line2 = ?");
                values.push(data.line2 || null);
            }
            if (data.line3 !== undefined) {
                updates.push("line3 = ?");
                values.push(data.line3 || null);
            }
        } else if (colSet.has("line2")) {
            const merged = [data.line2, data.line3].filter(Boolean).join(", ");
            updates.push("line2 = ?");
            values.push(merged || null);
        }

        if (colSet.has("city") && data.city !== undefined) {
            updates.push("city = ?");
            values.push(data.city);
        }
        if (colSet.has("state") && data.state !== undefined) {
            updates.push("state = ?");
            values.push(data.state);
        }
        if (colSet.has("pincode") && data.pincode !== undefined) {
            updates.push("pincode = ?");
            values.push(data.pincode);
        }
        if (colSet.has("country") && data.country !== undefined) {
            updates.push("country = ?");
            values.push(data.country || "India");
        }
        if (colSet.has("address_type") && data.address_type !== undefined) {
            updates.push("address_type = ?");
            values.push((data.address_type || "home").toLowerCase());
        }

        if (updates.length === 0) {
            return callback(null, { affectedRows: 1 });
        }

        values.push(id, userId);
        const sql = `UPDATE addresses SET ${updates.join(", ")} WHERE id = ? AND user_id = ?`;

        db.query(sql, values, (err, result) => {
            if (err) {
                console.error("[addressModel.update] SQL Error:", err);
                return callback(err);
            }
            callback(null, result);
        });
    });
};

// Delete an address
const remove = (id, userId, callback) => {
    const sql = "DELETE FROM addresses WHERE id = ? AND user_id = ?";
    db.query(sql, [id, userId], callback);
};

const addressModel = {
    initAddressTable,
    getByUserId,
    getById,
    create,
    update,
    remove,
};

export default addressModel;
