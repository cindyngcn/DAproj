import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  TextField,
  Button,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Select,
  MenuItem,
  TableContainer,
  Paper,
  Alert,
  Divider,
} from "@mui/material";
import Header1 from "../components/header1";
import { Link } from "react-router-dom";

export default function Admin() {
  const [applications, setApplications] = useState([]);
  const [newApp, setNewApp] = useState({}); // For creating new apps
  const [updatedApps, setUpdatedApps] = useState({}); // For updating individual apps
  const [groups, setGroups] = useState([]);
  //const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  //const [errorMessage, setErrorMessage] = useState("");
  const [userGroups, setUserGroups] = useState([]);
  const [isPL, setIsPL] = useState(false);

  const [showCreateSuccess, setShowCreateSuccess] = useState(false);
  const [showUpdateSuccess, setShowUpdateSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const fetchGroups = async () => {
    try {
      const response = await axios.get("http://localhost:8080/groups", { withCredentials: true });
      if (response.data && response.data.groups) {
        setGroups(response.data.groups);
      }
    } catch (error) {
      console.error("Error fetching groups:", error);
    }
  };

  const fetchApplications = async () => {
    try {
      const response = await axios.get("http://localhost:8080/getApplication", { withCredentials: true });
      if (response.data && Array.isArray(response.data.data)) {
        setApplications(response.data.data);
      } else {
        setApplications([]);
      }
    } catch (error) {
      console.error("Error fetching applications:", error);
      setApplications([]);
    }
  };

  /*const fetchUserGroups = async () => {
    try {
      const response = await axios.get("http://localhost:8080/user", { withCredentials: true });
      if (response.data && response.data.groups) {
        setUserGroups(response.data.groups);
        setIsPL(response.data.groups.includes("PL"));
      }
    } catch (error) {
      console.error("Error fetching user groups:", error);
    }
  };*/

  const fetchUserGroups = async () => {
    try {
      // Call the new endpoint that provides the 'isPL' field
      const response = await axios.get("http://localhost:8080/getPL", { withCredentials: true });
  
      if (response.data && response.data.isPL !== undefined) {
        // If the 'isPL' field is returned, update the state accordingly
        setIsPL(response.data.isPL);
      }
    } catch (error) {
      console.error("Error fetching user groups:", error);
    }
  };  

  useEffect(() => {
    fetchGroups();
    fetchApplications();
    fetchUserGroups();
    console.log("User is in PL group: ", isPL);
  }, []);

  const handleNewAppChange = (e) => {
    const { name, value } = e.target;
    setNewApp((prevApp) => ({
      ...prevApp,
      [name]: value,
    }));
  };

  const handleUpdateChange = (e, app) => {
    const { name, value } = e.target;
    setUpdatedApps((prev) => ({
      ...prev,
      [app.App_Acronym]: {
        ...prev[app.App_Acronym],
        [name]: value,
      },
    }));
  };

  const handleCreateSubmit = () => {
    axios.post("http://localhost:8080/createApplication", newApp, { withCredentials: true })
      .then((response) => {
        if (response.data.status === "success") {
          setApplications([newApp, ...applications]); // Add new app to the table
          setNewApp({});
          setShowCreateSuccess(true);
          setTimeout(() => setShowCreateSuccess(false), 2000);
        } else {
          setErrorMessage("Error creating application.");
          setShowError(true);
          setTimeout(() => setShowError(false), 2000);
        }
      })
      .catch((error) => {
        setErrorMessage("Error creating application.");
        setShowError(true);
        setTimeout(() => setShowError(false), 2000);
      });
  };
  
  const handleUpdateSubmit = (app) => {
    const updatedApp = updatedApps[app.App_Acronym] || {};
    const fieldsToUpdate = {};
  
    for (let key in updatedApp) {
      if (updatedApp[key] !== app[key] && key !== 'App_Acronym') { // Exclude App_Acronym from updates
        fieldsToUpdate[key] = updatedApp[key];
      }
    }
  
    if (Object.keys(fieldsToUpdate).length > 0) {
      const applicationData = { ...fieldsToUpdate };
  
      axios.put(`http://localhost:8080/updateApplication/${app.App_Acronym}`, applicationData, { withCredentials: true })
        .then((response) => {
          if (response.data.status === "success") {
            setApplications((prevApps) =>
              prevApps.map((item) =>
                item.App_Acronym === app.App_Acronym ? { ...item, ...fieldsToUpdate } : item
              )
            );
            setUpdatedApps((prev) => {
              const { [app.App_Acronym]: removed, ...rest } = prev;
              return rest;
            });
            setShowUpdateSuccess(true);
            setTimeout(() => setShowUpdateSuccess(false), 2000);
          } else {
            setErrorMessage("Error updating application.");
            setShowError(true);
            setTimeout(() => setShowError(false), 2000);
          }
        })
        .catch((error) => {
          console.error("Error:", error.response?.data || error);
          setErrorMessage("Error updating application.");
          setShowError(true);
          setTimeout(() => setShowError(false), 2000);
        });
    }
  };

  const handleEditClick = (app) => {
    setUpdatedApps((prev) => ({
      ...prev,
      [app.App_Acronym]: {
        ...app,
      },
    }));
  };

  return (
    <>
      <Header1 />
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <h1 style={{ marginLeft: '20px' }}>Applications</h1>
        {showCreateSuccess && (
          <Alert severity="success" style={{ marginLeft: '20px', width: 'auto' }}>
            Application created successfully!
          </Alert>
        )}

        {showUpdateSuccess && (
          <Alert severity="success" style={{ marginLeft: '20px', width: 'auto' }}>
            Application updated successfully!
          </Alert>
        )}

        {showError && (
          <Alert severity="error" style={{ marginLeft: '20px', width: 'auto' }}>
            {errorMessage}
          </Alert>
        )}
      </div>
      <div style={{ padding: "20px", overflowX: "auto", overflowY: "auto", height: "auto" }}>
        <Divider />
        <TableContainer component={Paper} style={{ marginTop: "20px" }}>
          <Table sx={{ width: "100%", tableLayout: "fixed", wordWrap: "break-word" }}>
            <TableHead>
              <TableRow>
                <TableCell style={{ minWidth: "100px" }}>Acronym</TableCell>
                <TableCell style={{ minWidth: "150px" }}>Description</TableCell>
                <TableCell style={{ minWidth: "120px" }}>Start Date</TableCell>
                <TableCell style={{ minWidth: "120px" }}>End Date</TableCell>
                <TableCell style={{ minWidth: "100px" }}>R.Num</TableCell>
                <TableCell style={{ minWidth: "150px" }}>Permit Create</TableCell>
                <TableCell style={{ minWidth: "150px" }}>Permit Open</TableCell>
                <TableCell style={{ minWidth: "150px" }}>Permit To-Do</TableCell>
                <TableCell style={{ minWidth: "150px" }}>Permit Doing</TableCell>
                <TableCell style={{ minWidth: "150px" }}>Permit Done</TableCell>
                {/* edited here*/}
                {isPL &&<TableCell style={{ minWidth: "120px" }}>Action</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>
                  <TextField
                    name="App_Acronym"
                    value={newApp.App_Acronym || ""}
                    onChange={handleNewAppChange}
                    label="Acronym"
                    fullWidth
                  />
                </TableCell>
                <TableCell>
                  <textarea
                    name="App_Description"
                    value={newApp.App_Description || ""}
                    onChange={handleNewAppChange}
                    label="Description"
                    fullWidth
                    multiline // Allow multiline input
                    rows={5}  // Optional: Set the number of visible rows
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    name="App_startDate"
                    type="date"
                    value={newApp.App_startDate || ""}
                    onChange={handleNewAppChange}
                    fullWidth
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    name="App_endDate"
                    type="date"
                    value={newApp.App_endDate || ""}
                    onChange={handleNewAppChange}
                    fullWidth
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    name="App_RNumber"
                    value={newApp.App_RNumber || ""}
                    onChange={handleNewAppChange}
                    label="R.Number"
                    fullWidth
                  />
                </TableCell>
                <TableCell>
                  <Select
                    name="App_permit_Create"
                    value={newApp.App_permit_Create || ""}
                    onChange={handleNewAppChange}
                    fullWidth
                  >
                    <MenuItem value="">Select Group</MenuItem>
                    {groups.map((group, index) => (
                      <MenuItem key={index} value={group}>{group}</MenuItem>
                    ))}
                  </Select>
                </TableCell>
                <TableCell>
                  <Select
                    name="App_permit_Open"
                    value={newApp.App_permit_Open || ""}
                    onChange={handleNewAppChange}
                    fullWidth
                  >
                    <MenuItem value="">Select Group</MenuItem>
                    {groups.map((group, index) => (
                      <MenuItem key={index} value={group}>{group}</MenuItem>
                    ))}
                  </Select>
                </TableCell>
                <TableCell>
                  <Select
                    name="App_permit_toDoList"
                    value={newApp.App_permit_toDoList || ""}
                    onChange={handleNewAppChange}
                    fullWidth
                  >
                    <MenuItem value="">Select Group</MenuItem>
                    {groups.map((group, index) => (
                      <MenuItem key={index} value={group}>{group}</MenuItem>
                    ))}
                  </Select>
                </TableCell>
                <TableCell>
                  <Select
                    name="App_permit_Doing"
                    value={newApp.App_permit_Doing || ""}
                    onChange={handleNewAppChange}
                    fullWidth
                  >
                    <MenuItem value="">Select Group</MenuItem>
                    {groups.map((group, index) => (
                      <MenuItem key={index} value={group}>{group}</MenuItem>
                    ))}
                  </Select>
                </TableCell>
                <TableCell>
                  <Select
                    name="App_permit_Done"
                    value={newApp.App_permit_Done || ""}
                    onChange={handleNewAppChange}
                    fullWidth
                  >
                    <MenuItem value="">Select Group</MenuItem>
                    {groups.map((group, index) => (
                      <MenuItem key={index} value={group}>{group}</MenuItem>
                    ))}
                  </Select>
                </TableCell>
                {isPL &&<TableCell>
                  <Button variant="contained" color="primary" onClick={handleCreateSubmit}>
                    Create
                  </Button>
                </TableCell>}
              </TableRow>
              {applications.map((app) => (
                <TableRow key={app.App_Acronym}>
                  <TableCell>
                    <Link to={`/tasks/${app.App_Acronym}`} style={{ textDecoration: "none", color: "blue" }}>
                      {app.App_Acronym}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <textarea
                      name="App_Description"
                      value={updatedApps[app.App_Acronym]?.App_Description || app.App_Description || ""}
                      onChange={(e) => handleUpdateChange(e, app)}
                      placeholder="Enter description"
                      fullWidth
                      multiline // Allow multiline input
                      rows={5}  // Optional: Set the number of visible rows
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      name="App_startDate"
                      type="date"
                      value={updatedApps[app.App_Acronym]?.App_startDate || (app.App_startDate ? app.App_startDate.slice(0, 10) : "")} // Format to 'YYYY-MM-DD'
                      onChange={(e) => handleUpdateChange(e, app)}
                      fullWidth
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      name="App_endDate"
                      type="date"
                      value={updatedApps[app.App_Acronym]?.App_endDate || (app.App_endDate ? app.App_endDate.slice(0, 10) : "")} // Format to 'YYYY-MM-DD'
                      onChange={(e) => handleUpdateChange(e, app)}
                      fullWidth
                    />
                  </TableCell>
                  <TableCell>{app.App_RNumber}</TableCell>
                  {["App_permit_Create", "App_permit_Open", "App_permit_toDoList", "App_permit_Doing", "App_permit_Done"].map((permit) => (
                    <TableCell key={permit}>
                      <Select
                        name={permit}
                        value={updatedApps[app.App_Acronym]?.[permit] || app[permit] || ""}
                        onChange={(e) => handleUpdateChange(e, app)}
                        fullWidth
                      >
                        <MenuItem value="">Select Group</MenuItem>
                        {groups.map((group, index) => (
                          <MenuItem key={index} value={group}>{group}</MenuItem>
                        ))}
                      </Select>
                    </TableCell>
                  ))}
                  {isPL &&<TableCell>
                    <Button variant="contained" color="primary" onClick={() => handleUpdateSubmit(app)}>
                      Update
                    </Button>
                  </TableCell>}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </div>
    </>
  );
}