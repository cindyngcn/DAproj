import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { TextField, Button, Table, TableHead, TableBody, TableRow, TableCell, Switch, Select, MenuItem } from "@mui/material";
import Divider from "@mui/material/Divider";
import Header2 from "../components/Header2";

export default function About() {
    return (
        <div>
            <Header2 />
            <h1>About</h1>
        </div>
    );
}