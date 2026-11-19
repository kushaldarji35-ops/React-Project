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
  IoPricetagsOutline,
} from "react-icons/io5";
import AdminSidebar from "./AdminSidebar";
import AdminPagination from "./AdminPagination";
import AdminSearchableSelect from "./AdminSearchableSelect";
import { isSessionExpired, clearSession } from "../../services/authService";
import {
  fetchDbSubcategories,
  fetchDbCategories,
  createDbSubcategory,
  updateDbSubcategory,
  deleteDbSubcategory,
  slugifyCategory,
} from "../../services/categoryService";
import "./AdminPages.css";

export default function AdminSubcategories() {
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

  const [subcategoriesList, setSubcategoriesList] = useState([]);
  const [categoriesList, setCategoriesList] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [toastMessage, setToastMessage] = useState("");

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    category_id: "",
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
    fetchDbSubcategories()
      .then((items) => {
        if (active) setSubcategoriesList(items);
      })
      .catch(() => {
        if (active) showToast("Failed to load subcategories from the database");
      });
    fetchDbCategories()
      .then((cats) => {
        if (active) setCategoriesList(cats);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setCategoryFilter("all");
    showToast("Filters cleared");
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = "Subcategory name is required";
    if (!formData.slug.trim()) errors.slug = "Subcategory slug is required";
    return errors;
  };

  const handleOpenAdd = () => {
    setFormData({ name: "", slug: "", category_id: "", status: "Active" });
    setFormErrors({});
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (subcategory) => {
    setSelectedSubcategory(subcategory);
    setFormData({
      name: subcategory.name,
      slug: subcategory.slug,
      category_id: subcategory.category_id ? String(subcategory.category_id) : "",
      status: subcategory.status || "Active",
    });
    setFormErrors({});
    setIsEditModalOpen(true);
  };

  const handleOpenDelete = (subcategory) => {
    setSelectedSubcategory(subcategory);
    setIsDeleteModalOpen(true);
  };

  const reloadSubcategories = async () => {
    const items = await fetchDbSubcategories();
    setSubcategoriesList(items);
  };

  const handleAddSubcategory = async (e) => {
    e.preventDefault();
    const errs = validateForm();
    if (Object.keys(errs).length > 0) {
      setFormErrors(errs);
      return;
    }

    const newSubcategory = {
      name: formData.name.trim(),
      slug: formData.slug.trim().toLowerCase().replace(/\s+/g, "-"),
      category_id: formData.category_id ? Number(formData.category_id) : null,
      status: formData.status,
    };

    try {
      await createDbSubcategory(newSubcategory);
      await reloadSubcategories();
      setIsAddModalOpen(false);
      showToast(`Subcategory "${newSubcategory.name}" created successfully!`);
    } catch (error) {
      showToast(
        error.response?.data?.message || "Failed to create subcategory"
      );
    }
  };

  const handleUpdateSubcategory = async (e) => {
    e.preventDefault();
    const errs = validateForm();
    if (Object.keys(errs).length > 0) {
      setFormErrors(errs);
      return;
    }

    try {
      await updateDbSubcategory(selectedSubcategory.id, {
        name: formData.name.trim(),
        slug: formData.slug.trim().toLowerCase().replace(/\s+/g, "-"),
        category_id: formData.category_id ? Number(formData.category_id) : null,
        status: formData.status,
      });
      await reloadSubcategories();
      setIsEditModalOpen(false);
      showToast(`Subcategory "${formData.name}" updated successfully!`);
    } catch (error) {
      showToast(
        error.response?.data?.message || "Failed to update subcategory"
      );
    }
  };

  const handleDeleteSubcategory = async () => {
    if (!selectedSubcategory) return;
    try {
      await deleteDbSubcategory(selectedSubcategory.id);
      await reloadSubcategories();
      setIsDeleteModalOpen(false);
      showToast(
        `Subcategory "${selectedSubcategory.name}" deleted successfully!`
      );
    } catch (error) {
      showToast(
        error.response?.data?.message || "Failed to delete subcategory"
      );
    }
  };

  const handleToggleStatus = async (subcategory) => {
    const newStatus = subcategory.status === "Active" ? "Inactive" : "Active";
    try {
      await updateDbSubcategory(subcategory.id, { status: newStatus });
      await reloadSubcategories();
      showToast(`Subcategory "${subcategory.name}" is now ${newStatus}`);
    } catch (error) {
      showToast(
        error.response?.data?.message || "Failed to update subcategory"
      );
    }
  };

  // Filtered subcategories
  const filteredSubcategories = subcategoriesList.filter((sub) => {
    const matchesSearch =
      sub.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.slug.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      sub.status.toLowerCase() === statusFilter.toLowerCase();

    const matchesCategory =
      categoryFilter === "all" ||
      String(sub.category_id || "") === String(categoryFilter);

    return matchesSearch && matchesStatus && matchesCategory;
  });

  // Reset pagination on filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, categoryFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredSubcategories.length / pageSize)
  );
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedSubcategories = filteredSubcategories.slice(
    (safeCurrentPage - 1) * pageSize,
    safeCurrentPage * pageSize
  );

  const totalSubcategories = subcategoriesList.length;
  const activeCount = subcategoriesList.filter(
    (s) => s.status === "Active"
  ).length;
  const inactiveCount = totalSubcategories - activeCount;

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
            <h1 className="adm-title">Subcategories Management</h1>
            <p className="adm-subtitle">
              Organize and manage product subcategories for storefront filters
              and product classification
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
              <span className="adm-cardLabel">Total Subcategories</span>
              <span className="adm-cardValue">{totalSubcategories}</span>
              <span className="adm-cardSubtext">Configured subcategories</span>
            </div>
            <div className="adm-cardIconWrap">
              <IoPricetagsOutline />
            </div>
          </div>

          <div className="adm-card adm-card--green">
            <div className="adm-card-content">
              <span className="adm-cardLabel">Active Subcategories</span>
              <span className="adm-cardValue">{activeCount}</span>
              <span className="adm-cardSubtext">Live on storefront</span>
            </div>
            <div className="adm-cardIconWrap">
              <IoCheckmarkCircleOutline />
            </div>
          </div>

          <div className="adm-card adm-card--purple">
            <div className="adm-card-content">
              <span className="adm-cardLabel">Inactive Subcategories</span>
              <span className="adm-cardValue">{inactiveCount}</span>
              <span className="adm-cardSubtext">Hidden from storefront</span>
            </div>
            <div className="adm-cardIconWrap">
              <IoAlertCircleOutline />
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="adm-toolbar">
          <div className="adm-toolbar-left" style={{ flexWrap: "wrap", gap: 10 }}>
            <div className="adm-searchBox">
              <IoSearchOutline size={18} color="#64748b" />
              <input
                type="text"
                placeholder="Search subcategories by name or slug..."
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
                ...categoriesList.map((c) => ({
                  value: String(c.id),
                  label: c.name,
                })),
              ]}
            />

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
            <span>Add New Subcategory</span>
          </button>
        </div>

        {/* Subcategories Table */}
        <div className="adm-table-card">
          <div className="adm-table-responsive">
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Subcategory</th>
                  <th>Parent Category</th>
                  <th>Slug</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSubcategories.length > 0 ? (
                  paginatedSubcategories.map((sub) => {
                    const parentCat =
                      sub.category_name ||
                      categoriesList.find(
                        (c) => String(c.id) === String(sub.category_id)
                      )?.name;

                    return (
                      <tr key={sub.id}>
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
                                {sub.name}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td>
                          {parentCat ? (
                            <span
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                padding: "3px 10px",
                                borderRadius: 6,
                                fontSize: 12,
                                fontWeight: 600,
                                background: "#eef2ff",
                                color: "#4f46e5",
                              }}
                            >
                              {parentCat}
                            </span>
                          ) : (
                            <span style={{ color: "var(--adm-text-muted)", fontSize: 13 }}>
                              —
                            </span>
                          )}
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
                            /{sub.slug}
                          </code>
                        </td>
                        <td>
                          <button
                            onClick={() => handleToggleStatus(sub)}
                            title="Click to toggle status"
                            style={{
                              border: "none",
                              cursor: "pointer",
                              padding: "4px 10px",
                              borderRadius: 12,
                              fontSize: 12,
                              fontWeight: 700,
                              background:
                                sub.status === "Active" ? "#ecfdf5" : "#f1f5f9",
                              color:
                                sub.status === "Active" ? "#10b981" : "#64748b",
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
                                  sub.status === "Active" ? "#10b981" : "#94a3b8",
                              }}
                            />
                            {sub.status}
                          </button>
                        </td>
                        <td
                          style={{
                            fontSize: 13,
                            color: "var(--adm-text-secondary)",
                          }}
                        >
                          {sub.createdAt || "—"}
                        </td>
                        <td>
                          <div className="adm-actions-cell" style={{ justifyContent: "flex-end" }}>
                            <button
                              className="adm-action-btn adm-action-btn--edit"
                              onClick={() => handleOpenEdit(sub)}
                              title="Edit Subcategory"
                            >
                              <IoPencilOutline size={16} />
                            </button>
                            <button
                              className="adm-action-btn adm-action-btn--delete"
                              onClick={() => handleOpenDelete(sub)}
                              title="Delete Subcategory"
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
                      colSpan="6"
                      style={{ textAlign: "center", padding: "48px 20px" }}
                    >
                      <div className="adm-empty-state">
                        <IoAlertCircleOutline className="adm-empty-icon" />
                        <div className="adm-empty-title">
                          No subcategories found
                        </div>
                        <p
                          style={{
                            color: "var(--adm-text-secondary)",
                            fontSize: 14,
                          }}
                        >
                          Try adjusting your search criteria or add a new
                          subcategory.
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
            totalItems={filteredSubcategories.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={(newSize) => {
              setPageSize(newSize);
              setCurrentPage(1);
            }}
            pageSizeOptions={[5, 10, 20, 50]}
          />
        </div>

        {/* ── MODAL: Add Subcategory ── */}
        {isAddModalOpen && (
          <div className="adm-modal-overlay">
            <div className="adm-modal">
              <div className="adm-modal-header">
                <h3 className="adm-modal-title">Add New Subcategory</h3>
                <button
                  className="adm-modal-close"
                  onClick={() => setIsAddModalOpen(false)}
                >
                  <IoCloseOutline />
                </button>
              </div>
              <form onSubmit={handleAddSubcategory}>
                <div className="adm-modal-body">
                  <div className="adm-form-group">
                    <label className="adm-form-label">
                      Subcategory Name *
                    </label>
                    <input
                      type="text"
                      className="adm-form-input"
                      placeholder="e.g. T-shirts, Kurta, Sneakers"
                      value={formData.name}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormData({
                          ...formData,
                          name: val,
                          slug: slugifyCategory(val),
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
                    <label className="adm-form-label">Select Category</label>
                    <AdminSearchableSelect
                      value={formData.category_id}
                      onChange={(e) =>
                        setFormData({ ...formData, category_id: e.target.value })
                      }
                      placeholder="Select a category"
                      searchPlaceholder="Search category..."
                      options={[
                        { value: "", label: "Select a category" },
                        ...categoriesList.map((cat) => ({
                          value: String(cat.id),
                          label: cat.name,
                        })),
                      ]}
                    />
                  </div>

                  <div className="adm-form-group">
                    <label className="adm-form-label">Slug (URL path) *</label>
                    <input
                      type="text"
                      className="adm-form-input"
                      placeholder="e.g. t-shirts"
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
                    Create Subcategory
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ── MODAL: Edit Subcategory ── */}
        {isEditModalOpen && (
          <div className="adm-modal-overlay">
            <div className="adm-modal">
              <div className="adm-modal-header">
                <h3 className="adm-modal-title">Edit Subcategory</h3>
                <button
                  className="adm-modal-close"
                  onClick={() => setIsEditModalOpen(false)}
                >
                  <IoCloseOutline />
                </button>
              </div>
              <form onSubmit={handleUpdateSubcategory}>
                <div className="adm-modal-body">
                  <div className="adm-form-group">
                    <label className="adm-form-label">
                      Subcategory Name *
                    </label>
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
                    <label className="adm-form-label">Select Category</label>
                    <AdminSearchableSelect
                      value={formData.category_id}
                      onChange={(e) =>
                        setFormData({ ...formData, category_id: e.target.value })
                      }
                      placeholder="Select a category"
                      searchPlaceholder="Search category..."
                      options={[
                        { value: "", label: "None / Select a category" },
                        ...categoriesList.map((cat) => ({
                          value: String(cat.id),
                          label: cat.name,
                        })),
                      ]}
                    />
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

        {/* ── MODAL: Delete Subcategory ── */}
        {isDeleteModalOpen && selectedSubcategory && (
          <div className="adm-modal-overlay">
            <div className="adm-modal">
              <div className="adm-modal-header">
                <h3 className="adm-modal-title" style={{ color: "#ef4444" }}>
                  Delete Subcategory
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
                  Are you sure you want to delete subcategory{" "}
                  <strong>"{selectedSubcategory.name}"</strong>?
                </p>
                <p
                  style={{
                    color: "var(--adm-text-secondary)",
                    fontSize: 13,
                  }}
                >
                  This will remove the subcategory classification. Products
                  using this subcategory will remain in the catalog.
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
                  onClick={handleDeleteSubcategory}
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
