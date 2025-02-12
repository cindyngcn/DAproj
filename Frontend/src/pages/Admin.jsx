import React, { useState, useEffect } from "react";
import axios from "axios";
import { TextField, Button, Table, TableHead, TableBody, TableRow, TableCell, Select, MenuItem, TableContainer, Paper } from "@mui/material";
import Divider from "@mui/material/Divider";
import Header1 from "../components/header1";

export default function Admin() {
    const [applications, setApplications] = useState([]);
    const [newApp, setNewApp] = useState({
        App_Acronym: "",
        App_Description: "",
        App_startDate: "",
        App_endDate: "",
        App_RNumber: "",
        App_permit_Create: "",
        App_permit_Open: "",
        App_permit_toDoList: "",
        App_permit_Doing: "",
        App_permit_Done: ""
    });

    const [groups, setGroups] = useState([]);

    const fetchGroups = async () => {
        try {
            const response = await axios.get("http://localhost:8080/groups", { withCredentials: true });
            console.log("Groups fetched:", response.data); // Debugging response
            if (response.data && response.data.groups) {
                setGroups(response.data.groups); // Adjust this based on actual response structure
            }
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
        axios.post("http://localhost:8080/createApplication", newApp, { withCredentials: true })
            .then(response => {
                console.log("Application created:", response.data);
                setApplications((prevApps) => [...prevApps, response.data.newApplication]);
            })
            .catch(error => {
                console.error("Error creating application:", error);
            });
    };

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
                                <TextField
                                    name="App_Acronym"
                                    value={newApp.App_Acronym}
                                    onChange={handleChange}
                                    placeholder="Enter acronym"
                                    fullWidth
                                />
                            </TableCell>
                            <TableCell>
                                <TextField
                                    name="App_Description"
                                    value={newApp.App_Description}
                                    onChange={handleChange}
                                    placeholder="Enter description"
                                    fullWidth
                                />
                            </TableCell>
                            <TableCell>
                                <TextField
                                    name="App_startDate"
                                    type="date"
                                    value={newApp.App_startDate}
                                    onChange={handleChange}
                                    fullWidth
                                />
                            </TableCell>
                            <TableCell>
                                <TextField
                                    name="App_endDate"
                                    type="date"
                                    value={newApp.App_endDate}
                                    onChange={handleChange}
                                    fullWidth
                                />
                            </TableCell>
                            <TableCell>
                                <TextField
                                    name="App_RNumber"
                                    value={newApp.App_RNumber}
                                    onChange={handleChange}
                                    placeholder="Enter R number"
                                    fullWidth
                                />
                            </TableCell>
                            {["App_permit_Create", "App_permit_Open", "App_permit_toDoList", "App_permit_Doing", "App_permit_Done"].map((permit) => (
                                <TableCell key={permit}>
                                    <Select
                                        name={permit}
                                        value={newApp[permit]}
                                        onChange={handleChange}
                                        displayEmpty
                                        fullWidth
                                    >
                                        <MenuItem value="">Select Group</MenuItem>
                                        {groups.length > 0 ? (
                                            groups.map((group, index) => (
                                                <MenuItem key={index} value={group}>{group}</MenuItem>
                                            ))
                                        ) : (
                                            <MenuItem value="">No groups available</MenuItem>
                                        )}
                                    </Select>
                                </TableCell>
                            ))}
                            <TableCell>
                                <Button variant="contained" color="primary" onClick={handleSubmit}>Create</Button>
                            </TableCell>
                        </TableRow>
                            {applications && applications.length > 0 ? (
                                applications.map((app) => (
                                    <TableRow key={app.App_Acronym}>
                                        <TableCell>{app.App_Acronym}</TableCell>
                                        <TableCell>{app.App_Description}</TableCell>
                                        <TableCell>{app.App_startDate}</TableCell>
                                        <TableCell>{app.App_endDate}</TableCell>
                                        <TableCell>{app.App_RNumber}</TableCell>
                                        <TableCell>{app.App_permit_Create}</TableCell>
                                        <TableCell>{app.App_permit_Open}</TableCell>
                                        <TableCell>{app.App_permit_toDoList}</TableCell>
                                        <TableCell>{app.App_permit_Doing}</TableCell>
                                        <TableCell>{app.App_permit_Done}</TableCell>
                                        <TableCell>Update</TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={10}>No applications available</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </div>
        </>
    );
}
