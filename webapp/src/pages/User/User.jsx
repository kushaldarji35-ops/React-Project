import { useEffect, useState } from "react";

import {
    getUsers,
    updateUser,
    deleteUser
} from "../../services/authServices";

import "./User.css";
import Sidebar from "../../components/Leftsidebar/Leftsidebar";

function User() {

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [editId, setEditId] = useState(null);

    const [formData, setFormData] = useState({
        name: "",
        email: ""
    });


    const loadUsers = async () => {

        try {

            setLoading(true);
            setError("");

        const data = await getUsers();

        if (Array.isArray(data)) {
            setUsers(data);
        }

        } catch (err) {

            console.error("Failed to load users:", err);

            if (err.response?.status === 401) {
                localStorage.removeItem("token");
                window.location.href = "/login";
            } else {
                setError(
                    err.response?.data?.message ||
                    "Failed to fetch users."
                );
            }

        } finally {

            setLoading(false);

        }
    };


    useEffect(() => {

        loadUsers();

    }, []);


    const handleChange = (e) => {

        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };


    const handleEdit = (user) => {

        setEditId(user.id);

        setFormData({
            name: user.name,
            email: user.email
        });
    };


    const handleUpdate = async (e) => {

        e.preventDefault();

        try {

        await updateUser(editId, formData);

        setEditId(null);

            setFormData({ name: "", email: "" });

        loadUsers();

        } catch (err) {

            console.error("Update failed:", err);
            setError(err.response?.data?.message || "Failed to update user.");

        }
    };


    const handleDelete = async (id) => {

        const confirmDelete = window.confirm(
            "Are you sure you want to delete this user?"
        );

        if (!confirmDelete) {
            return;
        }

        try {

        await deleteUser(id);
        loadUsers();

        } catch (err) {

            console.error("Delete failed:", err);
            setError(err.response?.data?.message || "Failed to delete user.");

        }
    };



    return (

        <div className="user">
            <Sidebar/>
            <main>

                <h2>Users</h2>


                {error && (
                    <p className="error-message">{error}</p>
                )}

                {loading && (
                    <p className="loading-message">Loading users...</p>
                )}


                {editId && (

                    <form
                        className="edit-form"
                        onSubmit={handleUpdate}
                    >

                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Name"
                        />

                        <input
                           value={formData.email}
                           readOnly
                            className="readonly-input"
                        />

                        <button type="submit">
                            Update
                        </button>

                        <button
                            type="button"
                            onClick={() => setEditId(null)}
                        >
                            Cancel
                        </button>

                    </form>
                )}


                <div className="table-container">

                    <table>

                        <thead>

                            <tr>
                                <th>ID</th>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Actions</th>
                            </tr>

                        </thead>

                        <tbody>

                            {users.map((user, index) => (

                                <tr key={user.id}>

                                    <td>{index + 1}</td>

                                    <td>{user.name}</td>

                                    <td>{user.email}</td>
                                    
                                    <td>{user.role}</td>

                                    <td>

                                        <button
                                            className="edit"
                                            onClick={() =>
                                                handleEdit(user)
                                            }
                                        >
                                            Edit
                                        </button>

                                        <button
                                            className="delete"
                                            onClick={() =>
                                                handleDelete(user.id)
                                            }
                                        >
                                            Delete
                                        </button>

                                    </td>

                                </tr>

                            ))}

                        </tbody>

                    </table>

                </div>

            </main>

        </div>
    );
}

export default User;