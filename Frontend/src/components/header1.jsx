import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Divider from "@mui/material/Divider";

const Header1 = ({ style }) => {  // Accept style as a prop
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [username, setUsername] = useState("");

  useEffect(() => {
    fetch(`http://localhost:8080/currentUser`, {
      method: "GET",
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.username) {
          setUsername(data.username);
          setIsAdmin(data.isAdmin);
        }
      })
      .catch((error) => console.error("Error fetching current user:", error));
  }, []);

  const logout = () => {
    fetch('http://localhost:8080/auth/logout', {
      method: "POST",
      credentials: "include",
    })
    .then(_ => navigate("/", { replace: true }));
  };

  const profile = () => {
    navigate("/ProfilePage");
  };

  return (
    <div style={style}>  {/* Apply passed style */}
      <div
        style={{
          position: "relative",
          backgroundColor: "#CCCCFF",
          height: "70px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 20px",
        }}
      >
        {/* Task Management System Title */}
        <nav style={{ fontSize: "24px", fontWeight: "bold", color: "#333" }}>
          <a
            href="/admin"
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

        <nav style={{ display: "flex", alignItems: "center" }}>
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

        {isAdmin && (
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
              User Management
            </a>
          </nav>
        )}

        <Divider orientation="vertical" />

        <div style={{ display: "flex", alignItems: "center" }}>
          {username && (
            <div style={{ fontWeight: "bold", marginRight: "10px" }}>
              Logged in as: {username}
            </div>
          )}
          <button
            onClick={profile}
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
            onClick={logout}
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

export default Header1;
