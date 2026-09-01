import React from "react";
import { BrowserRouter,Routes,Route,Navigate} from "react-router-dom";

import Home from "./pages/Home/Home";
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import Dashboard from "./pages/Dashboard/Dashboard";
import User from "./pages/User/User";
import Order from "./pages/Orders/Order";
import ProtectedRoute from "./components/ProtectedRoute";
import CustomerDashboard from "./pages/CustomerDashboard/CustomerDashboard";
import CustomerOrder from "./pages/CustomerOrder/CustomerOrder";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                
                {/* Default page */}
                <Route
                    path="/"
                    element={<Navigate to="/home" replace />}
                />

                <Route path="/home" element={<Home />} />

                <Route
                    path="/login" element={<Login />}
                />

                <Route
                    path="/register" element={<Register />}
                />
                <Route
                    path="/AdminDashboard"
                    element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/users"
                    element={
                        <ProtectedRoute>
                            <User />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/order"
                    element={
                        <ProtectedRoute><Order /></ProtectedRoute>
                    }
                />

                <Route
                    path="/CustomerDashboard"
                    element={
                        <ProtectedRoute><CustomerDashboard /></ProtectedRoute>
                    }
                />

                <Route
                    path="/CustomerOrder"
                    element={
                        <ProtectedRoute><CustomerOrder /></ProtectedRoute>
                    }
                />

            </Routes>

        </BrowserRouter>
    );
}

export default App;