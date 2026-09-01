import axios from "axios";
const API_URL = "http://localhost:8081/api";


//get total users
export const getTotalUsers = async () => {
    const token = localStorage.getItem("token");
    const response = await axios.get(
        `${API_URL}/admin/total-users`,
        { headers:{ Authorization: `Bearer ${token}`}}
    );
return response.data;
};

//register
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

//get user
export const getUsers = async () => {
    const token = localStorage.getItem("token");
    const response = await axios.get(
        `${API_URL}/users`,
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );
    return response.data;
};


//update user
export const updateUser = async (id, userData) => {
    const token = localStorage.getItem("token");
    const response = await axios.put(
        `${API_URL}/users/${id}`,
        userData,
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );
    return response.data;
};


//delete user
export const deleteUser = async (id) => {
    const token = localStorage.getItem("token");
    const response = await axios.delete(
        `${API_URL}/users/${id}`,
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
        `${API_URL}/order`, orderData,
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

