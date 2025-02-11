import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { TextField, Button, Table, TableHead, TableBody, TableRow, TableCell, Switch, Select, MenuItem } from "@mui/material";
import Divider from "@mui/material/Divider";
import Header1 from "../components/header1";

export default function Admin() {
    /*const [users, setUsers] = useState([]);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [email, setEmail] = useState("");
    const [group, setGroup] = useState("");
    const [enabled, setEnabled] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [groupInput, setGroupInput] = useState("");
    const [groups, setGroups] = useState([]);

    const navigate = useNavigate();

    const fetchUsers = async () => {
        const response = await axios.get("http://localhost:8080/user");
        setUsers(response.data.users);
    };

    const fetchGroups = async () => {
        const response = await axios.get("http://localhost:8080/groups");
        setGroups(response.data.groups);
    };

    useEffect(() => {
        fetchUsers();
        fetchGroups();
    }, []);

    const handleCreateUser = async () => {
        try {
            const response = await axios.post("http://localhost:8080/createUser", {
                username,
                password,
                email,
                group,
                enabled
            });

            if (response.data.status === "success") {
                setSuccessMessage("User created successfully!");
                setUsername("");
                setPassword("");
                setEmail("");
                setGroup("");
                setEnabled(true);
                fetchUsers(); // Refresh the user list

                // Create user-group association
                await axios.post("http://localhost:8080/groups/associate", {
                    username,
                    groupName: group
                });
            }
        } catch (error) {
            setErrorMessage(error.response?.data?.message || "An error occurred during user creation");
        }
    };

    const handleCreateGroup = async () => {
        try {
            const response = await axios.post("http://localhost:8080/groups", {
                groupName: groupInput
            });

            if (response.data.status === "success") {
                setGroupInput("");
                fetchGroups(); // Refresh the group list
            }
        } catch (error) {
            setErrorMessage(error.response?.data?.message || "An error occurred during group creation");
        }
    };*/

    return (
        <div>
            <Header1 />
            <h1>Applications</h1>
        </div>
    );
}