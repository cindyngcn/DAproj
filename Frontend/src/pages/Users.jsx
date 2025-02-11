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
  FormGroup,
  FormControlLabel,
  Checkbox,
  ListItemText,
} from "@mui/material";
import Header1 from "../components/header1";

//Username Validation function
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
  // Correct state initialization
  const [isAdmin, setIsAdmin] = useState(false);


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

   // Check if the logged-in user is an admin
   const checkAdminPermission = async () => {
    try {
      const response = await axios.get("http://localhost:8080/currentUser", {
        withCredentials: true,
      });

      if (response.data.isAdmin) {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
        navigate("/admin"); // Redirect to unauthorized page
      }
    } catch (error) {
      console.error("Error verifying admin:", error);
      navigate("/admin"); // Redirect if there's an error verifying admin status
    }
  };

  useEffect(() => {
    checkAdminPermission(); // Check if the user is an admin
    fetchUsers();
    fetchGroups();

    // Set interval to check admin permission every 5 seconds
   const interval = setInterval(checkAdminPermission, 2000);

   return () => clearInterval(interval); // Clean up interval on unmount
  }, []);

  const clearForm = () => {
    setUsername('');
    setEmail('');
    setPassword('');
    setGroup('');
  };

  const handleCreateUser = async () => {
    if (password && !validatePassword(password)) {
      setMessage({ text: "Password must be 8-10 characters long and include a letter, number, and special character.", type: "error" });
      return;
    }
  
    //let selectedGroups = group || []; // The selected groups should come from the state
    let selectedGroups = Array.isArray(group) ? group : [group];
  
    try {
      const response = await axios.post(
        "http://localhost:8080/createUser", // Adjust your backend URL if necessary
        {
          username: username, // Get the username from the form input
          password: password || null,
          email: email,
          enabled: enabled,
          group: selectedGroups, // Array of selected groups
        },
        { withCredentials: true }
      );
  
      if (response.data.status === "success") {
        setMessage({ text: "User created successfully!", type: "success" });
        clearForm(); // Clear the form after successful user creation
        fetchUsers(); // Optionally refresh the users list
      }
    } catch (error) {
      console.error("Error creating user:", error);
      setMessage({
        text: error.response?.data?.message || "An error occurred during user creation",
        type: "error",
      });
    }
  };
  

  const handleUpdateUser = async (user) => {
    if (user.password && !validatePassword(user.password)) {
      setMessage({ text: "Password must be 8-10 characters long and include a letter, number, and special character.", type: "error" });
      return;
    }
  
    let updatedGroups = user.groups || [];
  
    try {
      const response = await axios.put(
        "http://localhost:8080/user/update",
        {
          username: user.username,
          password: user.password || null,
          email: user.email,
          enabled: user.enabled,
          group: updatedGroups,
        },
        { withCredentials: true }
      );
  
      if (response.data.status === "success") {
        setMessage({ text: "User updated successfully!", type: "success" });
        fetchUsers(); // Refresh users list
        checkAdminPermission(); // Re-check admin status after update
      }
    } catch (error) {
      console.error("Error updating user:", error);
      setMessage({
        text: error.response?.data?.message || "An error occurred during user update",
        type: "error",
      });
    }
  };
  
  // Create a new group
  const handleCreateGroup = async () => {
    // Check if the group name is empty
    if (!groupInput) {
      setMessage({ text: "Group name cannot be empty.", type: "error" });
      return;
    }

    if (!validateGroupName(groupInput)) {
      setMessage({ text: "Group name can only contain letters, numbers, and underscores.", type: "error" });
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:8080/groups",
        { groupName: groupInput },
        { withCredentials: true } // Ensure the token is sent
      );

      if (response.data.status === "success") {
        setMessage({ text: "Group created successfully!", type: "success" }); // Set success message
        setGroupInput(""); // Clear the input field after successful group creation
        fetchGroups(); // Refresh groups list
      }
    } catch (error) {
      setMessage({
        text: error.response?.data?.message || "An error occurred during group creation",
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
        <h1 style={{ marginLeft: '20px' }}>Users</h1> {/* Adds margin to the left of "Users" */}
        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center' }}>
          <TextField
            label="Group Name"
            value={groupInput}
            onChange={(e) => setGroupInput(e.target.value)}
            error={groupInput && !validateGroupName(groupInput)} // Show error when invalid
            helperText={groupInput && !validateGroupName(groupInput) ? "Only alphabets, numbers, and underscores allowed." : ""}
          />
          <Button
            variant="contained"
            onClick={handleCreateGroup}
            style={{ marginLeft: '8px' }} // Adds space between the text field and button
          >
            Create Group
          </Button>
        </div>
      </div>

      {/* User Creation & Update Table */}
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
          {/* Row for creating a new user */}
          <TableRow>
            <TableCell>
              <TextField
                label="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                error={username && !validateUsername(username)} // Show error when invalid
                helperText={username && !validateUsername(username) ? "Only alphabets and numbers allowed." : ""}
              />
            </TableCell>
            <TableCell>
              <TextField 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                error={password && !validatePassword(password)} // Show error when invalid
                helperText={password && !validatePassword(password) ? "Password must be 8-10 characters long, including a letter, number, and special character" : ""}
              />
            </TableCell>
            <TableCell>
              <TextField value={email} onChange={(e) => setEmail(e.target.value)} />
            </TableCell>
            <TableCell>
            <Select
              multiple
              value={Array.isArray(group) ? group : []}  // Ensure `group` is an array
              onChange={(e) => setGroup(e.target.value)}  // Update selected groups when changed
              renderValue={(selected) => selected.join(", ")}  // Display the selected groups
            >
              {groups.map((grp, index) => (
                <MenuItem key={index} value={grp}>
                  <Checkbox checked={group.includes(grp)} /> {/* Checkbox for each group */}
                  <ListItemText primary={grp} />
                </MenuItem>
              ))}
            </Select>

            </TableCell>
            <TableCell>
              <Switch checked={enabled} onChange={(e) => setEnabled(e.target.checked)} color="primary" />
              {enabled ? "Enabled" : "Disabled"}
            </TableCell>
            <TableCell>
              <Button variant="contained" sx={{ backgroundColor: '#6699CC' }} onClick={handleCreateUser}>
                Create
              </Button>
            </TableCell>
          </TableRow>

          {/* Rows for updating existing users */}
          {users.length > 0 ? (
            users.map((user, index) => (
              <TableRow key={index}>
                <TableCell>{user.username}</TableCell>
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
                    error={user.password && !validatePassword(user.password)} // Show error when invalid
                    helperText={user.password && !validatePassword(user.password) ? "Password must be 8-10 characters long, including a letter, number, and special character" : ""}
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    value={user.email}
                    onChange={(e) => {
                      const updatedUsers = [...users];
                      updatedUsers[index].email = e.target.value;
                      setUsers(updatedUsers);
                    }}
                  />
                </TableCell>
                <TableCell>
                    <Select
                    multiple
                    value={user.groups || []}
                    onChange={(e) => {
                      const updatedUsers = [...users];
                      let selectedGroups = e.target.value;

                      updatedUsers[index].groups = selectedGroups;
                      setUsers(updatedUsers);
                    }}
                    renderValue={(selected) => selected.join(", ")}
                  >
                    {groups.map((grp, index) => (
                      <MenuItem key={index} value={grp}>
                        <Checkbox checked={user.groups?.includes(grp) || false} />
                        <ListItemText primary={grp} />
                      </MenuItem>
                    ))}
                  </Select>

                </TableCell>
                <TableCell>
                  <Switch
                    checked={user.enabled}
                    onChange={(e) => {
                      const updatedUsers = [...users];
                      updatedUsers[index].enabled = e.target.checked;
                      setUsers(updatedUsers);
                    }}
                    color="primary"
                  />
                  {user.enabled ? "Enabled" : "Disabled"}
                </TableCell>
                <TableCell>
                  <Button variant="contained" sx={{ backgroundColor: '#F9C7D4' }} onClick={() => handleUpdateUser(user)}>
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

      {/* Show error or success messages as Material UI alerts */}
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