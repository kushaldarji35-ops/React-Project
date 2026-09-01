import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../../services/authServices";

import "./Register.css";


function Register() {

    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: ""
    });

    const [message, setMessage] = useState("");
    const [isError, setIsError] = useState(false);


    const handleChange = (e) => {

        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };


    const handleSubmit = async (e) => {

        e.preventDefault();
        const emailPattern =  /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const passwordPattern =  /^(?=[A-Z])(?=.{6,}$)(?=.*[!@#$%^&*])/;

        if (!emailPattern.test(formData.email)) {
            setIsError(true);
            setMessage("Please enter a valid email address");
            return;
        }

        if (!passwordPattern.test(formData.password)) {
            setIsError(true);
            setMessage("Password must be at least 6 characters, start with a capital letter, and contain a special character");
            return;
        }

        try {

            const data = await registerUser(formData);

            setIsError(false);
            setMessage(data.message);

            if (data.userID) {

                setTimeout(() => {
                    navigate("/login");
                }, 1000);

            }

        } catch (err) {

            setIsError(true);
            setMessage(
                err.response?.data?.message ||
                "Registration failed. Please try again."
            );

        }
    };


    return (

        <div className="register-page">

            <form
                className="register-form"
                onSubmit={handleSubmit}
            >

                <h2>Create Account</h2>

                <input
                    type="text"
                    name="name"
                    placeholder="Name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                />

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
                    Register
                </button>

                {message && (
                    <p className={isError ? "msg-error" : "msg-success"}>
                        {message}
                    </p>
                )}

                <p className="auth-link">
                    Already have an account?
                    <Link to="/login">Login</Link>
                </p>

            </form>

        </div>
    );
}

export default Register;