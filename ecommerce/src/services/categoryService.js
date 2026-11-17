import axios from "axios";

const API_URL = "http://localhost:5000/api";

export const slugifyCategory = (value = "") =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const normalizeCategory = (category) => ({
  ...category,
  slug: category.slug || slugifyCategory(category.name),
  status: category.status?.toLowerCase() === "active" ? "Active" : "Inactive",
  createdAt: category.created_at
    ? String(category.created_at).slice(0, 10)
    : category.createdAt || "",
});

export const fetchDbCategories = async (params = {}) => {
  const response = await axios.get(`${API_URL}/categories`, { params });
  return (Array.isArray(response.data) ? response.data : []).map(normalizeCategory);
};

const normalizeSubcategory = (sub) => ({
  ...sub,
  slug: sub.slug || slugifyCategory(sub.name),
  status: sub.status?.toLowerCase() === "active" ? "Active" : "Inactive",
  createdAt: sub.created_at
    ? String(sub.created_at).slice(0, 10)
    : sub.createdAt || "",
});

export const fetchDbSubcategories = async () => {
  const response = await axios.get(`${API_URL}/subcategories`);
  return (Array.isArray(response.data) ? response.data : []).map(normalizeSubcategory);
};

const getAuthConfig = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
});

export const createDbCategory = async (category) => {
  const response = await axios.post(
    `${API_URL}/categories`,
    { ...category, status: category.status?.toLowerCase() },
    getAuthConfig(),
  );
  return response.data;
};

export const createDbSubcategory = async (subcategory) => {
  const response = await axios.post(
    `${API_URL}/subcategories`,
    { ...subcategory, status: subcategory.status?.toLowerCase() },
    getAuthConfig(),
  );
  return response.data;
};

export const updateDbSubcategory = async (id, subcategory) => {
  const response = await axios.put(
    `${API_URL}/subcategories/${id}`,
    { ...subcategory, status: subcategory.status?.toLowerCase() },
    getAuthConfig(),
  );
  return response.data;
};

export const deleteDbSubcategory = async (id) => {
  const response = await axios.delete(
    `${API_URL}/subcategories/${id}`,
    getAuthConfig(),
  );
  return response.data;
};

export const updateDbCategory = async (id, category) => {
  const response = await axios.put(
    `${API_URL}/categories/${id}`,
    { ...category, status: category.status?.toLowerCase() },
    getAuthConfig(),
  );
  return response.data;
};

export const deleteDbCategory = async (id) => {
  const response = await axios.delete(
    `${API_URL}/categories/${id}`,
    getAuthConfig(),
  );
  return response.data;
};