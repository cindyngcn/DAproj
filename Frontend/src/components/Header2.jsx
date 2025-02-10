import React from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import Divider from "@mui/material/Divider"; // Import Divider if using Material UI

const Header2 = () => {
  const navigate = useNavigate(); // Initialize navigate function

  const logout = () => {
    // Perform logout logic (e.g., clearing user session or tokens)
    navigate('/', { replace: true });  // Redirect to the root route (LoginPage)
  };

  // Profile navigation function
  const profile = () => {
    navigate('/users');
  };

  return (
    <div>
      <div
        style={{
          position: "relative",
          backgroundColor: "#CCCCFF", // Same background color
          height: "70px", // Header height
          display: "flex",
          alignItems: "center", // Center the items vertically
          justifyContent: "space-between", // Distribute the content evenly
          padding: "0 20px", // Add horizontal padding
        }}
      >
        {/* Task Management System Title */}
        <nav style={{ fontSize: "24px", fontWeight: "bold", color: "#333" }}>
          <a
            href="/home"
            style={{
              marginRight: "20px",
              color: "#333",
              textDecoration: "none",
              fontSize: "24px",
              fontWeight: "bold",
            }}
          >
            Task Management System
          </a>
        </nav>

        <Divider orientation="vertical" />

        <nav style={{ display: "flex", alignItems: "left" }}>
          <a
            href="/about"
            style={{
              marginRight: "20px",
              color: "#333",
              textDecoration: "none",
              fontSize: "16px",
            }}
          >
            Task Management
          </a>
        </nav>

        <Divider orientation="vertical" />

        <nav style={{ display: "flex", alignItems: "center" }}>
          <a
            href="/users"
            style={{
              marginRight: "20px",
              color: "#333",
              textDecoration: "none",
              fontSize: "16px",
            }}
          >
          </a>
        </nav>

        {/* Profile and Logout buttons */}
        <div style={{ display: "flex", alignItems: "center" }}>
          <button
            onClick={profile} // Handle Profile button click
            style={{
              marginRight: "10px",
              padding: "8px 15px",
              backgroundColor: "#ADADC9",
              color: "white",
              border: "2px solid #594D5B",
              borderRadius: "4px",
              fontSize: "14px",
              cursor: "pointer",
            }}
          >
            Profile
          </button>
          <button
            onClick={logout} // Handle Logout button click
            style={{
              padding: "8px 15px",
              backgroundColor: "#FF6090",
              color: "white",
              border: "2px solid #E0218A",
              borderRadius: "4px",
              fontSize: "14px",
              cursor: "pointer",
            }}
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Header2;
