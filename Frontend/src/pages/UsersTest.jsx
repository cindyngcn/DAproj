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

const Users = () => {
  const [users, setUsers] = useState([]);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [group, setGroup] = useState("");
  const [enabled, setEnabled] = useState(true);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [groupInput, setGroupInput] = useState("");
  const [groups, setGroups] = useState([]);
  const [openAlert, setOpenAlert] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false); // To check if the user is an admin

  const navigate = useNavigate();

  // Fetch all users
  const fetchUsers = async () => {
    try {
      const response = await axios.get("http://localhost:8080/user", {
        withCredentials: true,
      });

      console.log("Fetched Users:", response.data);
      setUsers(response.data.users);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  // Fetch all groups
  const fetchGroups = async () => {
    try {
      const response = await axios.get("http://localhost:8080/groups", {
        withCredentials: true,
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
  }, []);

  // Create a new user
  const handleCreateUser = async () => {
    // Validate username
    if (!validateUsername(username)) {
      setMessage({ text: "Username can only contain letters and numbers.", type: "error" });
      return;
    }

    // Validate password
    if (password && !validatePassword(password)) {
      setMessage({ text: "Password must be 8-10 characters long and include at least one letter, one number, and one special character.", type: "error" });
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:8080/createUser",
        { username, password, email, group, enabled },
        { withCredentials: true }
      );

      if (response.data.status === "success") {
        setMessage({ text: "User created successfully!", type: "success" });
        setUsername("");
        setPassword("");
        setEmail("");
        setGroup("");
        setEnabled(true);
        fetchUsers();
      }
    } catch (error) {
      setMessage({ text: error.response?.data?.message || "An error occurred during user creation", type: "error" });
    }
  };

  // Update an existing user
  const handleUpdateUser = async (user) => {
    if (user.password && !validatePassword(user.password)) {
      setMessage({ text: "Password must be 8-10 characters long and include at least one letter, one number, and one special character.", type: "error" });
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
        fetchUsers();
      }
    } catch (error) {
      console.error("Error updating user:", error);
      setMessage({ text: error.response?.data?.message || "An error occurred during user update", type: "error" });
    }
  };

  const validateUsername = (username) => /^[a-zA-Z0-9]+$/.test(username);
  const validatePassword = (password) => /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,10}$/.test(password);
  const validateGroupName = (groupName) => /^[a-zA-Z0-9_]+$/.test(groupName);

  return (
    <div>
      <Header1 />
      {isAdmin && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
            <h1 style={{ marginLeft: '20px' }}>Users</h1>
            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center' }}>
              <TextField
                label="Group Name"
                value={groupInput}
                onChange={(e) => setGroupInput(e.target.value)}
                error={groupInput && !validateGroupName(groupInput)}
                helperText={groupInput && !validateGroupName(groupInput) ? "Only alphabets, numbers, and underscores allowed." : ""}
              />
              <Button
                variant="contained"
                onClick={handleCreateGroup}
                style={{ marginLeft: '8px' }}
              >
                Create Group
              </Button>
            </div>
          </div>

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
              <TableRow>
                <TableCell>
                  <TextField
                    label="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    error={username && !validateUsername(username)}
                    helperText={username && !validateUsername(username) ? "Only alphabets and numbers allowed." : ""}
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    error={password && !validatePassword(password)}
                    helperText={password && !validatePassword(password) ? "Password must be 8-10 characters long" : ""}
                  />
                </TableCell>
                <TableCell>
                  <TextField value={email} onChange={(e) => setEmail(e.target.value)} />
                </TableCell>
                <TableCell>
                  <Select value={group} onChange={(e) => setGroup(e.target.value)}>
                    {groups.map((grp, index) => (
                      <MenuItem key={index} value={grp}>
                        {grp}
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
                          updatedUsers[index].groups = e.target.value;
                          setUsers(updatedUsers);
                        }}
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

          <Stack sx={{ width: "100%" }} spacing={2}>
            {message.text && openAlert && (
              <Alert severity={message.type} onClose={handleCloseAlert}>
                {message.text}
              </Alert>
            )}
          </Stack>
        </div>
      )}
    </div>
  );
};

export default Users;
