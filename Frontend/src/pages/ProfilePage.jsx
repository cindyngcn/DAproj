import React, { useState, useEffect } from "react";
import axios from "axios";
import Header1 from "../components/header1";

const ProfilePage = () => {
  const [userData, setUserData] = useState({
    username: "",
    email: "",
    newEmail: "",
    newPassword: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    axios
      .get("http://localhost:8080/currentUser", { withCredentials: true })
      .then((response) => {
        setUserData((prevData) => ({
          ...prevData,
          username: response.data.username,
          email: response.data.email || "",
        }));
        setIsLoading(false);
      })
      .catch((error) => {
        setErrorMessage("Failed to fetch user data.");
        setIsLoading(false);
      });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSave = () => {
    const data = {};
    if (userData.newEmail) data.email = userData.newEmail;
    if (userData.newPassword) data.password = userData.newPassword;

    axios
      .put("http://localhost:8080/profile", data, { withCredentials: true })
      .then((response) => {
        setSuccessMessage("Profile updated successfully.");
        setErrorMessage("");
      })
      .catch((error) => {
        setErrorMessage("Failed to update profile.");
        setSuccessMessage("");
      });
  };

  const handleCancel = () => {
    setUserData((prevData) => ({
      ...prevData,
      newEmail: "",
      newPassword: "",
    }));
    setSuccessMessage("");
    setErrorMessage("");
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const profileContainerStyle = {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    backgroundColor: "#f4f7fc",
  };

  const profileCardStyle = {
    backgroundColor: "white",
    padding: "30px",
    borderRadius: "8px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
    width: "100%",
    maxWidth: "400px",
    textAlign: "center",
  };

  const profileHeadingStyle = {
    textAlign: "center",
    fontSize: "24px",
    marginBottom: "20px",
  };

  const inputGroupStyle = {
    marginBottom: "15px",
  };

  const labelStyle = {
    display: "block",
    fontWeight: "600",
    marginBottom: "5px",
  };

  const inputStyle = {
    width: "100%",
    padding: "10px",
    border: "1px solid #ddd",
    borderRadius: "5px",
    fontSize: "14px",
    backgroundColor: "#f9f9f9",
  };

  const readonlyInputStyle = {
    backgroundColor: "#e9ecef",
    cursor: "not-allowed",
  };

  const errorMessageStyle = {
    color: "red",
    fontSize: "14px",
    textAlign: "center",
    marginTop: "10px",
  };

  const successMessageStyle = {
    color: "green",
    fontSize: "14px",
    textAlign: "center",
    marginTop: "10px",
  };

  const buttonContainerStyle = {
    display: "flex",
    justifyContent: "center",
    gap: "10px",
    marginTop: "20px",
  };

  const saveButtonStyle = {
    padding: "10px 20px",
    fontSize: "14px",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    backgroundColor: "#4caf50",
    color: "white",
    transition: "background-color 0.3s ease",
  };

  const cancelButtonStyle = {
    padding: "10px 20px",
    fontSize: "14px",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    backgroundColor: "#f44336",
    color: "white",
    transition: "background-color 0.3s ease",
  };

  const saveButtonHoverStyle = {
    backgroundColor: "#45a049",
  };

  const cancelButtonHoverStyle = {
    backgroundColor: "#e53935",
  };

  const headerStyle = {
    width: "100%",  // Ensures the header fills the entire width of the page
    backgroundColor: "#fff",
    padding: "10px 0",
    textAlign: "center",
  };

  return (
    <div style={profileContainerStyle}>
      <Header1 style={headerStyle} /> {/* Apply the style here */}
      <div style={profileCardStyle}>
        <h1 style={profileHeadingStyle}><strong>My Profile</strong></h1>

        <div style={inputGroupStyle}>
          <label style={labelStyle}>Username</label>
          <input
            type="text"
            value={userData.username}
            readOnly
            style={{ ...inputStyle, ...readonlyInputStyle }}
          />
        </div>

        <div style={inputGroupStyle}>
          <label style={labelStyle}>Email</label>
          <input
            type="text"
            value={userData.email}
            readOnly
            style={{ ...inputStyle, ...readonlyInputStyle }}
          />
        </div>

        <div style={inputGroupStyle}>
          <label style={labelStyle}>Update Email</label>
          <input
            type="email"
            name="newEmail"
            value={userData.newEmail}
            onChange={handleChange}
            placeholder="Enter new email"
            style={inputStyle}
          />
        </div>

        <div style={inputGroupStyle}>
          <label style={labelStyle}>Update Password</label>
          <input
            type="password"
            name="newPassword"
            value={userData.newPassword}
            onChange={handleChange}
            placeholder="Enter new password"
            style={inputStyle}
          />
        </div>

        {errorMessage && <p style={errorMessageStyle}>{errorMessage}</p>}
        {successMessage && <p style={successMessageStyle}>{successMessage}</p>}

        <div style={buttonContainerStyle}>
          <button
            style={saveButtonStyle}
            onClick={handleSave}
            onMouseEnter={(e) => (e.target.style.backgroundColor = saveButtonHoverStyle.backgroundColor)}
            onMouseLeave={(e) => (e.target.style.backgroundColor = "#96DED1")}
          >
            Save
          </button>
          <button
            style={cancelButtonStyle}
            onClick={handleCancel}
            onMouseEnter={(e) => (e.target.style.backgroundColor = cancelButtonHoverStyle.backgroundColor)}
            onMouseLeave={(e) => (e.target.style.backgroundColor = "#E30B5C")}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
