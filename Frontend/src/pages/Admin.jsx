import React, { useState, useEffect } from "react";
import axios from "axios";
import { TextField, Button, Table, TableHead, TableBody, TableRow, TableCell, Select, MenuItem, TableContainer, Paper } from "@mui/material";
import Divider from "@mui/material/Divider";
import Header1 from "../components/header1";

export default function Admin() {
    const [applications, setApplications] = useState([]);
    const [newApp, setNewApp] = useState({
        app_acronym: "",
        app_description: "",
        app_startDate: "",
        app_endDate: "",
        app_rNumber: "",
        App_permit_Create: "",
        App_permit_Open: "",
        App_permit_toDoList: "",
        App_permit_Doing: "",
        App_permit_Done: ""
    });

    const [groups, setGroups] = useState([]);

    // Fetch groups from the backend
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
        fetchGroups();
    }, []);

    const handleChange = (e) => {
        setNewApp({ ...newApp, [e.target.name]: e.target.value });
    };

    const handleSubmit = () => {
        // Submit the form to create a new application
        axios.post("http://localhost:8080/createApplication", newApp, { withCredentials: true })
            .then(response => {
                console.log("Application created:", response.data);
                // Optionally, refresh the application list
            })
            .catch(error => {
                console.error("Error creating application:", error);
            });
    };

    /*const handleUpdate = (app_acronym, app_rNumber) => {
        // Send the updated application data to the backend
        axios.put("/api/update-application", {
            app_acronym,
            app_rNumber,
            app_description: newApp.app_description,
            app_startDate: newApp.app_startDate,
            app_endDate: newApp.app_endDate,
            permissions: {
                App_permit_Create: newApp.App_permit_Create,
                App_permit_Open: newApp.App_permit_Open,
                App_permit_toDoList: newApp.App_permit_toDoList,
                App_permit_Doing: newApp.App_permit_Doing,
                App_permit_Done: newApp.App_permit_Done
            }
        })
        .then(response => {
            console.log("Application updated:", response.data);
        })
        .catch(error => {
            console.error("Error updating application:", error);
        });
    };*/

    return (
        <>
            <Header1 />
            <h1 style={{ marginLeft: '20px' }}>Applications</h1>
            <div style={{ padding: "20px" }}>
                <Divider />
                <TableContainer component={Paper} sx={{ maxHeight: "80vh", overflow: "auto" }}>
                    <Table sx={{ minWidth: 1200 }} stickyHeader>
                        <TableHead>
                            <TableRow>
                                <TableCell>Acronym</TableCell>
                                <TableCell>Description</TableCell>
                                <TableCell>Start Date</TableCell>
                                <TableCell>End Date</TableCell>
                                <TableCell>R.Num</TableCell>
                                <TableCell>Permit Create</TableCell>
                                <TableCell>Permit Open</TableCell>
                                <TableCell>Permit To-Do</TableCell>
                                <TableCell>Permit Doing</TableCell>
                                <TableCell>Permit Done</TableCell>
                                <TableCell>Action</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            <TableRow>
                                <TableCell>
                                    <TextField name="app_acronym" value={newApp.app_acronym} onChange={handleChange} placeholder="Enter acronym" fullWidth />
                                </TableCell>
                                <TableCell>
                                    <TextField name="app_description" value={newApp.app_description} onChange={handleChange} placeholder="Enter description" fullWidth />
                                </TableCell>
                                <TableCell>
                                    <TextField name="app_startDate" type="date" value={newApp.app_startDate} onChange={handleChange} fullWidth />
                                </TableCell>
                                <TableCell>
                                    <TextField name="app_endDate" type="date" value={newApp.app_endDate} onChange={handleChange} fullWidth />
                                </TableCell>
                                <TableCell>
                                    <TextField name="app_rNumber" value={newApp.app_rNumber} onChange={handleChange} placeholder="Enter R number" fullWidth />
                                </TableCell>
                                {["App_permit_Create", "App_permit_Open", "App_permit_toDoList", "App_permit_Doing", "App_permit_Done"].map((permit) => (
                                    <TableCell key={permit}>
                                        <Select name={permit} value={newApp[permit]} onChange={handleChange} displayEmpty fullWidth>
                                            <MenuItem value="">Select Group</MenuItem>
                                            {groups.map(group => (
                                                <MenuItem key={group.user_group_groupName} value={group.user_group_groupName}>
                                                    {group.user_group_groupName}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </TableCell>
                                ))}
                                <TableCell>
                                    <Button variant="contained" color="primary" onClick={handleSubmit}>Create</Button>
                                </TableCell>
                            </TableRow>
                            {applications.map((app) => (
                                <TableRow key={app.app_acronym}>
                                    <TableCell>{app.app_acronym}</TableCell>
                                    <TableCell>
                                        <TextField name="app_description" defaultValue={app.app_description} fullWidth />
                                    </TableCell>
                                    <TableCell>
                                        <TextField name="app_startDate" type="date" defaultValue={app.app_startDate} fullWidth />
                                    </TableCell>
                                    <TableCell>
                                        <TextField name="app_endDate" type="date" defaultValue={app.app_endDate} fullWidth />
                                    </TableCell>
                                    <TableCell>
                                        <TextField name="app_rNumber" defaultValue={app.app_rNumber} fullWidth disabled />
                                    </TableCell>
                                    {["App_permit_Create", "App_permit_Open", "App_permit_toDoList", "App_permit_Doing", "App_permit_Done"].map((permit) => (
                                        <TableCell key={permit}>
                                            <Select name={permit} defaultValue={app[permit]} fullWidth>
                                                <MenuItem value="">Select Group</MenuItem>
                                                {groups.map(group => (
                                                    <MenuItem key={group.user_group_groupName} value={group.user_group_groupName}>
                                                        {group.user_group_groupName}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </TableCell>
                                    ))}
                                    <TableCell>
                                        <Button variant="contained" color="secondary" onClick={() => handleUpdate(app.app_acronym, app.app_rNumber)}>Update</Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </div>
        </>
    );
}
