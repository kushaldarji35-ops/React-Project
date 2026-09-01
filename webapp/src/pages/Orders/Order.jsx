import { useEffect, useState } from "react";
import {
    getOrders,
    createOrder,
    updateOrder,
    deleteOrder
} from "../../services/authServices";
import Sidebar from "../../components/Leftsidebar/Leftsidebar";
import "./Order.css";

const EMPTY_FORM = {
    customer: "",
    email: "",
    item: "",
    order_date: "",
    status: "Pending"
};

const STATUS_OPTIONS = ["Pending", "Confirmed", "Completed", "Cancelled"];

function Order() {

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [successMsg, setSuccessMsg] = useState("");

    // "add" | "edit" | null
    const [mode, setMode] = useState(null);
    const [editId, setEditId] = useState(null);
    const [formData, setFormData] = useState(EMPTY_FORM);
    const [search, setSearch] = useState("");
    const [filterStatus, setFilterStatus] = useState("All");


    /* ── Load ── */
    const loadOrders = async () => {
        try {
            setLoading(true);
            setError("");
            const data = await getOrders();
            setOrders(Array.isArray(data) ? data : []);
        } catch (err) {
            if (err.response?.status === 401) {
                localStorage.removeItem("token");
                window.location.href = "/login";
            } else {
                setError(err.response?.data?.message || "Failed to fetch orders.");
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadOrders(); }, []);


    /* ── Helpers ── */
    const flash = (msg) => {
        setSuccessMsg(msg);
        setTimeout(() => setSuccessMsg(""), 3000);
    };

    const openAdd = () => {
        setFormData(EMPTY_FORM);
        setEditId(null);
        setMode("add");
    };

    const openEdit = (order) => {
        setFormData({
            customer: order.customer,
            email: order.email,
            item: order.item,
            order_date: order.order_date?.slice(0, 10) ?? "",
            status: order.status
        });
        setEditId(order.id);
        setMode("edit");
    };

    const closeForm = () => {
        setMode(null);
        setEditId(null);
        setFormData(EMPTY_FORM);
    };

    const handleChange = (e) =>
        setFormData({ ...formData, [e.target.name]: e.target.value });


    /* ── Submit ── */
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (mode === "add") {
                await createOrder(formData);
                flash("Order created successfully!");
            } else {
                await updateOrder(editId, formData);
                flash("Order updated successfully!");
            }
            closeForm();
            loadOrders();
        } catch (err) {
            setError(err.response?.data?.message || "Operation failed.");
        }
    };


    /* ── Delete ── */
    const handleDelete = async (id) => {
        if (!window.confirm("Delete this order?")) return;
        try {
            await deleteOrder(id);
            flash("Order deleted.");
            loadOrders();
        } catch (err) {
            setError(err.response?.data?.message || "Failed to delete order.");
        }
    };


    /* ── Filter ── */
    const filtered = orders.filter((o) => {
        const matchSearch =
            o.customer?.toLowerCase().includes(search.toLowerCase()) ||
            o.email?.toLowerCase().includes(search.toLowerCase()) ||
            o.item?.toLowerCase().includes(search.toLowerCase());
        const matchStatus = filterStatus === "All" || o.status === filterStatus;
        return matchSearch && matchStatus;
    });


    /* ── Status badge colour ── */
    const badgeClass = (status) => {
        switch (status) {
            case "Confirmed":  return "badge badge-confirmed";
            case "Completed":  return "badge badge-completed";
            case "Cancelled":  return "badge badge-cancelled";
            default:           return "badge badge-pending";
        }
    };


    return (
        <div className="order-page">

            <Sidebar />

            <main className="order-main">

                {/* ── Page Header ── */}
                <div className="order-page-header">
                    <div>
                        <h2>Orders Management</h2>
                        <p className="order-subtitle">
                            {orders.length} total order{orders.length !== 1 ? "s" : ""}
                        </p>
                    </div>
                    <button className="btn-add" onClick={openAdd}>
                        + Add Order
                    </button>
                </div>


                {/* ── Alerts ── */}
                {error      && <p className="order-alert order-alert-error">{error}</p>}
                {successMsg && <p className="order-alert order-alert-success">{successMsg}</p>}


                {/* ── Filters ── */}
                <div className="order-filters">
                    <input
                        className="order-search"
                        type="text"
                        placeholder="Search by name, email or service…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <select
                        className="order-filter-select"
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                    >
                        <option value="All">All Status</option>
                        {STATUS_OPTIONS.map((s) => (
                            <option key={s} value={s}>{s}</option>
                        ))}
                    </select>
                </div>


                {/* ── Add / Edit Form ── */}
                {mode && (
                    <form className="order-form" onSubmit={handleSubmit}>
                        <h3 className="order-form-title">
                            {mode === "add" ? "➕ New Order" : "✏️ Edit Order"}
                        </h3>

                        <div className="order-form-grid">
                            <div className="order-field">
                                <label>Customer Name</label>
                                <input
                                    type="text"
                                    name="customer"
                                    value={formData.customer}
                                    onChange={handleChange}
                                    placeholder="Full name"
                                    required
                                />
                            </div>
                            <div className="order-field">
                                <label>Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="email@example.com"
                                    required
                                />
                            </div>
                            <div className="order-field">
                                <label>Item</label>
                                <input
                                    type="text"
                                    name="item"
                                    value={formData.item}
                                    onChange={handleChange}
                                    placeholder="Item or service"
                                    required
                                />
                            </div>
                            <div className="order-field">
                                <label>Order Date</label>
                                <input
                                    type="date"
                                    name="order_date"
                                    value={formData.order_date}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="order-field">
                                <label>Status</label>
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                >
                                    {STATUS_OPTIONS.map((s) => (
                                        <option key={s} value={s}>{s}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="order-form-actions">
                            <button type="submit" className="btn-save">
                                {mode === "add" ? "Create Order" : "Save Changes"}
                            </button>
                            <button type="button" className="btn-cancel" onClick={closeForm}>
                                Cancel
                            </button>
                        </div>
                    </form>
                )}


                {/* ── Table ── */}
                {loading ? (
                    <p className="order-loading">Loading orders…</p>
                ) : (
                    <div className="order-table-wrap">  
                        <table className="order-table">
                            <thead>
                                <tr>
                                    <th>id</th>
                                    <th>Customer</th>
                                    <th>Email</th>
                                    <th>Item</th>
                                    <th>Date</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="order-empty">
                                            No orders found.
                                        </td>
                                    </tr>
                                ) : (
                                    filtered.map((order, i) => (
                                        <tr key={order.id}>
                                            <td>{i + 1}</td>
                                            <td className="order-name">{order.customer}</td>
                                            <td>{order.email}</td>
                                            <td>{order.item}</td>
                                            <td>
                                                {order.order_date
                                                    ? new Date(order.order_date).toLocaleDateString("en-IN")
                                                    : "—"}
                                            </td>
                                            <td>
                                                <span className={badgeClass(order.status)}>
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td>
                                                <button
                                                    className="btn-edit"
                                                    onClick={() => openEdit(order)}
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    className="btn-delete"
                                                    onClick={() => handleDelete(order.id)}
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

            </main>
        </div>
    );
}

export default Order;
