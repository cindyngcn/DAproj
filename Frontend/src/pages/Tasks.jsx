import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import Header1 from "../components/header1";
import { TextField, Button } from '@mui/material';
import { Link } from "react-router-dom";

export default function Tasks() {
  const { appAcronym } = useParams();
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const taskStates = ["OPEN", "TO-DO", "DOING", "DONE", "CLOSED"];

  return (
    <>
      <Header1 />
      <h1 style={{ marginLeft: '20px' }}>Task Board - {appAcronym}</h1>
      
      {/* Create Plan UI */}
      <div style={{ marginLeft: '20px', marginBottom: '20px' }}>
        <strong>Plan:</strong>
        <TextField
            name="Plan_app_Acronym"
            label="Plan Application Acronym"
            value={appAcronym} // Read-only field
            InputProps={{ readOnly: true }}
            style={{ marginLeft: '10px', marginBottom: '10px' }}
        />
        
        <TextField
            name="Plan_startDate"
            label="Start Date"
            type="date"
            InputLabelProps={{ shrink: true }}
            style={{ marginLeft: '10px', marginBottom: '10px' }}
        />

        <TextField
            name="Plan_endDate"
            label="End Date"
            type="date"
            InputLabelProps={{ shrink: true }}
            style={{ marginLeft: '10px', marginBottom: '10px' }}
        />

        <Button
            variant="contained"
            color="primary"
            style={{ marginLeft: '10px', marginTop: '10px' }}
        >
            CREATE
        </Button>
        </div>

      {/* Create Task Button */}
      <Link to={`/createTask/${appAcronym}`}>
        <button>Create Task</button>
      </Link>


      {/* Kanban Board Placeholder */}
      <div className="kanban-board" style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
        {taskStates.map((state) => (
          <div key={state} className="kanban-column" style={{ border: "1px solid black", padding: "10px", minWidth: "200px" }}>
            <h2>{state}</h2>
            {/* Placeholder tasks */}
            <div className="kanban-card" style={{ background: "#ddd", padding: "10px", marginBottom: "10px" }}>
              Sample Task 1
            </div>
            <div className="kanban-card" style={{ background: "#ddd", padding: "10px", marginBottom: "10px" }}>
              Sample Task 2
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
