import axios from "axios";
const API_URL = "http://localhost:5000/api";

// Session inactivity timeout durations (in milliseconds)
// Admin: 7 days
// Customer: 60 minutes of inactivity
export const ADMIN_INACTIVITY_LIMIT = 7 * 24 * 60 * 60 * 1000;
export const CUSTOMER_INACTIVITY_LIMIT = 60 * 60 * 1000;

// Helper: Get role of currently logged in user
export const getUserRole = () => {
    try {
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        if (user && user.role) return user.role.toLowerCase();
        const token = localStorage.getItem("token");
        if (token) {
            const parts = token.split(".");
            if (parts.length === 3) {
                const payload = JSON.parse(atob(parts[1]));
                return (payload.role || "customer").toLowerCase();
            }
        }
    } catch {
        return "customer";
    }
    return "customer";
};

// Helper: Get inactivity limit based on role
export const getInactivityLimit = () => {
    return getUserRole() === "admin"
        ? ADMIN_INACTIVITY_LIMIT
        : CUSTOMER_INACTIVITY_LIMIT;
};

// Record user activity timestamp (throttled to once every 2 seconds)
export const recordUserActivity = () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    const now = Date.now();
    const last = parseInt(localStorage.getItem("lastActivity") || "0", 10);
    if (now - last > 2000) {
        localStorage.setItem("lastActivity", now.toString());
    }
};

// Check if current token / session is expired locally (JWT exp timestamp OR inactivity timeout)
export const isSessionExpired = () => {
    const token = localStorage.getItem("token");
    if (!token) return true;

    // 1. Check JWT expiration timestamp
    try {
        const parts = token.split(".");
        if (parts.length === 3) {
            const payload = JSON.parse(atob(parts[1]));
            if (payload.exp && Date.now() >= payload.exp * 1000) {
                return true;
            }
        }
    } catch {
        return true;
    }

    // 2. Check idle inactivity timeout
    const lastActivity = parseInt(localStorage.getItem("lastActivity") || "0", 10);
    if (lastActivity > 0) {
        const limit = getInactivityLimit();
        if (Date.now() - lastActivity >= limit) {
            return true;
        }
    }

    return false;
};

// Clear session helper
export const clearSession = (reason = "expired") => {
    const prevUser = localStorage.getItem("user");
    const prevRole = getUserRole();

    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("userName");
    localStorage.removeItem("lastActivity");

    if (reason === "expired") {
        localStorage.setItem("sessionExpired", "true");
        if (prevRole) {
            localStorage.setItem("sessionExpiredRole", prevRole);
        }
    } else {
        localStorage.removeItem("sessionExpired");
        localStorage.removeItem("sessionExpiredRole");
    }

    try {
        window.dispatchEvent(new Event("cartAuthChange"));
        window.dispatchEvent(
            new CustomEvent("sessionExpiredEvent", {
                detail: {
                    reason,
                    role: prevRole,
                    user: prevUser ? JSON.parse(prevUser) : null,
                },
            })
        );
    } catch (e) {
        // ignore in non-browser env
    }
};

// Trigger manual session expiration (convenient for testing or forced logout)
export const triggerSessionExpired = (reason = "expired") => {
    clearSession(reason);
};

if (typeof window !== "undefined") {
    window.__expireSession = () => {
        clearSession("expired");
    };
}

// Axios Request Interceptor — check session expiry before sending authenticated requests
axios.interceptors.request.use(
    (config) => {
        const url = config.url || "";
        const isAuthEndpoint =
            url.includes("/auth/login") || url.includes("/auth/register");
        const token = localStorage.getItem("token");
        if (!isAuthEndpoint && token && isSessionExpired()) {
            clearSession("expired");
            return Promise.reject(
                new Error("Session expired. Please log in again.")
            );
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Axios Response Interceptor — catch 401 Unauthorized errors and handle session expiry
axios.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            const url = error.config?.url || "";
            const isAuthEndpoint =
                url.includes("/auth/login") || url.includes("/auth/register");
            if (!isAuthEndpoint) {
                clearSession("expired");
            }
        }
        return Promise.reject(error);
    }
);


//get total users
export const getTotalUsers = async () => {
    const token = localStorage.getItem("token");
    const response = await axios.get(
        `${API_URL}/admin/total-users`,
        { headers:{ Authorization: `Bearer ${token}`}}
    );
return response.data;
};

