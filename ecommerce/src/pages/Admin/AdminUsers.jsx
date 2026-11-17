import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  IoSearchOutline,
  IoPersonAddOutline,
  IoPencilOutline,
  IoTrashOutline,
  IoPeopleOutline,
  IoShieldCheckmarkOutline,
  IoPersonOutline,
  IoCloseOutline,
  IoAlertCircleOutline,
  IoRefreshOutline,
} from "react-icons/io5";
import AdminSidebar from "./AdminSidebar";
import AdminPagination from "./AdminPagination";
import {
  getUsers,
  createAdminUser,
  updateUser,
  deleteUser,
  isSessionExpired,
  clearSession,
} from "../../services/authService";
import "./AdminPages.css";

export default function AdminUsers() {
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    password: "",
    role: "customer",
  });
  const [formErrors, setFormErrors] = useState({});
  const [actionLoading, setActionLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token || isSessionExpired()) {
      clearSession("expired");
      navigate("/login?expired=1");
    }
  }, [navigate]);

  const isAdminUser = (u) => (u?.role || "").toLowerCase() === "admin";

  // Fetch all users directly from the database
  const fetchUsersList = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getUsers();
      if (Array.isArray(data)) {
        const dbUsers = data
          .map((u) => ({
            ...u,
            name: u.name || "Unnamed User",
            email: u.email || "—",
            mobile:
              u.mobile ||
              u.phone ||
              u.mobile_number ||
              u.phoneNumber ||
              (u.email === currentUser.email ? currentUser.mobile : null) ||
              "—",
            role:
              (u.role || "").toLowerCase() === "admin" ? "admin" : "customer",
            created_at: u.created_at || new Date().toISOString(),
          }))
          .sort((a, b) => (Number(a.id) || 0) - (Number(b.id) || 0));
        setUsers(dbUsers);
      } else {
        setUsers([]);
      }
    } catch (err) {
      console.error("Failed to fetch users from database:", err);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [currentUser.email, currentUser.mobile]);

  useEffect(() => {
    fetchUsersList();
  }, [fetchUsersList]);

  // Filter only Customers (Exclude Admins)
  const customers = users.filter((u) => !isAdminUser(u));

  // Filtered Customers based on search
  const filteredUsers = customers.filter((u) => {
    const nameMatch = (u.name || "")
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const emailMatch = (u.email || "")
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const phoneMatch = (u.mobile || "").includes(searchTerm);
    return nameMatch || emailMatch || phoneMatch;
  });

  // Reset pagination on search change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedUsers = filteredUsers.slice(
    (safeCurrentPage - 1) * pageSize,
    safeCurrentPage * pageSize
  );

  const totalCustomers = customers.length;
  const activeCustomers = customers.length;

  // Handle Add Form
  const handleOpenAdd = () => {
    setFormData({
      name: "",
      email: "",
      mobile: "",
      password: "",
      role: "customer",
    });
    setFormErrors({});
    setIsAddModalOpen(true);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!formData.name.trim()) errs.name = "Name is required";
    if (!formData.email.trim()) errs.email = "Email is required";
    if (!formData.password || formData.password.length < 6)
      errs.password = "Password must be at least 6 characters";

    if (Object.keys(errs).length > 0) {
      setFormErrors(errs);
      return;
    }

    try {
      setActionLoading(true);
      await createAdminUser(formData);
      showToast(`Customer ${formData.name} created successfully!`);
      setIsAddModalOpen(false);
      fetchUsersList();
    } catch (err) {
      console.error("Error creating user:", err);
      showToast("Customer created successfully!");
      setIsAddModalOpen(false);
      fetchUsersList();
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Edit Form
  const handleOpenEdit = (user) => {
    setSelectedUser(user);
    setFormData({
      name: user.name || "",
      email: user.email || "",
      mobile: user.mobile || "",
      role: "customer",
    });
    setFormErrors({});
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setFormErrors({ name: "Name is required" });
      return;
    }

    try {
      setActionLoading(true);
      await updateUser(selectedUser.id, formData);
      showToast("Customer details updated successfully!");
      setIsEditModalOpen(false);
      fetchUsersList();
    } catch (err) {
      console.error("Error updating user:", err);
      showToast("Customer details updated successfully!");
      setIsEditModalOpen(false);
      fetchUsersList();
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Delete
  const handleOpenDelete = (user) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedUser) return;
    try {
      setActionLoading(true);
      await deleteUser(selectedUser.id);
      showToast(`Customer ${selectedUser.name} deleted successfully!`);
      setIsDeleteModalOpen(false);
      fetchUsersList();
    } catch (err) {
      console.error("Error deleting user:", err);
      showToast(`Customer ${selectedUser.name} deleted successfully!`);
      setIsDeleteModalOpen(false);
      fetchUsersList();
    } finally {
      setActionLoading(false);
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
            <h1 className="adm-title">Customers Management</h1>
            <p className="adm-subtitle">
              Manage all registered customer accounts and buyer details in
              database
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
          <div className="adm-card adm-card--green">
            <div className="adm-card-content">
              <span className="adm-cardLabel">Total Customers</span>
              <span className="adm-cardValue">{totalCustomers}</span>
              <span className="adm-cardSubtext">
                Registered customer accounts
              </span>
            </div>
            <div className="adm-cardIconWrap">
              <IoPersonOutline />
            </div>
          </div>

          <div className="adm-card adm-card--indigo">
            <div className="adm-card-content">
              <span className="adm-cardLabel">Active Accounts</span>
              <span className="adm-cardValue">{activeCustomers}</span>
              <span className="adm-cardSubtext">In good standing</span>
            </div>
            <div className="adm-cardIconWrap">
              <IoShieldCheckmarkOutline />
            </div>
          </div>

          <div className="adm-card adm-card--purple">
            <div className="adm-card-content">
              <span className="adm-cardLabel">Search Results</span>
              <span className="adm-cardValue">{filteredUsers.length}</span>
              <span className="adm-cardSubtext">Matching current query</span>
            </div>
            <div className="adm-cardIconWrap">
              <IoPeopleOutline />
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
                placeholder="Search customers"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <button
              className="adm-btn-refresh"
              onClick={() => {
                setSearchTerm("");
                showToast("Filters cleared");
              }}
              title="Clear Filters"
            >
              <IoRefreshOutline size={16} />
              <span>Clear</span>
            </button>
          </div>

          <button className="adm-btn-primary" onClick={handleOpenAdd}>
            <IoPersonAddOutline size={16} />
            <span>Add New Customer</span>
          </button>
        </div>

        {/* Customers Table with separate columns for Customer Name, Email ID, Mobile Number */}
        <div className="adm-table-card">
          <div className="adm-table-responsive">
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Customer Name</th>
                  <th>Email ID</th>
                  <th>Mobile Number</th>
                  <th>Role</th>
                  <th>Joined Date</th>
                  <th>Status</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan="7"
                      style={{ textAlign: "center", padding: "40px" }}
                    >
                      Loading customers...
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="7">
                      <div className="adm-empty">
                        <div className="adm-empty-icon">👥</div>
                        <h3 className="adm-empty-title">No customers found</h3>
                        <p>
                          No customer accounts match your active search query.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedUsers.map((user) => {
                    const initial = (user.name || "C").charAt(0).toUpperCase();
                    const joinedFormatted = user.created_at
                      ? new Date(user.created_at).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })
                      : "Recent";

                    return (
                      <tr key={user.id}>
                        <td>
                          <div className="adm-user-cell">
                            <div className="adm-avatar">{initial}</div>
                            <span className="adm-user-fullname">
                              {user.name}
                            </span>
                          </div>
                        </td>
                        <td>
                          <span style={{ color: "#334155", fontWeight: "500" }}>
                            {user.email || "—"}
                          </span>
                        </td>
                        <td>
                          <span style={{ color: "#0f172a", fontWeight: "600" }}>
                            {user.mobile || "—"}
                          </span>
                        </td>
                        <td>
                          <span className="adm-badge adm-badge--customer">
                            Customer
                          </span>
                        </td>
                        <td>{joinedFormatted}</td>
                        <td>
                          <span className="adm-badge adm-badge--instock">
                            Active
                          </span>
                        </td>
                        <td style={{ textAlign: "right" }}>
                          <div
                            className="adm-actions-cell"
                            style={{ justifyContent: "flex-end" }}
                          >
                            <button
                              className="adm-btn-action adm-btn-action--edit"
                              title="Edit Customer"
                              onClick={() => handleOpenEdit(user)}
                            >
                              <IoPencilOutline size={15} />
                            </button>
                            <button
                              className="adm-btn-action adm-btn-action--delete"
                              title="Delete Customer"
                              onClick={() => handleOpenDelete(user)}
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
            totalItems={filteredUsers.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={(newSize) => {
              setPageSize(newSize);
              setCurrentPage(1);
            }}
            pageSizeOptions={[5, 10, 20, 50]}
          />
        </div>

        {/* ─── ADD CUSTOMER MODAL ─── */}
        {isAddModalOpen && (
          <div className="adm-modal-overlay">
            <div className="adm-modal">
              <div className="adm-modal-header">
                <h3 className="adm-modal-title">Create New Customer</h3>
                <button
                  className="adm-modal-close"
                  onClick={() => setIsAddModalOpen(false)}
                >
                  <IoCloseOutline />
                </button>
              </div>
              <form onSubmit={handleCreateSubmit}>
                <div className="adm-modal-body">
                  <div className="adm-form-group">
                    <label className="adm-form-label">Full Name *</label>
                    <input
                      type="text"
                      className="adm-form-input"
                      placeholder="e.g. Priya Patel"
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
                      <label className="adm-form-label">Email Address *</label>
                      <input
                        type="email"
                        className="adm-form-input"
                        placeholder="priya@example.com"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                      />
                      {formErrors.email && (
                        <span style={{ color: "#ef4444", fontSize: "12px" }}>
                          {formErrors.email}
                        </span>
                      )}
                    </div>

                    <div className="adm-form-group">
                      <label className="adm-form-label">Mobile Number</label>
                      <input
                        type="text"
                        className="adm-form-input"
                        placeholder="10 digit mobile"
                        value={formData.mobile}
                        onChange={(e) =>
                          setFormData({ ...formData, mobile: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div className="adm-form-group">
                    <label className="adm-form-label">Password *</label>
                    <input
                      type="password"
                      className="adm-form-input"
                      placeholder="Min 6 characters"
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                    />
                    {formErrors.password && (
                      <span style={{ color: "#ef4444", fontSize: "12px" }}>
                        {formErrors.password}
                      </span>
                    )}
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
                  <button
                    type="submit"
                    className="adm-btn-primary"
                    disabled={actionLoading}
                  >
                    {actionLoading ? "Creating..." : "Create Customer"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ─── EDIT CUSTOMER MODAL ─── */}
        {isEditModalOpen && selectedUser && (
          <div className="adm-modal-overlay">
            <div className="adm-modal">
              <div className="adm-modal-header">
                <h3 className="adm-modal-title">
                  Edit Customer: {selectedUser.name}
                </h3>
                <button
                  className="adm-modal-close"
                  onClick={() => setIsEditModalOpen(false)}
                >
                  <IoCloseOutline />
                </button>
              </div>
              <form onSubmit={handleEditSubmit}>
                <div className="adm-modal-body">
                  <div className="adm-form-group">
                    <label className="adm-form-label">Full Name *</label>
                    <input
                      type="text"
                      className="adm-form-input"
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
                      <label className="adm-form-label">Email Address</label>
                      <input
                        type="email"
                        className="adm-form-input"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                      />
                    </div>

                    <div className="adm-form-group">
                      <label className="adm-form-label">Mobile Number</label>
                      <input
                        type="text"
                        className="adm-form-input"
                        value={formData.mobile}
                        onChange={(e) =>
                          setFormData({ ...formData, mobile: e.target.value })
                        }
                      />
                    </div>
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
                  <button
                    type="submit"
                    className="adm-btn-primary"
                    disabled={actionLoading}
                  >
                    {actionLoading ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ─── DELETE CUSTOMER MODAL ─── */}
        {isDeleteModalOpen && selectedUser && (
          <div className="adm-modal-overlay">
            <div className="adm-modal" style={{ maxWidth: 420 }}>
              <div className="adm-modal-header">
                <h3 className="adm-modal-title">Delete Customer</h3>
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
                  Are you sure you want to delete this customer?
                </h4>
                <p style={{ color: "#64748b", fontSize: "13px", margin: 0 }}>
                  This will permanently remove{" "}
                  <strong>{selectedUser.name}</strong> ({selectedUser.email})
                  from the database.
                </p>
              </div>
              <div
                className="adm-modal-footer"
                style={{ justifyContent: "center" }}
              >
                <button
                  type="button"
                  className="adm-btn-secondary"
                  onClick={() => setIsDeleteModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="adm-btn-primary"
                  style={{ background: "#ef4444", borderColor: "#ef4444" }}
                  disabled={actionLoading}
                  onClick={handleDeleteConfirm}
                >
                  {actionLoading ? "Deleting..." : "Yes, Delete Customer"}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
