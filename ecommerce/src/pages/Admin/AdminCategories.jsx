import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  IoSearchOutline,
  IoAddOutline,
  IoPencilOutline,
  IoTrashOutline,
  IoLayersOutline,
  IoCheckmarkCircleOutline,
  IoAlertCircleOutline,
  IoCloseOutline,
  IoRefreshOutline,
  IoCheckmarkOutline,
} from "react-icons/io5";
import AdminSidebar from "./AdminSidebar";
import AdminPagination from "./AdminPagination";
import AdminSearchableSelect from "./AdminSearchableSelect";
import { isSessionExpired, clearSession } from "../../services/authService";
import {
  createDbCategory,
  deleteDbCategory,
  fetchDbCategories,
  updateDbCategory,
} from "../../services/categoryService";
import "./AdminPages.css";

export default function AdminCategories() {
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

  const [categoriesList, setCategoriesList] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [toastMessage, setToastMessage] = useState("");

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    status: "Active",
  });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token || isSessionExpired()) {
      clearSession("expired");
      navigate("/login?expired=1");
    }
  }, [navigate]);

  useEffect(() => {
    let active = true;
    fetchDbCategories()
      .then((categories) => {
        if (active) setCategoriesList(categories);
      })
      .catch(() => {
        if (active) showToast("Failed to load categories from the database");
      });
    return () => {
      active = false;
    };
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

  const getProductCountForCategory = (category) =>
    Number(category.product_count) || 0;

  const handleClearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    showToast("Filters cleared");
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = "Category name is required";
    if (!formData.slug.trim()) errors.slug = "Category slug is required";
    return errors;
  };

  const handleOpenAdd = () => {
    setFormData({
      name: "",
      slug: "",
      description: "",
      status: "Active",
    });
    setFormErrors({});
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (category) => {
    setSelectedCategory(category);
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || "",
      status: category.status || "Active",
    });
    setFormErrors({});
    setIsEditModalOpen(true);
  };

  const handleOpenDelete = (category) => {
    setSelectedCategory(category);
    setIsDeleteModalOpen(true);
  };

  const reloadCategories = async () => {
    const categories = await fetchDbCategories();
    setCategoriesList(categories);
    window.dispatchEvent(new Event("categories_updated"));
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    const errs = validateForm();
    if (Object.keys(errs).length > 0) {
      setFormErrors(errs);
      return;
    }

    const newCategory = {
      name: formData.name.trim(),
      slug: formData.slug.trim().toLowerCase().replace(/\s+/g, "-"),
      description: formData.description.trim(),
      status: formData.status,
    };

    try {
      await createDbCategory(newCategory);
      await reloadCategories();
      setIsAddModalOpen(false);
      showToast(`Category "${newCategory.name}" created successfully!`);
    } catch (error) {
      showToast(error.response?.data?.message || "Failed to create category");
    }
  };

  const handleUpdateCategory = async (e) => {
    e.preventDefault();
    const errs = validateForm();
    if (Object.keys(errs).length > 0) {
      setFormErrors(errs);
      return;
    }

    try {
      await updateDbCategory(selectedCategory.id, {
        name: formData.name.trim(),
        slug: formData.slug.trim().toLowerCase().replace(/\s+/g, "-"),
        description: formData.description.trim(),
        status: formData.status,
      });
      await reloadCategories();
      setIsEditModalOpen(false);
      showToast(`Category "${formData.name}" updated successfully!`);
    } catch (error) {
      showToast(error.response?.data?.message || "Failed to update category");
    }
  };

  const handleDeleteCategory = async () => {
    if (!selectedCategory) return;
    try {
      await deleteDbCategory(selectedCategory.id);
      await reloadCategories();
      setIsDeleteModalOpen(false);
      showToast(`Category "${selectedCategory.name}" deleted successfully!`);
    } catch (error) {
      showToast(error.response?.data?.message || "Failed to delete category");
    }
  };

  const handleToggleStatus = async (category) => {
    const newStatus = category.status === "Active" ? "Inactive" : "Active";
    try {
      await updateDbCategory(category.id, { status: newStatus });
      await reloadCategories();
      showToast(`Category "${category.name}" is now ${newStatus}`);
    } catch (error) {
      showToast(error.response?.data?.message || "Failed to update category");
    }
  };

  // Filtered categories
  const filteredCategories = categoriesList.filter((cat) => {
    const matchesSearch =
      cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cat.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (cat.description || "").toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      cat.status.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  // Reset pagination on filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredCategories.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedCategories = filteredCategories.slice(
    (safeCurrentPage - 1) * pageSize,
    safeCurrentPage * pageSize
  );

  const totalCategories = categoriesList.length;
  const activeCount = categoriesList.filter(
    (c) => c.status === "Active",
  ).length;
  const totalMappedProducts = categoriesList.reduce(
                    (acc, cat) => acc + getProductCountForCategory(cat),
    0,
  );

  return (
    <div className="adm-page">
      <AdminSidebar />

      <main className="adm-main">
        {/* Floating Toast */}
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
            <IoCheckmarkOutline size={18} />
            {toastMessage}
          </div>
        )}

        {/* Header */}
        <div className="adm-header">
          <div className="adm-header-left">
            <h1 className="adm-title">Categories Management</h1>
            <p className="adm-subtitle">
              Organize, classify, and configure storefront product collections
              and dress styles
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
              <span className="adm-cardLabel">Total Categories</span>
              <span className="adm-cardValue">{totalCategories}</span>
              <span className="adm-cardSubtext">Configured departments</span>
            </div>
            <div className="adm-cardIconWrap">
              <IoLayersOutline />
            </div>
          </div>

          <div className="adm-card adm-card--green">
            <div className="adm-card-content">
              <span className="adm-cardLabel">Active Categories</span>
              <span className="adm-cardValue">{activeCount}</span>
              <span className="adm-cardSubtext">Live on storefront</span>
            </div>
            <div className="adm-cardIconWrap">
              <IoCheckmarkCircleOutline />
            </div>
          </div>

          <div className="adm-card adm-card--purple">
            <div className="adm-card-content">
              <span className="adm-cardLabel">Mapped Products</span>
              <span className="adm-cardValue">{totalMappedProducts}</span>
              <span className="adm-cardSubtext">Catalog items classified</span>
            </div>
            <div className="adm-cardIconWrap">
              <IoLayersOutline />
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
                placeholder="Search categories by name, slug or keywords..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <AdminSearchableSelect
              className="adm-selectFilter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              placeholder="All Statuses"
              options={[
                { value: "all", label: "All Statuses" },
                { value: "active", label: "Active" },
                { value: "inactive", label: "Inactive" },
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
            <span>Add New Category</span>
          </button>
        </div>

        {/* Categories Table */}
        <div className="adm-table-card">
          <div className="adm-table-responsive">
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Slug</th>
                  <th>Description</th>
                  <th>Products Count</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCategories.length > 0 ? (
                  paginatedCategories.map((cat) => {
                    const pCount = getProductCountForCategory(cat);
                    return (
                      <tr key={cat.id}>
                        <td>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 12,
                            }}
                          >
                            <div
                              style={{
                                width: 38,
                                height: 38,
                                borderRadius: 8,
                                background: "#f1f5f9",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "#475569",
                                fontWeight: 700,
                                fontSize: 14,
                              }}
                            >
                              <IoLayersOutline size={20} />
                            </div>
                            <div>
                              <div
                                style={{
                                  fontWeight: 700,
                                  color: "var(--adm-text-primary)",
                                }}
                              >
                                {cat.name}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <code
                            style={{
                              background: "#f1f5f9",
                              padding: "3px 8px",
                              borderRadius: 6,
                              fontSize: 12,
                              color: "#475569",
                            }}
                          >
                            /{cat.slug}
                          </code>
                        </td>
                        <td style={{ maxWidth: 260 }}>
                          <span
                            style={{
                              fontSize: 13,
                              color: "var(--adm-text-secondary)",
                              display: "-webkit-box",
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: "vertical",
                              overflow: "hidden",
                            }}
                          >
                            {cat.description || "—"}
                          </span>
                        </td>
                        <td>
                          <span
                            style={{
                              fontWeight: 700,
                              color:
                                pCount > 0
                                  ? "var(--adm-text-primary)"
                                  : "var(--adm-text-muted)",
                            }}
                          >
                            {pCount} {pCount === 1 ? "item" : "items"}
                          </span>
                        </td>
                        <td>
                          <button
                            onClick={() => handleToggleStatus(cat)}
                            title="Click to toggle status"
                            style={{
                              border: "none",
                              cursor: "pointer",
                              padding: "4px 10px",
                              borderRadius: 12,
                              fontSize: 12,
                              fontWeight: 700,
                              background:
                                cat.status === "Active" ? "#ecfdf5" : "#f1f5f9",
                              color:
                                cat.status === "Active" ? "#10b981" : "#64748b",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 6,
                            }}
                          >
                            <span
                              style={{
                                width: 6,
                                height: 6,
                                borderRadius: "50%",
                                background:
                                  cat.status === "Active"
                                    ? "#10b981"
                                    : "#94a3b8",
                              }}
                            />
                            {cat.status}
                          </button>
                        </td>
                        <td
                          style={{
                            fontSize: 13,
                            color: "var(--adm-text-secondary)",
                          }}
                        >
                          {cat.createdAt || "—"}
                        </td>
                        <td>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "flex-end",
                              gap: 8,
                            }}
                          >
                            <button
                              className="adm-action-btn adm-action-btn--edit"
                              onClick={() => handleOpenEdit(cat)}
                              title="Edit Category"
                            >
                              <IoPencilOutline size={16} />
                            </button>
                            <button
                              className="adm-action-btn adm-action-btn--delete"
                              onClick={() => handleOpenDelete(cat)}
                              title="Delete Category"
                            >
                              <IoTrashOutline size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan="7"
                      style={{ textAlign: "center", padding: "48px 20px" }}
                    >
                      <div className="adm-empty-state">
                        <IoAlertCircleOutline className="adm-empty-icon" />
                        <div className="adm-empty-title">
                          No categories found
                        </div>
                        <p
                          style={{
                            color: "var(--adm-text-secondary)",
                            fontSize: 14,
                          }}
                        >
                          Try adjusting your search criteria or add a new
                          category.
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <AdminPagination
            currentPage={safeCurrentPage}
            totalItems={filteredCategories.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={(newSize) => {
              setPageSize(newSize);
              setCurrentPage(1);
            }}
            pageSizeOptions={[5, 10, 20, 50]}
          />
        </div>

        {/* ── MODAL: Add Category ── */}
        {isAddModalOpen && (
          <div className="adm-modal-overlay">
            <div className="adm-modal">
              <div className="adm-modal-header">
                <h3 className="adm-modal-title">Add New Category</h3>
                <button
                  className="adm-modal-close"
                  onClick={() => setIsAddModalOpen(false)}
                >
                  <IoCloseOutline />
                </button>
              </div>
              <form onSubmit={handleAddCategory}>
                <div className="adm-modal-body">
                  <div className="adm-form-group">
                    <label className="adm-form-label">Category Name *</label>
                    <input
                      type="text"
                      className="adm-form-input"
                      placeholder="e.g. Athleisure, Winterwear"
                      value={formData.name}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormData({
                          ...formData,
                          name: val,
                          slug: val.toLowerCase().replace(/\s+/g, "-"),
                        });
                        if (formErrors.name)
                          setFormErrors({ ...formErrors, name: "" });
                      }}
                    />
                    {formErrors.name && (
                      <span style={{ color: "#ef4444", fontSize: 12 }}>
                        {formErrors.name}
                      </span>
                    )}
                  </div>

                  <div className="adm-form-group">
                    <label className="adm-form-label">Slug (URL path) *</label>
                    <input
                      type="text"
                      className="adm-form-input"
                      placeholder="e.g. athleisure"
                      value={formData.slug}
                      onChange={(e) => {
                        setFormData({ ...formData, slug: e.target.value });
                        if (formErrors.slug)
                          setFormErrors({ ...formErrors, slug: "" });
                      }}
                    />
                    {formErrors.slug && (
                      <span style={{ color: "#ef4444", fontSize: 12 }}>
                        {formErrors.slug}
                      </span>
                    )}
                  </div>

                  <div className="adm-form-group">
                    <label className="adm-form-label">Description</label>
                    <textarea
                      className="adm-form-textarea"
                      rows={3}
                      placeholder="Brief description of the collection..."
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="adm-form-group">
                    <label className="adm-form-label">Status</label>
                    <AdminSearchableSelect
                      value={formData.status}
                      onChange={(e) =>
                        setFormData({ ...formData, status: e.target.value })
                      }
                      options={[
                        { value: "Active", label: "Active" },
                        { value: "Inactive", label: "Inactive" },
                      ]}
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
                    Create Category
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ── MODAL: Edit Category ── */}
        {isEditModalOpen && (
          <div className="adm-modal-overlay">
            <div className="adm-modal">
              <div className="adm-modal-header">
                <h3 className="adm-modal-title">Edit Category</h3>
                <button
                  className="adm-modal-close"
                  onClick={() => setIsEditModalOpen(false)}
                >
                  <IoCloseOutline />
                </button>
              </div>
              <form onSubmit={handleUpdateCategory}>
                <div className="adm-modal-body">
                  <div className="adm-form-group">
                    <label className="adm-form-label">Category Name *</label>
                    <input
                      type="text"
                      className="adm-form-input"
                      value={formData.name}
                      onChange={(e) => {
                        setFormData({ ...formData, name: e.target.value });
                        if (formErrors.name)
                          setFormErrors({ ...formErrors, name: "" });
                      }}
                    />
                    {formErrors.name && (
                      <span style={{ color: "#ef4444", fontSize: 12 }}>
                        {formErrors.name}
                      </span>
                    )}
                  </div>

                  <div className="adm-form-group">
                    <label className="adm-form-label">Slug (URL path) *</label>
                    <input
                      type="text"
                      className="adm-form-input"
                      value={formData.slug}
                      onChange={(e) => {
                        setFormData({ ...formData, slug: e.target.value });
                        if (formErrors.slug)
                          setFormErrors({ ...formErrors, slug: "" });
                      }}
                    />
                    {formErrors.slug && (
                      <span style={{ color: "#ef4444", fontSize: 12 }}>
                        {formErrors.slug}
                      </span>
                    )}
                  </div>

                  <div className="adm-form-group">
                    <label className="adm-form-label">Description</label>
                    <textarea
                      className="adm-form-textarea"
                      rows={3}
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="adm-form-group">
                    <label className="adm-form-label">Status</label>
                    <AdminSearchableSelect
                      value={formData.status}
                      onChange={(e) =>
                        setFormData({ ...formData, status: e.target.value })
                      }
                      options={[
                        { value: "Active", label: "Active" },
                        { value: "Inactive", label: "Inactive" },
                      ]}
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

        {/* ── MODAL: Delete Category ── */}
        {isDeleteModalOpen && selectedCategory && (
          <div className="adm-modal-overlay">
            <div className="adm-modal">
              <div className="adm-modal-header">
                <h3 className="adm-modal-title" style={{ color: "#ef4444" }}>
                  Delete Category
                </h3>
                <button
                  className="adm-modal-close"
                  onClick={() => setIsDeleteModalOpen(false)}
                >
                  <IoCloseOutline />
                </button>
              </div>
              <div className="adm-modal-body">
                <p
                  style={{
                    color: "var(--adm-text-primary)",
                    fontSize: 15,
                    marginBottom: 12,
                  }}
                >
                  Are you sure you want to delete category{" "}
                  <strong>"{selectedCategory.name}"</strong>?
                </p>
                <p style={{ color: "var(--adm-text-secondary)", fontSize: 13 }}>
                  This will remove the category classification. Associated
                  products will remain in the catalog.
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
                  onClick={handleDeleteCategory}
                  style={{
                    background: "#ef4444",
                    color: "#fff",
                    border: "none",
                    padding: "10px 18px",
                    borderRadius: 8,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Yes, Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
