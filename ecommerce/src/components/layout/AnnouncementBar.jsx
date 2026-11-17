import React, { useState } from "react";
import { Link } from "react-router-dom";
import { IoClose } from "react-icons/io5";
import "./AnnouncementBar.css";

export default function AnnouncementBar() {
  const [visible, setVisible] = useState(true);

  // Hide the bar when a user is already logged in
  const isLoggedIn = !!localStorage.getItem("token");
  if (isLoggedIn || !visible) return null;

  return (
    <div className="announcement-bar">
      <p>
        Sign up and get 20% off to your first order.{" "}
        <Link to="/signup">Sign Up Now</Link>
      </p>
      <button
        onClick={() => setVisible(false)}
        className="announcement-bar__close"
        aria-label="Dismiss announcement"
      >
        <IoClose size={18} />
      </button>
    </div>
  );
}
