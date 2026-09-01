import { NavLink, useNavigate } from "react-router-dom";

import "./Leftsidebar.css";

function Sidebar() {

    const navigate = useNavigate();

    const handleLogout = () => {

        localStorage.removeItem("token");
        localStorage.removeItem("user");

        navigate("/home");
    };

    return (
        <aside className="sidebar">

            <div className="sidebar-logo">
                Admin Panel
            </div>

            <nav className="sidebar-menu">

                <NavLink to="/AdminDashboard">
                    Dashboard
                </NavLink>

                <NavLink to="/users">
                    Users Management
                </NavLink>

                <NavLink to="/order">
                    Orders Management
                </NavLink>

                <button onClick={handleLogout}>
                    Logout
                </button>

            </nav>

        </aside>
    );
}

export default Sidebar;