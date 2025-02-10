import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  TextField,
  Button,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Switch,
  Select,
  MenuItem,
  Alert,
  Stack,
} from "@mui/material";
import Header1 from "../components/header1";

// Username Validation function
const validateUsername = (username) => {
  const usernameRegex = /^[a-zA-Z0-9]+$/; // Only alphabets and numbers
  return usernameRegex.test(username);
};

// Password validation function
const validatePassword = (password) => {
  const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,10}$/;
  return passwordRegex.test(password);
};

// Group Name Validation function
const validateGroupName = (groupName) => {
  const groupNameRegex = /^[a-zA-Z0-9_]+$/; // Allows only alphabets, numbers, and underscore
  return groupNameRegex.test(groupName);
};

const Users = () => {
  const [users, setUsers] = useState([]);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [group, setGroup] = useState("");
  const [enabled, setEnabled] = useState(true);
  const [message, setMessage] = useState({ text: "", type: "" }); // State for message (success or error)
  const [groupInput, setGroupInput] = useState(""); // State for new group input
  const [groups, setGroups] = useState([]);
  const [openAlert, setOpenAlert] = useState(true); // To control alert visibility

  const navigate = useNavigate();

  // Fetch all users (Ensures token is sent)
  const fetchUsers = async () => {
    try {
      const response = await axios.get("http://localhost:8080/user", {
        withCredentials: true, // Ensures token is included
      });

      console.log("Fetched Users:", response.data); // Debugging log
      setUsers(response.data.users); // Set users correctly
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  // Fetch all groups
  const fetchGroups = async () => {
    try {
      const response = await axios.get("http://localhost:8080/groups", {
        withCredentials: true, // Ensures token is included
      });
      setGroups(response.data.groups);
    } catch (error) {
      console.error("Error fetching groups:", error);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchGroups();
  }, []);

  // Update an existing user
  const handleUpdateUser = async (user) => {
    // Validate password if it is provided
    if (user.password && !validatePassword(user.password)) {
      setMessage({
        text: "Password must be 8-10 characters long and include at least one letter, one number, and one special character.",
        type: "error",
      });
      return;
    }

    try {
      const response = await axios.put(
        "http://localhost:8080/user/update",
        {
          username: user.username,
          password: user.password || null, // Update only if provided
          email: user.username === "Admin1" ? null : user.email, // Prevent updating Admin1's email
          enabled: user.username === "Admin1" ? true : user.enabled, // Prevent disabling Admin1
          group: user.username === "Admin1" ? "admin" : user.group, // Prevent changing Admin1's group
        },
        { withCredentials: true }
      );

      if (response.data.status === "success") {
        setMessage({ text: "User updated successfully!", type: "success" }); // Set success message
        fetchUsers(); // Refresh users list
      }
    } catch (error) {
      setMessage({
        text: error.response?.data?.message || "An error occurred during user update",
        type: "error",
      });
    }
  };

  // Close alert handler
  const handleCloseAlert = () => {
    setOpenAlert(false);
  };

  return (
    <div>
      <Header1 />
      <h1 style={{ marginLeft: "20px" }}>Users</h1>

      {/* User Table */}
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Username</TableCell>
            <TableCell>Password</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Group</TableCell>
            <TableCell>Account Status</TableCell>
            <TableCell>Action</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {/* Rows for updating existing users */}
          {users.length > 0 ? (
            users.map((user, index) => (
              <TableRow key={index}>
                <TableCell>{user.username}</TableCell>

                {/* Password field (editable for all users) */}
                <TableCell>
                  <TextField
                    type="password"
                    value={user.password || ""}
                    onChange={(e) => {
                      const updatedUsers = [...users];
                      updatedUsers[index].password = e.target.value;
                      setUsers(updatedUsers);
                    }}
                    placeholder="Enter new password"
                    error={user.password && !validatePassword(user.password)}
                    helperText={
                      user.password && !validatePassword(user.password)
                        ? "Password must be 8-10 characters long, including a letter, number, and special character"
                        : ""
                    }
                  />
                </TableCell>

                {/* Email field (disabled for Admin1) */}
                <TableCell>
                  <TextField
                    value={user.email}
                    disabled={user.username === "Admin1"}
                  />
                </TableCell>

                {/* Group selection (disabled for Admin1) */}
                <TableCell>
                  <Select
                    value={user.group || ""}
                    disabled={user.username === "Admin1"}
                  >
                    {groups.map((grp, index) => (
                      <MenuItem key={index} value={grp}>
                        {grp}
                      </MenuItem>
                    ))}
                  </Select>
                </TableCell>

                {/* Enabled switch (disabled for Admin1) */}
                <TableCell>
                  <Switch
                    checked={user.enabled}
                    disabled={user.username === "Admin1" ? true : user.enabled}
                    color="primary"
                  />
                  {user.enabled ? "Enabled" : "Disabled"}
                </TableCell>

                {/* Update button */}
                <TableCell>
                  <Button
                    variant="contained"
                    sx={{ backgroundColor: "#F9C7D4" }}
                    onClick={() => handleUpdateUser(user)}
                  >
                    Update
                  </Button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan="6">No users found</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Show error or success messages */}
      <Stack sx={{ width: "100%" }} spacing={2}>
        {message.text && openAlert && (
          <Alert severity={message.type} onClose={handleCloseAlert}>
            {message.text}
          </Alert>
        )}
      </Stack>
    </div>
  );
};

export default Users;
