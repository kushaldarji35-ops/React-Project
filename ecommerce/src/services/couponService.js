import axios from "axios";

const API_URL = "http://localhost:5000/api";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    headers: {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    },
  };
};

// Fetch all coupons (Admin)
export const fetchCoupons = async (params = {}) => {
  const res = await axios.get(`${API_URL}/coupons`, {
    ...getAuthHeaders(),
    params,
  });
  return res.data;
};

// Fetch coupon stats (Admin)
export const fetchCouponStats = async () => {
  const res = await axios.get(`${API_URL}/coupons/stats`, getAuthHeaders());
  return res.data;
};

// Create a new coupon (Admin)
export const createCoupon = async (couponData) => {
  const res = await axios.post(`${API_URL}/coupons`, couponData, getAuthHeaders());
  return res.data;
};

// Update an existing coupon (Admin)
export const updateCoupon = async (id, couponData) => {
  const res = await axios.put(`${API_URL}/coupons/${id}`, couponData, getAuthHeaders());
  return res.data;
};

// Delete a coupon (Admin)
export const deleteCoupon = async (id) => {
  const res = await axios.delete(`${API_URL}/coupons/${id}`, getAuthHeaders());
  return res.data;
};

// Validate coupon during checkout/cart (Customer & Admin)
export const validateCouponApi = async (code, orderTotal) => {
  const res = await axios.post(`${API_URL}/coupons/validate`, {
    code,
    orderTotal,
  });
  return res.data;
};

