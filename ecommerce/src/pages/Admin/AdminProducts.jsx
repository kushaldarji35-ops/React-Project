import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  IoSearchOutline,
  IoAddOutline,
  IoPencilOutline,
  IoTrashOutline,
  IoShirtOutline,
  IoCheckmarkCircleOutline,
  IoAlertCircleOutline,
  IoCloseOutline,
  IoStar,
  IoCheckmark,
  IoRefreshOutline,
} from "react-icons/io5";
import AdminSidebar from "./AdminSidebar";
import AdminPagination from "./AdminPagination";
import AdminSearchableSelect from "./AdminSearchableSelect";
import { isSessionExpired, clearSession } from "../../services/authService";
import {
  fetchDbProducts,
  createDbProduct,
  updateDbProduct,
  deleteDbProduct,
} from "../../services/productService";
import { fetchDbSubcategories } from "../../services/categoryService";
import "./AdminPages.css";

const CATEGORIES = ["casual", "formal", "gym", "party"];
const ALL_SIZES = ["Small", "Medium", "Large", "X-Large", "XX-Large"];
const ALL_COLORS = [
  { name: "Black", hex: "#000000" },
  { name: "White", hex: "#FFFFFF" },
  { name: "Green", hex: "#4CAF50" },
  { name: "Red", hex: "#F44336" },
  { name: "Yellow", hex: "#FFEB3B" },
  { name: "Orange", hex: "#FF9800" },
  { name: "Sky Blue", hex: "#03A9F4" },
  { name: "Blue", hex: "#2196F3" },
  { name: "Purple", hex: "#9C27B0" },
  { name: "Pink", hex: "#FF69B4" },
  { name: "Olive", hex: "#4F4631" },
  { name: "Skin", hex: "#E6B2B4" },
  { name: "Brown", hex: "#541E2A" },
];

