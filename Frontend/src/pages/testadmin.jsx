import React, { useState, useEffect } from "react";
import axios from "axios";
import {
    TextField, Button, Table, TableHead, TableBody, TableRow, TableCell,
    Select, MenuItem, Divider
} from "@mui/material";
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

    useEffect(() => {
        fetchGroups();
        fetchApplications();
    }, []);

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
            console.log("Fetched Applications:", response.data);
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

    const handleChange = (e) => {
        setNewApp({ ...newApp, [e.target.name]: e.target.value });
    };

    const handleSubmit = async () => {
        try {
            const response = await axios.post("http://localhost:8080/createApplication", newApp, { withCredentials: true });
            setApplications([...applications, response.data]);
            setNewApp({
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
        } catch (error) {
            console.error("Error creating application:", error);
        }
    };

    return (
        <>
            <Header1 />
            <h1 style={{ marginLeft: '20px' }}>Applications</h1>
            <div style={{ padding: "20px", overflowX: "auto", overflowY: "auto", height: "auto" }}>
                <Divider />
                {/* Table without internal scrollbars */}
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
                            <TableCell style={{ minWidth: "120px" }}>Action</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        <TableRow>
                            <TableCell>
                                <TextField name="App_Acronym" value={newApp.App_Acronym} onChange={handleChange} placeholder="Enter acronym" fullWidth />
                            </TableCell>
                            <TableCell>
                                <TextField name="App_Description" value={newApp.App_Description} onChange={handleChange} placeholder="Enter description" fullWidth />
                            </TableCell>
                            <TableCell>
                                <TextField name="App_startDate" type="date" value={newApp.App_startDate} onChange={handleChange} fullWidth />
                            </TableCell>
                            <TableCell>
                                <TextField name="App_endDate" type="date" value={newApp.App_endDate} onChange={handleChange} fullWidth />
                            </TableCell>
                            <TableCell>
                                <TextField name="App_RNumber" value={newApp.App_RNumber} onChange={handleChange} placeholder="Enter R number" fullWidth />
                            </TableCell>
                            {["App_permit_Create", "App_permit_Open", "App_permit_toDoList", "App_permit_Doing", "App_permit_Done"].map((permit) => (
                                <TableCell key={permit}>
                                    <Select name={permit} value={newApp[permit]} onChange={handleChange} displayEmpty fullWidth>
                                        <MenuItem value="">Select Group</MenuItem>
                                        {groups.map((group, index) => (
                                            <MenuItem key={index} value={group}>{group}</MenuItem>
                                        ))}
                                    </Select>
                                </TableCell>
                            ))}
                            <TableCell>
                                <Button variant="contained" color="primary" onClick={handleSubmit}>Create</Button>
                            </TableCell>
                        </TableRow>
                        {Array.isArray(applications) && applications.length > 0 ? (
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
                                    <TableCell>
                                        <Button variant="contained" color="primary">Edit</Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={11} align="center">No applications available</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </>
    );
}
