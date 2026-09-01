import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getCustomerOrderStats, getCustomerProfile } from "../../services/authServices";
import "./CustomerDashboard.css";

function CustomerDashboard() {

    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [stats, setStats] = useState({
        totalOrders: 0,
        pendingOrders: 0,
        confirmedOrders: 0,
        completedOrders: 0,
        cancelledOrders: 0
    });

    useEffect(() => {
        const stored = localStorage.getItem("user");
        if (stored) {
            setUser(JSON.parse(stored));
        }

        // Fetch live profile and stats
        const loadCustomerData = async () => {
            try {
                const [statsData, profileData] = await Promise.all([
                    getCustomerOrderStats().catch(() => null),
                    getCustomerProfile().catch(() => null)
                ]);
                if (statsData) setStats(statsData);
                if (profileData) setUser(profileData);
            } catch (err) {
                console.error("Error loading customer data:", err);
            }
        };

        loadCustomerData();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
    };

    return (
        <div className="customer-dashboard">

            {/* Header */}
            <header className="cd-header">
                <div className="cd-header-left">
                    <Link to="/CustomerDashboard" className="cd-logo">🛍️ My Account</Link>
                    <nav className="cd-nav-links">
                        <Link to="/CustomerDashboard" className="cd-nav-item active">Dashboard</Link>
                        <Link to="/CustomerOrder" className="cd-nav-item">Orders</Link>
                    </nav>
                </div>
                <div className="cd-header-right">
                    <span className="cd-welcome">
                        Hello, <strong>{user?.name || "Customer"}</strong>
                    </span>
                    <button className="cd-logout-btn" onClick={handleLogout}>
                        Logout
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="cd-main">

                {/* Welcome Banner */}
                <div className="cd-banner">
                    <div className="cd-banner-text">
                        <h1>Welcome back, {user?.name || "Customer"}! 👋</h1>
                        <p>Manage your orders, track deliveries, and explore our services.</p>
                    </div>
                    <div className="cd-banner-icon">🛒</div>
                </div>

                {/* Quick Stats */}
                <div className="cd-cards">
                    <div className="cd-card" onClick={() => navigate("/CustomerOrder")}>
                        <div className="cd-card-icon">📦</div>
                        <div className="cd-card-info">
                            <h3>My Orders ({stats.totalOrders || 0})</h3>
                            <p>{stats.pendingOrders || 0} Pending &bull; {stats.completedOrders || 0} Completed</p>
                        </div>
                    </div>
                    <div className="cd-card">
                        <div className="cd-card-icon">💎</div>
                        <div className="cd-card-info">
                            <h3>Services</h3>
                            <p>Browse catalogue</p>
                        </div>
                    </div>
                    <div className="cd-card">
                        <div className="cd-card-icon">👤</div>
                        <div className="cd-card-info">
                            <h3>My Profile</h3>
                            <p>{user?.email}</p>
                        </div>
                    </div>
                </div>

                {/* Account Info */}
                <div className="cd-info-box">
                    <h2>Account Details</h2>
                    <div className="cd-info-grid">
                        <div className="cd-info-item">
                            <span className="cd-label">Name</span>
                            <span className="cd-value">{user?.name || "—"}</span>
                        </div>
                        <div className="cd-info-item">
                            <span className="cd-label">Email</span>
                            <span className="cd-value">{user?.email || "—"}</span>
                        </div>
                        <div className="cd-info-item">
                            <span className="cd-label">Role</span>
                            <span className="cd-value cd-role-badge">Customer</span>
                        </div>
                    </div>
                </div>

            </main>
        </div>
    );
}

export default CustomerDashboard;