// get total orders
export const getTotalOrders = async () => {
    const token = localStorage.getItem("token");
    const response = await axios.get(
        `${API_URL}/admin/total-orders`,
        { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
};

// get total products
export const getTotalProducts = async () => {
    const token = localStorage.getItem("token");
    const response = await axios.get(
        `${API_URL}/admin/total-products`,
        { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
};

// get total revenue
export const getRevenue = async () => {
    const token = localStorage.getItem("token");
    const response = await axios.get(
        `${API_URL}/admin/revenue`,
        { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
};


export const registerUser = async (userData) => {
    const response = await axios.post(
        `${API_URL}/auth/register`,
        userData
    );
     return response.data;
};

//login
export const loginUser = async (userData) => {
    const response = await axios.post(
        `${API_URL}/auth/login`,
        userData
    );
    return response.data;
};

//get all users (admin)
export const getUsers = async () => {
    const token = localStorage.getItem("token");
    try {
        const response = await axios.get(
            `${API_URL}/admin`,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );
        return response.data;
    } catch (err) {
        const response = await axios.get(
            `${API_URL}/admin/users`,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );
        return response.data;
    }
};

// create user (admin)
export const createAdminUser = async (userData) => {
    const token = localStorage.getItem("token");
    const response = await axios.post(
        `${API_URL}/auth/register`,
        userData,
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );
    return response.data;
};

//update user (admin)
export const updateUser = async (id, userData) => {
    const token = localStorage.getItem("token");
    const response = await axios.put(
        `${API_URL}/admin/${id}`,
        userData,
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );
    return response.data;
};

//delete user (admin)
export const deleteUser = async (id) => {
    const token = localStorage.getItem("token");
    const response = await axios.delete(
        `${API_URL}/admin/${id}`,
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );
    return response.data;
};


// get all orders
export const getOrders = async () => {
    const token = localStorage.getItem("token");
    const response = await axios.get(
        `${API_URL}/order`,
        {
            headers: { Authorization: `Bearer ${token}` }
        }
    );
    return response.data;
};

// get order stats (counts)
export const getOrderStats = async () => {
    const token = localStorage.getItem("token");
    const response = await axios.get(
        `${API_URL}/order/stats`,
        { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
};


// update order
export const updateOrder = async (id, orderData) => {
    const token = localStorage.getItem("token");
    const response = await axios.put(
        `${API_URL}/order/${id}`, orderData,
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );
    return response.data;
};

// delete order
export const deleteOrder = async (id) => {
    const token = localStorage.getItem("token");
    const response = await axios.delete(
        `${API_URL}/order/${id}`,
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );
    return response.data;
};

// create order
export const createOrder = async (orderData) => {
    const token = localStorage.getItem("token");
    const response = await axios.post(
        `${API_URL}/orders`, orderData,
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );
    return response.data;
};

/* CUSTOMER SIDE APIs (/api/customer)*/

// Get orders for currently logged in customer
export const getCustomerOrders = async () => {
    const token = localStorage.getItem("token");
    const response = await axios.get(
        `${API_URL}/customer/orders`,
        { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
};

// Create new customer order (auto-attaches customer token info)
export const createCustomerOrder = async (orderData) => {
    const token = localStorage.getItem("token");
    const response = await axios.post(
        `${API_URL}/customer/orders`,
        orderData,
        { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
};

// Update customer order
export const updateCustomerOrder = async (id, orderData) => {
    const token = localStorage.getItem("token");
    const response = await axios.put(
        `${API_URL}/customer/orders/${id}`,
        orderData,
        { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
};

// Delete / Cancel customer order
export const deleteCustomerOrder = async (id) => {
    const token = localStorage.getItem("token");
    const response = await axios.delete(
        `${API_URL}/customer/orders/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
};

// Get stats for customer dashboard
export const getCustomerOrderStats = async () => {
    const token = localStorage.getItem("token");
    const response = await axios.get(
        `${API_URL}/customer/stats`,
        { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
};

// Get customer profile
export const getCustomerProfile = async () => {
    const token = localStorage.getItem("token");
    const response = await axios.get(
        `${API_URL}/customer/profile`,
        { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
};

// Update customer profile (name, mobile)
export const updateCustomerProfile = async (profileData) => {
    const token = localStorage.getItem("token");
    const response = await axios.put(
        `${API_URL}/customer/profile`,
        profileData,
        { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
};

// Change customer password
export const changeCustomerPassword = async (passwordData) => {
    const token = localStorage.getItem("token");
    const response = await axios.put(
        `${API_URL}/customer/change-password`,
        passwordData,
        { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
};

// Delete customer account permanently
export const deleteCustomerAccount = async () => {
    const token = localStorage.getItem("token");
    const response = await axios.delete(
        `${API_URL}/customer/delete-account`,
        { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
};

/* ADDRESS APIs (/api/address) */

// Get all saved addresses
export const getAddresses = async () => {
    const token = localStorage.getItem("token");
    const response = await axios.get(
        `${API_URL}/address`,
        { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
};

// Save a new address
export const saveAddress = async (addressData) => {
    const token = localStorage.getItem("token");
    const response = await axios.post(
        `${API_URL}/address`,
        addressData,
        { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
};

// Update an existing address
export const updateAddress = async (id, addressData) => {
    const token = localStorage.getItem("token");
    const response = await axios.put(
        `${API_URL}/address/${id}`,
        addressData,
        { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
};

// Delete an address
export const deleteAddress = async (id) => {
    const token = localStorage.getItem("token");
    const response = await axios.delete(
        `${API_URL}/address/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
};

/* ── CART APIs (/api/cart) ── */

// Get user's cart from database
export const getDbCart = async () => {
    const token = localStorage.getItem("token");
    if (!token) return [];
    const response = await axios.get(
        `${API_URL}/cart`,
        { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
};

// Add item to cart in database
export const addToDbCart = async (cartData) => {
    const token = localStorage.getItem("token");
    if (!token) return null;
    const response = await axios.post(
        `${API_URL}/cart/add`,
        cartData,
        { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
};

// Update item quantity in database
export const updateDbCartQuantity = async (cartItemId, quantity) => {
    const token = localStorage.getItem("token");
    if (!token) return null;
    const response = await axios.put(
        `${API_URL}/cart/${cartItemId}`,
        { quantity },
        { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
};

// Remove single item from cart in database
export const removeFromDbCart = async (cartItemId) => {
    const token = localStorage.getItem("token");
    if (!token) return null;
    const response = await axios.delete(
        `${API_URL}/cart/${cartItemId}`,
        { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
};

// Clear entire cart in database
export const clearDbCart = async () => {
    const token = localStorage.getItem("token");
    if (!token) return null;
    const response = await axios.delete(
        `${API_URL}/cart`,
        { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
};

// Sync local items to database cart upon login
export const syncDbCart = async (items) => {
    const token = localStorage.getItem("token");
    if (!token) return null;
    const response = await axios.post(
        `${API_URL}/cart/sync`,
        { items },
        { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
};
