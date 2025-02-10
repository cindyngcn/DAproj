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
      .catch(() => {
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

  const validatePassword = (password) => {
    const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,10}$/;
    return passwordRegex.test(password);
  };

  const handleSave = () => {
    if (userData.newPassword && !validatePassword(userData.newPassword)) {
      setErrorMessage("Password must be 8-10 characters and include at least one letter, one number, and one special character.");
      setSuccessMessage("");
      return;
    }

    const data = {};
    if (userData.newEmail) data.email = userData.newEmail;
    if (userData.newPassword) data.password = userData.newPassword;

    axios
      .put("http://localhost:8080/profile", data, { withCredentials: true })
      .then(() => {
        setSuccessMessage("Profile updated successfully.");
        setErrorMessage("");
      })
      .catch(() => {
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

  return (
    <div style={styles.profileContainer}>
      <Header1 style={styles.header} />
      <div style={styles.profileCard}>
        <h1 style={styles.profileHeading}><strong>My Profile</strong></h1>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Username</label>
          <input type="text" value={userData.username} readOnly style={{ ...styles.input, ...styles.readonlyInput }} />
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Email</label>
          <input type="text" value={userData.email} readOnly style={{ ...styles.input, ...styles.readonlyInput }} />
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Update Email</label>
          <input type="email" name="newEmail" value={userData.newEmail} onChange={handleChange} placeholder="Enter new email" style={styles.input} />
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Update Password</label>
          <input type="password" name="newPassword" value={userData.newPassword} onChange={handleChange} placeholder="Enter new password" style={styles.input} />
        </div>

        {/* Display Error or Success Message */}
        {errorMessage && <p style={styles.errorMessage}>{errorMessage}</p>}
        {successMessage && <p style={styles.successMessage}>{successMessage}</p>}

        <div style={styles.buttonContainer}>
          <button style={styles.saveButton} onClick={handleSave} onMouseEnter={(e) => (e.target.style.backgroundColor = styles.saveButtonHover.backgroundColor)} onMouseLeave={(e) => (e.target.style.backgroundColor = "#4caf50")}>Save</button>
          <button style={styles.cancelButton} onClick={handleCancel} onMouseEnter={(e) => (e.target.style.backgroundColor = styles.cancelButtonHover.backgroundColor)} onMouseLeave={(e) => (e.target.style.backgroundColor = "#f44336")}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

// Styles
const styles = {
  profileContainer: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    backgroundColor: "#f4f7fc",
  },
  header: {
    width: "100%",
    backgroundColor: "#fff",
    padding: "10px 0",
    textAlign: "center",
  },
  profileCard: {
    backgroundColor: "white",
    padding: "30px",
    borderRadius: "8px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
    width: "100%",
    maxWidth: "400px",
    textAlign: "center",
  },
  profileHeading: {
    textAlign: "center",
    fontSize: "24px",
    marginBottom: "20px",
  },
  inputGroup: {
    marginBottom: "15px",
  },
  label: {
    display: "block",
    fontWeight: "600",
    marginBottom: "5px",
  },
  input: {
    width: "100%",
    padding: "10px",
    border: "1px solid #ddd",
    borderRadius: "5px",
    fontSize: "14px",
    backgroundColor: "#f9f9f9",
  },
  readonlyInput: {
    backgroundColor: "#e9ecef",
    cursor: "not-allowed",
  },
  errorMessage: {
    color: "red",
    fontSize: "14px",
    textAlign: "center",
    marginTop: "10px",
  },
  successMessage: {
    color: "green",
    fontSize: "14px",
    textAlign: "center",
    marginTop: "10px",
  },
  buttonContainer: {
    display: "flex",
    justifyContent: "center",
    gap: "10px",
    marginTop: "20px",
  },
  saveButton: {
    padding: "10px 20px",
    fontSize: "14px",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    backgroundColor: "#4caf50",
    color: "white",
    transition: "background-color 0.3s ease",
  },
  cancelButton: {
    padding: "10px 20px",
    fontSize: "14px",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    backgroundColor: "#f44336",
    color: "white",
    transition: "background-color 0.3s ease",
  },
  saveButtonHover: {
    backgroundColor: "#45a049",
  },
  cancelButtonHover: {
    backgroundColor: "#e53935",
  },
};

export default ProfilePage;
