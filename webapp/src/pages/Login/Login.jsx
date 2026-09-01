import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../../services/authServices";
import "./Login.css";

function Login() {

    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        email: "", password: ""
    });

    const [message, setMessage] = useState("");
    const [isError, setIsError] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData, [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {

        e.preventDefault();

        try {

            const data = await loginUser(formData);

            if (data.token) {

                setIsError(false);
                setMessage(data.message); 

                localStorage.setItem(
                    "token",
                    data.token
                );

                localStorage.setItem(
                    "user",
                    JSON.stringify(data.user)
                );
                
                setTimeout(() => {
                // Role-based navigation
                if (data.user.role === "admin") {
                    navigate("/AdminDashboard");
                } else {
                    navigate("/CustomerDashboard");
                }
                 }, 1000);

            } else {

                setIsError(true);
                setMessage(data.message);

            }
        } catch (error) {

            setIsError(true);
            setMessage(
                error.response?.data?.message || "Enter Your Registered Email And Password!!"
            );

        }
    };

    return (
        <div className="login-page">

            <form
                className="login-form"
                onSubmit={handleSubmit}
            >

                <h2> Login Here </h2>

                <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                />

                <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                />

                <button type="submit">
                    Login
                </button>

                {message && (
                    <p className={isError ? "msg-error" : "msg-success"}>
                        {message}
                    </p>
                )}

                <p className="auth-link">
                    Don't have an account?
                    <Link to="/register">Register</Link>
                </p>

            </form>

        </div>
    );
}

export default Login;