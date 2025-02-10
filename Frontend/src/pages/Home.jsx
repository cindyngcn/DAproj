import React from "react";
import Header from "../components/Header";
import { useNavigate } from "react-router-dom";
import Divider from "@mui/material/Divider";
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TableBody from '@mui/material/TableBody';

const Home = () => {
  const navigate = useNavigate();  // Initialize navigate function

  const logout = () => {
    // Perform logout logic (e.g., clearing user session or tokens)
    navigate('/', { replace: true });  // Redirect to the root route (LoginPage)
  };

  //MIGHT WANT TO CHANGE THE PAGE
  const profile = () => {
    navigate('/users');
  }

  return (
    <div>
      {/* Header with Task Management, Profile and Logout buttons */}
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

        {/* New "Task Management" Nav Link */}
        <Divider orientation="vertical">
        </Divider>
        <nav style={{ display: "flex", alignItems: "center" }}>
          <a
            href="/about" //NEED TO CHANGE TO TASK MANAGEMENT PAGE?
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
        <Divider orientation="vertical">
        </Divider>
        <nav style={{ display: "flex", alignItems: "center" }}>
          <a
            href="/users" //NEED TO CHANGE TO TASK MANAGEMENT PAGE?
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
        <Divider orientation="vertical">
        </Divider>
        {/* Profile and Logout buttons */}
        <div style={{ display: "flex", alignItems: "center" }}>
          <button
            onClick={profile}  //MIGHT WANT TO CHANGE THE PAGE
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

      {/* Body of the Home Page */}
      <div>
        <h1>Applications</h1>
      </div>
      <table>
        <TableHead>
          <TableRow></TableRow>
        </TableHead>
      </table>
      <div>
        
      </div>
    </div>
  );
};

export default Home;