export default function AdminProducts() {
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

  const [productsList, setProductsList] = useState(() => {
    const saved = localStorage.getItem("admin_products_data");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return [];
  });
  const [loading, setLoading] = useState(false);
  const [subcategories, setSubcategories] = useState([]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await fetchDbProducts();
      setProductsList(data);
    } catch (err) {
      console.error("Error loading products from database:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  },[]);

  useEffect(() => {
    fetchDbSubcategories()
      .then(setSubcategories)
      .catch((error) => {
        console.error("Error loading subcategories:", error);
        setToastMessage("Failed to load subcategories");
      });
  }, []);

  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    category: "casual",
    subcategory: "",
    price: "",
    originalPrice: "",
    discountPercent: "",
    rating: 4.5,
    stockStatus: "In Stock",
    description: "",
    sizes: [],
    colors: [],
    imageUrl: "",
    subImages: [],
  });
  const [formErrors, setFormErrors] = useState({});
  const [toastMessage, setToastMessage] = useState("");
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setCategoryFilter("all");
    setStockFilter("all");
    showToast("Filters cleared");
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token || isSessionExpired()) {
      clearSession("expired");
      navigate("/login?expired=1");
    }
  }, [navigate]);

  useEffect(() => {
    localStorage.setItem("admin_products_data", JSON.stringify(productsList));
    window.dispatchEvent(new Event("products_updated"));
  }, [productsList]);

  // Statistics
  const totalProducts = productsList.length;
  const inStockCount = productsList.filter(
    (p) => (p.stockStatus || "In Stock") === "In Stock",
  ).length;
  const lowStockCount = productsList.filter(
    (p) => p.stockStatus === "Low Stock",
  ).length;
  const uniqueCategories = Array.from(
    new Set(productsList.map((p) => p.category || "casual")),
  ).length;

  // Filtered Products
  const filteredProducts = productsList.filter((prod) => {
    const nameMatch = (prod.name || "")
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const catMatch = (prod.category || "")
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesSearch = nameMatch || catMatch;

    const matchesCategory =
      categoryFilter === "all" ||
      (prod.category || "").toLowerCase() === categoryFilter.toLowerCase();

    const matchesStock =
      stockFilter === "all" ||
      (prod.stockStatus || "In Stock").toLowerCase() ===
        stockFilter.toLowerCase();

    return matchesSearch && matchesCategory && matchesStock;
  });

  // Reset pagination on filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, categoryFilter, stockFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedProducts = filteredProducts.slice(
    (safeCurrentPage - 1) * pageSize,
    safeCurrentPage * pageSize,
  );

  // Sub Images helpers
  const handleSubImagesUpload = (files) => {
    if (!files || files.length === 0) return;
    const fileList = Array.from(files);
    const readers = fileList.map((file) => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.readAsDataURL(file);
      });
    });
    Promise.all(readers).then((newImages) => {
      setFormData((prev) => ({
        ...prev,
        subImages: [...(prev.subImages || []), ...newImages],
      }));
    });
  };

  const handleRemoveSubImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      subImages: (prev.subImages || []).filter((_, i) => i !== index),
    }));
  };

  const handleReplaceSubImage = (index, file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      setFormData((prev) => {
        const updated = [...(prev.subImages || [])];
        updated[index] = e.target.result;
        return { ...prev, subImages: updated };
      });
    };
    reader.readAsDataURL(file);
  };

  // Handle Add Product
  const handleOpenAdd = () => {
    setFormData({
      name: "",
      category: "casual",
      subcategory: "",
      price: "",
      originalPrice: "",
      discountPercent: "",
      rating: 4.5,
      stockStatus: "In Stock",
      description: "",
      sizes: [],
      colors: [],
      imageUrl: "",
      subImages: [],
    });
    setFormErrors({});
    setIsAddModalOpen(true);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!formData.name.trim()) errs.name = "Product title is required";
    if (!formData.price || Number(formData.price) <= 0)
      errs.price = "Enter a valid positive price";

    if (Object.keys(errs).length > 0) {
      setFormErrors(errs);
      return;
    }

    try {
      const combinedImages = [
        formData.imageUrl,
        ...(formData.subImages || []),
      ].filter(Boolean);

      await createDbProduct({
        ...formData,
        imageUrl: combinedImages[0] || "",
        images: combinedImages,
      });
      await loadProducts();
      setIsAddModalOpen(false);
      showToast("Product saved!");
    } catch (err) {
      showToast(
        err.response?.data?.message || "Failed to add product.",
      );
    }
  };

  // Handle Edit Product
  const handleOpenEdit = (product) => {
    setSelectedProduct(product);
    const prodImages =
      Array.isArray(product.images) && product.images.length > 0
        ? product.images
        : product.image
          ? [product.image]
          : [];

    setFormData({
      name: product.name || "",
      category: product.category || "casual",
      subcategory: product.subcategory || "",
      price: product.price || "",
      originalPrice: product.originalPrice || "",
      discountPercent: product.discountPercent || "",
      stockStatus: product.stockStatus || "In Stock",
      description: product.description || "",
      sizes: Array.isArray(product.sizes) ? product.sizes : [],
      colors: Array.isArray(product.colors) ? product.colors : [],
      imageUrl: prodImages[0] || "",
      subImages: prodImages.slice(1),
    });
    setFormErrors({});
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.price) {
      setFormErrors({ name: "Title and Price are required" });
      return;
    }

    try {
      const combinedImages = [
        formData.imageUrl,
        ...(formData.subImages || []),
      ].filter(Boolean);

      await updateDbProduct(selectedProduct.id, {
        ...formData,
        imageUrl: combinedImages[0] || "",
        images: combinedImages,
      });
      await loadProducts();
      setIsEditModalOpen(false);
      showToast("Product updated!");
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to update product.");
    }
  };

  // Handle Delete Product
  const handleDeleteConfirm = async () => {
    if (!selectedProduct) return;
    try {
      await deleteDbProduct(selectedProduct.id);
      await loadProducts();
      setIsDeleteModalOpen(false);
      showToast("Product deleted!");
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to delete product.");
    }
  };

  // Auto-calculate Price when Original Price & Discount are entered
  const handlePriceChange = (val) => {
    const pr = val;
    let newDiscount = formData.discountPercent;
    if (
      formData.originalPrice &&
      pr !== "" &&
      !isNaN(formData.originalPrice) &&
      !isNaN(pr)
    ) {
      const o = Number(formData.originalPrice);
      const p = Number(pr);
      if (o > p && p > 0) {
        newDiscount = Math.round(((o - p) / o) * 100);
      }
    }
    setFormData((prev) => ({
      ...prev,
      price: pr,
      discountPercent: newDiscount,
    }));
    if (pr && Number(pr) > 0) {
      setFormErrors((prev) => ({ ...prev, price: undefined }));
    }
  };

  const handleOriginalPriceChange = (val) => {
    const orig = val;
    let newPrice = formData.price;
    const discount = formData.discountPercent;

    if (orig !== "" && discount !== "" && !isNaN(orig) && !isNaN(discount)) {
      const o = Number(orig);
      const d = Number(discount);
      if (o > 0 && d >= 0 && d <= 100) {
        newPrice = Math.round(o - (o * d) / 100);
      }
    }
    setFormData((prev) => ({
      ...prev,
      originalPrice: orig,
      price: newPrice,
    }));
    if (newPrice && Number(newPrice) > 0) {
      setFormErrors((prev) => ({ ...prev, price: undefined }));
    }
  };

  const handleDiscountChange = (val) => {
    const discount = val;
    let newPrice = formData.price;
    const orig = formData.originalPrice;

    if (orig !== "" && discount !== "" && !isNaN(orig) && !isNaN(discount)) {
      const o = Number(orig);
      const d = Number(discount);
      if (o > 0 && d >= 0 && d <= 100) {
        newPrice = Math.round(o - (o * d) / 100);
      }
    }
    setFormData((prev) => ({
      ...prev,
      discountPercent: discount,
      price: newPrice,
    }));
    if (newPrice && Number(newPrice) > 0) {
      setFormErrors((prev) => ({ ...prev, price: undefined }));
    }
  };

  const handleToggleSize = (size) => {
    const current = formData.sizes || [];
    if (current.includes(size)) {
      setFormData({
        ...formData,
        sizes: current.filter((s) => s !== size),
      });
    } else {
      setFormData({
        ...formData,
        sizes: [...current, size],
      });
    }
  };

  const handleToggleColor = (hex) => {
    const current = formData.colors || [];
    if (current.includes(hex)) {
      setFormData({
        ...formData,
        colors: current.filter((c) => c !== hex),
      });
    } else {
      setFormData({
        ...formData,
        colors: [...current, hex],
      });
    }
  };

  return (
    <div className="adm-page">
      <AdminSidebar />

      <main className="adm-main">
        {/* Toast */}
        {toastMessage && (
          <div
            style={{
              position: "fixed",
              top: 24,
              right: 24,
              background: "#10b981",
              color: "#fff",
              padding: "12px 20px",
              borderRadius: "8px",
              fontWeight: "600",
              zIndex: 9999,
              boxShadow: "0 10px 15px -3px rgba(0,0,0,0.2)",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            ✓ {toastMessage}
          </div>
        )}

        {/* Header */}
        <div className="adm-header">
          <div className="adm-header-left">
            <h1 className="adm-title">Products Management</h1>
            <p className="adm-subtitle">
              Manage product listings, inventory levels, category
              classifications and pricing
            </p>
          </div>
          <div className="adm-header-right">
            <div className="adm-user-chip">
              <div className="adm-user-avatar">
                {(currentUser.name || "A").charAt(0).toUpperCase()}
              </div>
              <div className="adm-user-info">
                <span className="adm-user-name">
                  {currentUser.name || "Admin"}
                </span>
                <span className="adm-user-role">Administrator</span>
              </div>
            </div>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="adm-cardGrid">
          <div className="adm-card adm-card--indigo">
            <div className="adm-card-content">
              <span className="adm-cardLabel">Total Catalog</span>
              <span className="adm-cardValue">{totalProducts}</span>
              <span className="adm-cardSubtext">Active listings</span>
            </div>
            <div className="adm-cardIconWrap">
              <IoShirtOutline />
            </div>
          </div>

          <div className="adm-card adm-card--green">
            <div className="adm-card-content">
              <span className="adm-cardLabel">In Stock</span>
              <span className="adm-cardValue">{inStockCount}</span>
              <span className="adm-cardSubtext">Ready to ship</span>
            </div>
            <div className="adm-cardIconWrap">
              <IoCheckmarkCircleOutline />
            </div>
          </div>

          <div className="adm-card adm-card--amber">
            <div className="adm-card-content">
              <span className="adm-cardLabel">Low Stock / Out</span>
              <span className="adm-cardValue">{lowStockCount}</span>
              <span className="adm-cardSubtext">Needs restocking</span>
            </div>
            <div className="adm-cardIconWrap">
              <IoAlertCircleOutline />
            </div>
          </div>

          <div className="adm-card adm-card--purple">
            <div className="adm-card-content">
              <span className="adm-cardLabel">Categories</span>
              <span className="adm-cardValue">{uniqueCategories}</span>
              <span className="adm-cardSubtext">Product departments</span>
            </div>
            <div className="adm-cardIconWrap">
              <IoShirtOutline />
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="adm-toolbar">
          <div className="adm-toolbar-left">
            <div className="adm-searchBox">
              <IoSearchOutline size={18} color="#64748b" />
              <input
                type="text"
                placeholder="Search products by title or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <AdminSearchableSelect
              className="adm-selectFilter"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              placeholder="All Categories"
              options={[
                { value: "all", label: "All Categories" },
                ...CATEGORIES.map((c) => ({
                  value: c,
                  label: c.toUpperCase(),
                })),
              ]}
            />

            <AdminSearchableSelect
              className="adm-selectFilter"
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
              placeholder="All Stock Statuses"
              options={[
                { value: "all", label: "All Stock Statuses" },
                { value: "in stock", label: "In Stock" },
                { value: "low stock", label: "Low Stock" },
                { value: "out of stock", label: "Out of Stock" },
              ]}
            />

            <button
              className="adm-btn-refresh"
              onClick={handleClearFilters}
              title="Clear Filters"
            >
              <IoRefreshOutline size={16} />
              <span>Clear</span>
            </button>
          </div>

          <button className="adm-btn-primary" onClick={handleOpenAdd}>
            <IoAddOutline size={18} />
            <span>Add New Product</span>
          </button>
        </div>

        {/* Products Table */}
        <div className="adm-table-card">
          <div className="adm-table-responsive">
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Price</th>
                  <th>Original Price</th>
                  <th>Discount</th>
                  <th>Rating</th>
                  <th>Stock Status</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan="7">
                      <div className="adm-empty">
                        <div className="adm-empty-icon">🛍️</div>
                        <h3 className="adm-empty-title">No products found</h3>
                        <p>
                          No inventory items match your current filter query.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedProducts.map((prod) => {
                    const stock = prod.stockStatus || "In Stock";
                    const stockClass =
                      stock === "In Stock"
                        ? "adm-badge--instock"
                        : stock === "Low Stock"
                          ? "adm-badge--lowstock"
                          : "adm-badge--outofstock";

                    const thumbnail = prod.images?.[0] || prod.image || "";
                    const subCount =
                      Array.isArray(prod.images) && prod.images.length > 1
                        ? prod.images.length - 1
                        : 0;

                    return (
                      <tr key={prod.id}>
                        <td>
                          <div className="adm-prod-cell">
                            {thumbnail ? (
                              <img
                                src={thumbnail}
                                alt={prod.name}
                                className="adm-prod-thumb"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.style.display = "none";
                                  if (e.target.nextElementSibling) {
                                    e.target.nextElementSibling.style.display =
                                      "flex";
                                  }
                                }}
                              />
                            ) : null}
                            <div
                              className="adm-prod-thumb adm-prod-thumb--placeholder"
                              style={{ display: thumbnail ? "none" : "flex" }}
                            >
                              <IoShirtOutline size={20} color="#94a3b8" />
                            </div>
                            <div>
                              <div className="adm-prod-name">{prod.name}</div>
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "8px",
                                  marginTop: "2px",
                                }}
                              >
                                <span className="adm-prod-cat">
                                  Category: {prod.category || "General"}
                                </span>
                                {subCount > 0 && (
                                  <span
                                    style={{
                                      fontSize: "10.5px",
                                      color: "#0284c7",
                                      background: "#e0f2fe",
                                      padding: "1px 6px",
                                      borderRadius: "4px",
                                      fontWeight: "600",
                                      display: "inline-block",
                                    }}
                                    title={`${subCount} sub photo(s)`}
                                  >
                                    +{subCount} sub photo
                                    {subCount > 1 ? "s" : ""}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td style={{ fontWeight: "800", color: "#0f172a" }}>
                          ${prod.price}
                        </td>
                        <td>
                          {prod.originalPrice ? (
                            <span
                              style={{
                                textDecoration: "line-through",
                                color: "#94a3b8",
                              }}
                            >
                              ${prod.originalPrice}
                            </span>
                          ) : (
                            <span style={{ color: "#94a3b8" }}>—</span>
                          )}
                        </td>
                        <td>
                          {prod.discountPercent ? (
                            <span className="adm-badge adm-badge--cancelled">
                              -{prod.discountPercent}%
                            </span>
                          ) : (
                            <span style={{ color: "#94a3b8" }}>None</span>
                          )}
                        </td>
                        <td>
                          {prod.rating && Number(prod.rating) > 0 ? (
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "6px",
                              }}
                            >
                              <div
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "3px",
                                  background: "#fef3c7",
                                  color: "#b45309",
                                  padding: "2px 7px",
                                  borderRadius: "6px",
                                  fontSize: "12px",
                                  fontWeight: "700",
                                }}
                              >
                                <IoStar size={13} color="#f59e0b" />
                                <span>{Number(prod.rating).toFixed(1)}</span>
                              </div>
                              {prod.reviewCount ? (
                                <span
                                  style={{
                                    color: "#64748b",
                                    fontSize: "12px",
                                    fontWeight: "500",
                                  }}
                                  title={`${prod.reviewCount} customer review(s)`}
                                >
                                  ({prod.reviewCount})
                                </span>
                              ) : null}
                            </div>
                          ) : (
                            <span
                              style={{
                                color: "#94a3b8",
                                fontSize: "12px",
                                fontStyle: "italic",
                              }}
                            >
                              No reviews
                            </span>
                          )}
                        </td>
                        <td>
                          <span className={`adm-badge ${stockClass}`}>
                            {stock}
                          </span>
                        </td>
                        <td style={{ textAlign: "right" }}>
                          <div
                            className="adm-actions-cell"
                            style={{ justifyContent: "flex-end" }}
                          >
                            <button
                              className="adm-btn-action adm-btn-action--edit"
                              title="Edit Product"
                              onClick={() => handleOpenEdit(prod)}
                            >
                              <IoPencilOutline size={15} />
                            </button>
                            <button
                              className="adm-btn-action adm-btn-action--delete"
                              title="Delete Product"
                              onClick={() => {
                                setSelectedProduct(prod);
                                setIsDeleteModalOpen(true);
                              }}
                            >
                              <IoTrashOutline size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <AdminPagination
            currentPage={safeCurrentPage}
            totalItems={filteredProducts.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={(newSize) => {
              setPageSize(newSize);
              setCurrentPage(1);
            }}
            pageSizeOptions={[5, 10, 20, 50]}
          />
        </div>

        {/* ─── ADD PRODUCT MODAL ─── */}
        {isAddModalOpen && (
          <div className="adm-modal-overlay">
            <div className="adm-modal adm-modal--lg">
              <div className="adm-modal-header">
                <h3 className="adm-modal-title">Add New Product</h3>
                <button
                  className="adm-modal-close"
                  onClick={() => setIsAddModalOpen(false)}
                >
                  <IoCloseOutline />
                </button>
              </div>
              <form onSubmit={handleAddSubmit}>
                <div
                  className="adm-modal-body"
                  style={{ overflowY: "auto", maxHeight: "calc(90vh - 140px)" }}
                >
                  {/* ── Product Photos (Main + Sub Photos) ── */}
                  <div className="adm-form-group">
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "baseline",
                        marginBottom: "8px",
                      }}
                    >
                      <label
                        className="adm-form-label"
                        style={{ margin: 0, fontWeight: "600" }}
                      >
                        Product Photos
                      </label>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        gap: "20px",
                        flexWrap: "wrap",
                        alignItems: "flex-start",
                        background: "#f8fafc",
                        padding: "16px",
                        borderRadius: "16px",
                        border: "1px solid #e2e8f0",
                      }}
                    >
                      {/* Main Cover Photo Box */}
                      <div>
                        <div
                          style={{
                            fontSize: "12px",
                            fontWeight: "700",
                            color: "#1e293b",
                            marginBottom: "6px",
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                          }}
                        >
                          <span>Cover Photo</span>
                        </div>

                        <div
                          style={{
                            width: "110px",
                            height: "110px",
                            border: formData.imageUrl
                              ? "1.5px solid #cbd5e1"
                              : "2px dashed #94a3b8",
                            borderRadius: "14px",
                            background: "#fff",
                            position: "relative",
                            overflow: "hidden",
                            flexShrink: 0,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            boxShadow: formData.imageUrl
                              ? "0 2px 6px rgba(0,0,0,0.06)"
                              : "none",
                          }}
                        >
                          {formData.imageUrl ? (
                            <>
                              <img
                                src={formData.imageUrl}
                                alt="Main preview"
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "cover",
                                  display: "block",
                                }}
                                onError={(e) => {
                                  e.target.style.display = "none";
                                }}
                              />
                              {/* Overlay actions */}
                              <div
                                style={{
                                  position: "absolute",
                                  bottom: "6px",
                                  left: "50%",
                                  transform: "translateX(-50%)",
                                  display: "flex",
                                  gap: "6px",
                                }}
                              >
                                <button
                                  type="button"
                                  title="Remove cover photo"
                                  onClick={() =>
                                    setFormData({ ...formData, imageUrl: "" })
                                  }
                                  style={{
                                    width: "28px",
                                    height: "28px",
                                    borderRadius: "50%",
                                    background: "rgba(15, 23, 42, 0.75)",
                                    color: "#fff",
                                    border: "none",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    cursor: "pointer",
                                    backdropFilter: "blur(4px)",
                                  }}
                                >
                                  <IoTrashOutline size={14} />
                                </button>
                                <label
                                  title="Change cover photo"
                                  style={{
                                    width: "28px",
                                    height: "28px",
                                    borderRadius: "50%",
                                    background: "rgba(15, 23, 42, 0.75)",
                                    color: "#fff",
                                    border: "none",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    cursor: "pointer",
                                    backdropFilter: "blur(4px)",
                                  }}
                                >
                                  <IoPencilOutline size={14} />
                                  <input
                                    type="file"
                                    accept="image/*"
                                    style={{ display: "none" }}
                                    onChange={(e) => {
                                      const file = e.target.files[0];
                                      if (file) {
                                        const reader = new FileReader();
                                        reader.onload = (ev) =>
                                          setFormData({
                                            ...formData,
                                            imageUrl: ev.target.result,
                                          });
                                        reader.readAsDataURL(file);
                                      }
                                    }}
                                  />
                                </label>
                              </div>
                            </>
                          ) : (
                            <label
                              style={{
                                width: "100%",
                                height: "100%",
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                justifyContent: "center",
                                cursor: "pointer",
                                padding: "8px",
                                textAlign: "center",
                              }}
                            >
                              <IoAddOutline size={24} color="#64748b" />
                              <span
                                style={{
                                  fontSize: "11px",
                                  color: "#64748b",
                                  fontWeight: "600",
                                  marginTop: "2px",
                                }}
                              >
                                Upload Photo
                              </span>
                              <input
                                type="file"
                                accept="image/*"
                                style={{ display: "none" }}
                                onChange={(e) => {
                                  const file = e.target.files[0];
                                  if (file) {
                                    const reader = new FileReader();
                                    reader.onload = (ev) =>
                                      setFormData({
                                        ...formData,
                                        imageUrl: ev.target.result,
                                      });
                                    reader.readAsDataURL(file);
                                  }
                                }}
                              />
                            </label>
                          )}
                        </div>
                      </div>

                      {/* Sub Photos / Gallery Box */}
                      <div style={{ flex: 1, minWidth: "250px" }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            marginBottom: "6px",
                          }}
                        >
                          <span
                            style={{
                              fontSize: "12px",
                              fontWeight: "700",
                              color: "#1e293b",
                            }}
                          >
                            Other Product Gallary (
                            {formData.subImages?.length || 0})
                          </span>
                        </div>

                        <div
                          style={{
                            display: "flex",
                            gap: "10px",
                            flexWrap: "wrap",
                            alignItems: "center",
                          }}
                        >
                          {(formData.subImages || []).map((subImg, idx) => (
                            <div
                              key={idx}
                              style={{
                                width: "110px",
                                height: "110px",
                                borderRadius: "14px",
                                border: "1.5px solid #cbd5e1",
                                background: "#fff",
                                position: "relative",
                                overflow: "hidden",
                                flexShrink: 0,
                                boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
                              }}
                            >
                              
                              <div
                                style={{
                                  position: "absolute",
                                  top: "5px",
                                  left: "6px",
                                  background: "rgba(15, 23, 42, 0.75)",
                                  color: "#fff",
                                  fontSize: "10px",
                                  fontWeight: "700",
                                  padding: "2px 6px",
                                  borderRadius: "5px",
                                  backdropFilter: "blur(4px)",
                                }}
                              >
                                #{idx + 1}
                              </div>

                              <div
                                style={{
                                  position: "absolute",
                                  bottom: "6px",
                                  left: "50%",
                                  transform: "translateX(-50%)",
                                  display: "flex",
                                  gap: "6px",
                                }}
                              >
                                <button
                                  type="button"
                                  title="Remove sub photo"
                                  onClick={() => handleRemoveSubImage(idx)}
                                  style={{
                                    width: "28px",
                                    height: "28px",
                                    borderRadius: "50%",
                                    background: "rgba(15, 23, 42, 0.75)",
                                    color: "#fff",
                                    border: "none",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    cursor: "pointer",
                                    backdropFilter: "blur(4px)",
                                  }}
                                >
                                  <IoTrashOutline size={14} />
                                </button>
                                <label
                                  title="Change sub photo"
                                  style={{
                                    width: "28px",
                                    height: "28px",
                                    borderRadius: "50%",
                                    background: "rgba(15, 23, 42, 0.75)",
                                    color: "#fff",
                                    border: "none",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    cursor: "pointer",
                                    backdropFilter: "blur(4px)",
                                  }}
                                >
                                  <IoPencilOutline size={14} />
                                  <input
                                    type="file"
                                    accept="image/*"
                                    style={{ display: "none" }}
                                    onChange={(e) => {
                                      const file = e.target.files[0];
                                      if (file)
                                        handleReplaceSubImage(idx, file);
                                    }}
                                  />
                                </label>
                              </div>
                            </div>
                          ))}

                          {/* Upload Sub Photo Box */}
                          <label
                            style={{
                              width: "110px",
                              height: "110px",
                              border: "2px dashed #94a3b8",
                              borderRadius: "14px",
                              background: "#fff",
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              justifyContent: "center",
                              cursor: "pointer",
                              flexShrink: 0,
                              padding: "8px",
                              textAlign: "center",
                              transition: "all 0.15s ease",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.borderColor = "#0f172a";
                              e.currentTarget.style.background = "#f1f5f9";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.borderColor = "#94a3b8";
                              e.currentTarget.style.background = "#fff";
                            }}
                          >
                            <IoAddOutline size={24} color="#64748b" />
                            <span
                              style={{
                                fontSize: "11px",
                                color: "#64748b",
                                fontWeight: "600",
                                marginTop: "2px",
                              }}
                            >
                              Other Photo
                            </span>
                            <input
                              type="file"
                              accept="image/*"
                              multiple
                              style={{ display: "none" }}
                              onChange={(e) =>
                                handleSubImagesUpload(e.target.files)
                              }
                            />
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="adm-form-group">
                    <label className="adm-form-label">
                      Product Name / Title *
                    </label>
                    <input
                      type="text"
                      className="adm-form-input"
                      placeholder="e.g. Vintage Oversized Hoodie"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                    />
                    {formErrors.name && (
                      <span style={{ color: "#ef4444", fontSize: "12px" }}>
                        {formErrors.name}
                      </span>
                    )}
                  </div>

                  <div className="adm-form-row">
                    <div className="adm-form-group">
                      <label className="adm-form-label">Category</label>
                      <AdminSearchableSelect
                        value={formData.category}
                        onChange={(e) =>
                          setFormData({ ...formData, category: e.target.value })
                        }
                        placeholder="Select Category"
                        options={CATEGORIES.map((cat) => ({
                          value: cat,
                          label: cat.toUpperCase(),
                        }))}
                      />
                    </div>

                    <div className="adm-form-group">
                      <label className="adm-form-label">Subcategory</label>
                      <AdminSearchableSelect
                        value={formData.subcategory}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            subcategory: e.target.value,
                          })
                        }
                        placeholder="Select subcategory"
                        searchPlaceholder="Search subcategory..."
                        options={[
                          { value: "", label: "Select subcategory" },
                          ...(formData.subcategory &&
                          !subcategories.some(
                            (item) => item.slug === formData.subcategory
                          )
                            ? [
                                {
                                  value: formData.subcategory,
                                  label: formData.subcategory,
                                },
                              ]
                            : []),
                          ...subcategories.map((sub) => ({
                            value: sub.slug,
                            label: sub.name,
                          })),
                        ]}
                      />
                    </div>

                    <div className="adm-form-group">
                      <label className="adm-form-label">Stock Status</label>
                      <AdminSearchableSelect
                        value={formData.stockStatus}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            stockStatus: e.target.value,
                          })
                        }
                        options={[
                          { value: "In Stock", label: "In Stock" },
                          { value: "Low Stock", label: "Low Stock" },
                          { value: "Out of Stock", label: "Out of Stock" },
                        ]}
                      />
                    </div>
                  </div>

                  <div className="adm-form-row">
                    <div className="adm-form-group">
                      <label className="adm-form-label">Price ($) *</label>
                      <input
                        type="number"
                        className="adm-form-input"
                        placeholder="180"
                        value={formData.price}
                        onChange={(e) => handlePriceChange(e.target.value)}
                      />
                      {formErrors.price && (
                        <span style={{ color: "#ef4444", fontSize: "12px" }}>
                          {formErrors.price}
                        </span>
                      )}
                    </div>

                    <div className="adm-form-group">
                      <label className="adm-form-label">
                        Original Price ($)
                      </label>
                      <input
                        type="number"
                        className="adm-form-input"
                        placeholder="220 (optional)"
                        value={formData.originalPrice}
                        onChange={(e) =>
                          handleOriginalPriceChange(e.target.value)
                        }
                      />
                    </div>
                  </div>

                  <div className="adm-form-row">
                    <div className="adm-form-group">
                      <label className="adm-form-label">Discount (%)</label>
                      <input
                        type="number"
                        className="adm-form-input"
                        placeholder="20"
                        value={formData.discountPercent}
                        onChange={(e) => handleDiscountChange(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="adm-form-group">
                    <label className="adm-form-label">Available Colors</label>
                    <div
                      style={{
                        display: "flex",
                        gap: "10px",
                        flexWrap: "wrap",
                        alignItems: "center",
                      }}
                    >
                      {ALL_COLORS.map((col) => {
                        const isSelected = (formData.colors || []).includes(
                          col.hex,
                        );
                        const isWhite = col.hex.toUpperCase() === "#FFFFFF";
                        return (
                          <button
                            type="button"
                            key={col.hex}
                            title={col.name}
                            style={{
                              width: "32px",
                              height: "32px",
                              borderRadius: "50%",
                              background: col.hex,
                              border: isWhite
                                ? "1.5px solid #cbd5e1"
                                : "1.5px solid rgba(0,0,0,0.08)",
                              cursor: "pointer",
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              transform: isSelected
                                ? "scale(1.08)"
                                : "scale(1)",
                              transition: "all 0.15s ease",
                              padding: 0,
                            }}
                            onClick={() => handleToggleColor(col.hex)}
                          >
                            {isSelected && (
                              <IoCheckmark
                                size={17}
                                color={isWhite ? "#000000" : "#ffffff"}
                              />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="adm-form-group">
                    <label className="adm-form-label">Available Sizes</label>
                    <div
                      style={{
                        display: "flex",
                        gap: "8px",
                        flexWrap: "wrap",
                        alignItems: "center",
                      }}
                    >
                      {ALL_SIZES.map((size) => {
                        const isSelected = (formData.sizes || []).includes(
                          size,
                        );
                        return (
                          <button
                            type="button"
                            key={size}
                            style={{
                              padding: "6px 14px",
                              borderRadius: "20px",
                              border: isSelected
                                ? "1.5px solid #000"
                                : "1px solid #cbd5e1",
                              background: isSelected ? "#000" : "#f8fafc",
                              color: isSelected ? "#fff" : "#334155",
                              fontSize: "12.5px",
                              fontWeight: "600",
                              cursor: "pointer",
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              transition: "all 0.15s ease",
                            }}
                            onClick={() => handleToggleSize(size)}
                          >
                            <span>{size}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="adm-form-group">
                    <label className="adm-form-label">Description</label>
                    <textarea
                      className="adm-form-textarea"
                      placeholder="Product details, material and specifications..."
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="adm-modal-footer">
                  <button
                    type="button"
                    className="adm-btn-secondary"
                    onClick={() => setIsAddModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="adm-btn-primary">
                    Save Product
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ─── EDIT PRODUCT MODAL ─── */}
        {isEditModalOpen && selectedProduct && (
          <div className="adm-modal-overlay">
            <div className="adm-modal adm-modal--lg">
              <div className="adm-modal-header">
                <h3 className="adm-modal-title">
                  Edit Product: {selectedProduct.name}
                </h3>
                <button
                  className="adm-modal-close"
                  onClick={() => setIsEditModalOpen(false)}
                >
                  <IoCloseOutline />
                </button>
              </div>
              <form onSubmit={handleEditSubmit}>
                <div
                  className="adm-modal-body"
                  style={{ overflowY: "auto", maxHeight: "calc(90vh - 140px)" }}
                >
                  {/* ── Product Photos (Main + Sub Photos) ── */}
                  <div className="adm-form-group">
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "baseline",
                        marginBottom: "8px",
                      }}
                    >
                      <label
                        className="adm-form-label"
                        style={{ margin: 0, fontWeight: "600" }}
                      >
                        Product Photos
                      </label>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        gap: "20px",
                        flexWrap: "wrap",
                        alignItems: "flex-start",
                        background: "#f8fafc",
                        padding: "16px",
                        borderRadius: "16px",
                        border: "1px solid #e2e8f0",
                      }}
                    >
                      {/* Main Cover Photo Box */}
                      <div>
                        <div
                          style={{
                            fontSize: "12px",
                            fontWeight: "700",
                            color: "#1e293b",
                            marginBottom: "6px",
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                          }}
                        >
                          <span>Cover Photo</span>
                        </div>

                        <div
                          style={{
                            width: "110px",
                            height: "110px",
                            border: formData.imageUrl
                              ? "1.5px solid #cbd5e1"
                              : "2px dashed #94a3b8",
                            borderRadius: "14px",
                            background: "#fff",
                            position: "relative",
                            overflow: "hidden",
                            flexShrink: 0,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            boxShadow: formData.imageUrl
                              ? "0 2px 6px rgba(0,0,0,0.06)"
                              : "none",
                          }}
                        >
                          {formData.imageUrl ? (
                            <>
                              <img
                                src={formData.imageUrl}
                                alt="Main preview"
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "cover",
                                  display: "block",
                                }}
                                onError={(e) => {
                                  e.target.style.display = "none";
                                }}
                              />
                              {/* Overlay actions */}
                              <div
                                style={{
                                  position: "absolute",
                                  bottom: "6px",
                                  left: "50%",
                                  transform: "translateX(-50%)",
                                  display: "flex",
                                  gap: "6px",
                                }}
                              >
                                <button
                                  type="button"
                                  title="Remove cover photo"
                                  onClick={() =>
                                    setFormData({ ...formData, imageUrl: "" })
                                  }
                                  style={{
                                    width: "28px",
                                    height: "28px",
                                    borderRadius: "50%",
                                    background: "rgba(15, 23, 42, 0.75)",
                                    color: "#fff",
                                    border: "none",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    cursor: "pointer",
                                    backdropFilter: "blur(4px)",
                                  }}
                                >
                                  <IoTrashOutline size={14} />
                                </button>
                                <label
                                  title="Change cover photo"
                                  style={{
                                    width: "28px",
                                    height: "28px",
                                    borderRadius: "50%",
                                    background: "rgba(15, 23, 42, 0.75)",
                                    color: "#fff",
                                    border: "none",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    cursor: "pointer",
                                    backdropFilter: "blur(4px)",
                                  }}
                                >
                                  <IoPencilOutline size={14} />
                                  <input
                                    type="file"
                                    accept="image/*"
                                    style={{ display: "none" }}
                                    onChange={(e) => {
                                      const file = e.target.files[0];
                                      if (file) {
                                        const reader = new FileReader();
                                        reader.onload = (ev) =>
                                          setFormData({
                                            ...formData,
                                            imageUrl: ev.target.result,
                                          });
                                        reader.readAsDataURL(file);
                                      }
                                    }}
                                  />
                                </label>
                              </div>
                            </>
                          ) : (
                            <label
                              style={{
                                width: "100%",
                                height: "100%",
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                justifyContent: "center",
                                cursor: "pointer",
                                padding: "8px",
                                textAlign: "center",
                              }}
                            >
                              <IoAddOutline size={24} color="#64748b" />
                              <span
                                style={{
                                  fontSize: "11px",
                                  color: "#64748b",
                                  fontWeight: "600",
                                  marginTop: "2px",
                                }}
                              >
                                Upload Photo
                              </span>
                              <input
                                type="file"
                                accept="image/*"
                                style={{ display: "none" }}
                                onChange={(e) => {
                                  const file = e.target.files[0];
                                  if (file) {
                                    const reader = new FileReader();
                                    reader.onload = (ev) =>
                                      setFormData({
                                        ...formData,
                                        imageUrl: ev.target.result,
                                      });
                                    reader.readAsDataURL(file);
                                  }
                                }}
                              />
                            </label>
                          )}
                        </div>
                      </div>

                      {/* Sub Photos / Gallery Box */}
                      <div style={{ flex: 1, minWidth: "250px" }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            marginBottom: "6px",
                          }}
                        >
                          <span
                            style={{
                              fontSize: "12px",
                              fontWeight: "700",
                              color: "#1e293b",
                            }}
                          >
                            Other Product Gallary (
                            {formData.subImages?.length || 0})
                          </span>
                        </div>

                        <div
                          style={{
                            display: "flex",
                            gap: "10px",
                            flexWrap: "wrap",
                            alignItems: "center",
                          }}
                        >
                          {(formData.subImages || []).map((subImg, idx) => (
                            <div
                              key={idx}
                              style={{
                                width: "110px",
                                height: "110px",
                                borderRadius: "14px",
                                border: "1.5px solid #cbd5e1",
                                background: "#fff",
                                position: "relative",
                                overflow: "hidden",
                                flexShrink: 0,
                                boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
                              }}
                            >
                              
                              <div
                                style={{
                                  position: "absolute",
                                  top: "5px",
                                  left: "6px",
                                  background: "rgba(15, 23, 42, 0.75)",
                                  color: "#fff",
                                  fontSize: "10px",
                                  fontWeight: "700",
                                  padding: "2px 6px",
                                  borderRadius: "5px",
                                  backdropFilter: "blur(4px)",
                                }}
                              >
                                #{idx + 1}
                              </div>

                              <div
                                style={{
                                  position: "absolute",
                                  bottom: "6px",
                                  left: "50%",
                                  transform: "translateX(-50%)",
                                  display: "flex",
                                  gap: "6px",
                                }}
                              >
                                <button
                                  type="button"
                                  title="Remove sub photo"
                                  onClick={() => handleRemoveSubImage(idx)}
                                  style={{
                                    width: "28px",
                                    height: "28px",
                                    borderRadius: "50%",
                                    background: "rgba(15, 23, 42, 0.75)",
                                    color: "#fff",
                                    border: "none",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    cursor: "pointer",
                                    backdropFilter: "blur(4px)",
                                  }}
                                >
                                  <IoTrashOutline size={14} />
                                </button>
                                <label
                                  title="Change sub photo"
                                  style={{
                                    width: "28px",
                                    height: "28px",
                                    borderRadius: "50%",
                                    background: "rgba(15, 23, 42, 0.75)",
                                    color: "#fff",
                                    border: "none",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    cursor: "pointer",
                                    backdropFilter: "blur(4px)",
                                  }}
                                >
                                  <IoPencilOutline size={14} />
                                  <input
                                    type="file"
                                    accept="image/*"
                                    style={{ display: "none" }}
                                    onChange={(e) => {
                                      const file = e.target.files[0];
                                      if (file)
                                        handleReplaceSubImage(idx, file);
                                    }}
                                  />
                                </label>
                              </div>
                            </div>
                          ))}

                          {/* Upload Sub Photo Box */}
                          <label
                            style={{
                              width: "110px",
                              height: "110px",
                              border: "2px dashed #94a3b8",
                              borderRadius: "14px",
                              background: "#fff",
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              justifyContent: "center",
                              cursor: "pointer",
                              flexShrink: 0,
                              padding: "8px",
                              textAlign: "center",
                              transition: "all 0.15s ease",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.borderColor = "#0f172a";
                              e.currentTarget.style.background = "#f1f5f9";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.borderColor = "#94a3b8";
                              e.currentTarget.style.background = "#fff";
                            }}
                          >
                            <IoAddOutline size={24} color="#64748b" />
                            <span
                              style={{
                                fontSize: "11px",
                                color: "#64748b",
                                fontWeight: "600",
                                marginTop: "2px",
                              }}
                            >
                              Other Photo
                            </span>
                            <input
                              type="file"
                              accept="image/*"
                              multiple
                              style={{ display: "none" }}
                              onChange={(e) =>
                                handleSubImagesUpload(e.target.files)
                              }
                            />
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="adm-form-group">
                    <label className="adm-form-label">
                      Product Name / Title *
                    </label>
                    <input
                      type="text"
                      className="adm-form-input"
                      placeholder="e.g. Vintage Oversized Hoodie"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                    />
                    {formErrors.name && (
                      <span style={{ color: "#ef4444", fontSize: "12px" }}>
                        {formErrors.name}
                      </span>
                    )}
                  </div>

                  <div className="adm-form-row">
                    <div className="adm-form-group">
                      <label className="adm-form-label">Category</label>
                      <AdminSearchableSelect
                        value={formData.category}
                        onChange={(e) =>
                          setFormData({ ...formData, category: e.target.value })
                        }
                        placeholder="Select Category"
                        options={CATEGORIES.map((cat) => ({
                          value: cat,
                          label: cat.toUpperCase(),
                        }))}
                      />
                    </div>

                    <div className="adm-form-group">
                      <label className="adm-form-label">Subcategory</label>
                      <AdminSearchableSelect
                        value={formData.subcategory}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            subcategory: e.target.value,
                          })
                        }
                        placeholder="Select subcategory"
                        searchPlaceholder="Search subcategory..."
                        options={[
                          { value: "", label: "Select subcategory" },
                          ...(formData.subcategory &&
                          !subcategories.some(
                            (item) => item.slug === formData.subcategory
                          )
                            ? [
                                {
                                  value: formData.subcategory,
                                  label: formData.subcategory,
                                },
                              ]
                            : []),
                          ...subcategories.map((sub) => ({
                            value: sub.slug,
                            label: sub.name,
                          })),
                        ]}
                      />
                    </div>

                    <div className="adm-form-group">
                      <label className="adm-form-label">Stock Status</label>
                      <AdminSearchableSelect
                        value={formData.stockStatus}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            stockStatus: e.target.value,
                          })
                        }
                        options={[
                          { value: "In Stock", label: "In Stock" },
                          { value: "Low Stock", label: "Low Stock" },
                          { value: "Out of Stock", label: "Out of Stock" },
                        ]}
                      />
                    </div>
                  </div>

                  <div className="adm-form-row">
                    <div className="adm-form-group">
                      <label className="adm-form-label">Price ($) *</label>
                      <input
                        type="number"
                        className="adm-form-input"
                        placeholder="180"
                        value={formData.price}
                        onChange={(e) => handlePriceChange(e.target.value)}
                      />
                    </div>

                    <div className="adm-form-group">
                      <label className="adm-form-label">
                        Original Price ($)
                      </label>
                      <input
                        type="number"
                        className="adm-form-input"
                        placeholder="220 (optional)"
                        value={formData.originalPrice}
                        onChange={(e) =>
                          handleOriginalPriceChange(e.target.value)
                        }
                      />
                    </div>
                  </div>

                  <div className="adm-form-row">
                    <div className="adm-form-group">
                      <label className="adm-form-label">Discount (%)</label>
                      <input
                        type="number"
                        className="adm-form-input"
                        placeholder="20"
                        value={formData.discountPercent}
                        onChange={(e) => handleDiscountChange(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Available Colors */}
                  <div className="adm-form-group">
                    <label className="adm-form-label">Available Colors</label>
                    <div
                      style={{
                        display: "flex",
                        gap: "10px",
                        flexWrap: "wrap",
                        alignItems: "center",
                      }}
                    >
                      {ALL_COLORS.map((col) => {
                        const isSelected = (formData.colors || []).includes(
                          col.hex,
                        );
                        const isWhite = col.hex.toUpperCase() === "#FFFFFF";
                        return (
                          <button
                            type="button"
                            key={col.hex}
                            title={col.name}
                            style={{
                              width: "32px",
                              height: "32px",
                              borderRadius: "50%",
                              background: col.hex,
                              border: isWhite
                                ? "1.5px solid #cbd5e1"
                                : "1.5px solid rgba(0,0,0,0.08)",
                              cursor: "pointer",
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              transform: isSelected
                                ? "scale(1.08)"
                                : "scale(1)",
                              transition: "all 0.15s ease",
                              padding: 0,
                            }}
                            onClick={() => handleToggleColor(col.hex)}
                          >
                            {isSelected && (
                              <IoCheckmark
                                size={17}
                                color={isWhite ? "#000000" : "#ffffff"}
                              />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Available Sizes */}
                  <div className="adm-form-group">
                    <label className="adm-form-label">Available Sizes</label>
                    <div
                      style={{
                        display: "flex",
                        gap: "8px",
                        flexWrap: "wrap",
                        alignItems: "center",
                      }}
                    >
                      {ALL_SIZES.map((size) => {
                        const isSelected = (formData.sizes || []).includes(
                          size,
                        );
                        return (
                          <button
                            type="button"
                            key={size}
                            style={{
                              padding: "6px 14px",
                              borderRadius: "20px",
                              border: isSelected
                                ? "1.5px solid #000"
                                : "1px solid #cbd5e1",
                              background: isSelected ? "#000" : "#f8fafc",
                              color: isSelected ? "#fff" : "#334155",
                              fontSize: "12.5px",
                              fontWeight: "600",
                              cursor: "pointer",
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              transition: "all 0.15s ease",
                            }}
                            onClick={() => handleToggleSize(size)}
                          >
                            <span>{size}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="adm-form-group">
                    <label className="adm-form-label">Description</label>
                    <textarea
                      className="adm-form-textarea"
                      placeholder="Product details, material and specifications..."
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                    />
                  </div>

                </div>

                <div className="adm-modal-footer">
                  <button
                    type="button"
                    className="adm-btn-secondary"
                    onClick={() => setIsEditModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="adm-btn-primary">
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ─── DELETE PRODUCT CONFIRMATION ─── */}
        {isDeleteModalOpen && selectedProduct && (
          <div className="adm-modal-overlay">
            <div className="adm-modal" style={{ maxWidth: 420 }}>
              <div className="adm-modal-header">
                <h3 className="adm-modal-title">Delete Product</h3>
                <button
                  className="adm-modal-close"
                  onClick={() => setIsDeleteModalOpen(false)}
                >
                  <IoCloseOutline />
                </button>
              </div>
              <div className="adm-modal-body" style={{ textAlign: "center" }}>
                <IoAlertCircleOutline size={48} color="#ef4444" />
                <h4 style={{ margin: "12px 0 6px 0", fontSize: "16px" }}>
                  Delete "{selectedProduct.name}"?
                </h4>
                <p style={{ color: "#64748b", fontSize: "13px", margin: 0 }}>
                  This product will be removed from the catalog.
                </p>
              </div>
              <div className="adm-modal-footer">
                <button
                  type="button"
                  className="adm-btn-secondary"
                  onClick={() => setIsDeleteModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="adm-btn-danger"
                  onClick={handleDeleteConfirm}
                >
                  Yes, Delete Product
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
