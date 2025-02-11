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

    const handleChange = (e) => {
        setNewApp({ ...newApp, [e.target.name]: e.target.value });
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
                                            <MenuItem value="admin">Admin</MenuItem>
                                            <MenuItem value="grp1">Group 1</MenuItem>
                                            <MenuItem value="grp2">Group 2</MenuItem>
                                        </Select>
                                    </TableCell>
                                ))}
                                <TableCell>
                                    <Button variant="contained" color="primary">Create</Button>
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
                                        <TextField name="app_rNumber" defaultValue={app.app_rNumber} fullWidth />
                                    </TableCell>
                                    {["App_permit_Create", "App_permit_Open", "App_permit_toDoList", "App_permit_Doing", "App_permit_Done"].map((permit) => (
                                        <TableCell key={permit}>
                                            <Select name={permit} defaultValue={app[permit]} fullWidth>
                                                <MenuItem value="">Select Group</MenuItem>
                                                <MenuItem value="admin">Admin</MenuItem>
                                                <MenuItem value="grp1">Group 1</MenuItem>
                                                <MenuItem value="grp2">Group 2</MenuItem>
                                            </Select>
                                        </TableCell>
                                    ))}
                                    <TableCell>
                                        <Button variant="contained" color="secondary">Update</Button>
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
