import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Header1 from "../components/header1";
import { TextField, Button } from '@mui/material';
import { Link } from "react-router-dom";
import axios from 'axios'; // Import Axios for API requests

export default function Tasks() {
  const { appAcronym } = useParams();
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [planMVPName, setPlanMVPName] = useState(""); // New state for MVP Name
  const [planColor, setPlanColor] = useState(""); // New state for Plan Color
  const [tasks, setTasks] = useState([]); // Store tasks (if you plan to add them later)

  const taskStates = ["OPEN", "TO-DO", "DOING", "DONE", "CLOSED"];

  // Fetch plan color from the backend when the component mounts
  useEffect(() => {
    const fetchPlanColor = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/getPlanColor/${appAcronym}`, { withCredentials: true });
        if (response.data.status === 'success') {
          setPlanColor(response.data.planColor); // Set plan color from the response
        } else {
          console.error('Error fetching plan color:', response.data.message);
        }
      } catch (error) {
        console.error('Error fetching plan color:', error);
      }
    };

    fetchPlanColor();
  }, [appAcronym]); // Runs only when appAcronym changes

  // Handle plan creation
  /*const handleCreatePlan = async () => {
    try {
      const response = await axios.post(
        `http://localhost:8080/createPlan/${appAcronym}`, // Backend API for creating plan
        {
          Plan_MVP_Name: planMVPName,
          Plan_startDate: startDate,
          Plan_endDate: endDate,
          Plan_color: planColor, // This can be either provided or auto-generated
        },
        { withCredentials: true } // Include cookies for authentication
      );
      console.log('Plan created:', response.data);
      alert('Plan created successfully!');
    } catch (error) {
      console.error('Error creating plan:', error);
      alert('Failed to create plan!');
    }
  };*/

  const handleCreatePlan = async () => {
    try {
      const planData = {
        Plan_MVP_Name: planMVPName,
        Plan_startDate: startDate,
        Plan_endDate: endDate,
        Plan_color: planColor,
      };
      console.log("Request Data:", planData); // Log the data being sent
  
      const response = await axios.post(
        `http://localhost:8080/createPlan/${appAcronym}`,
        planData,
        { withCredentials: true }
      );
      console.log('Plan created:', response.data);
      alert('Plan created successfully!');
    } catch (error) {
      console.error('Error creating plan:', error);
      alert('Failed to create plan!');
    }
  };  

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
            name="Plan_MVP_Name"
            label="MVP Name"
            value={planMVPName}
            onChange={(e) => setPlanMVPName(e.target.value)}
            style={{ marginLeft: '10px', marginBottom: '10px' }}
        />

        <TextField
            name="Plan_startDate"
            label="Start Date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            style={{ marginLeft: '10px', marginBottom: '10px' }}
        />

        <TextField
            name="Plan_endDate"
            label="End Date"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            style={{ marginLeft: '10px', marginBottom: '10px' }}
        />

        <Button
            variant="contained"
            color="primary"
            style={{ marginLeft: '10px', marginTop: '10px' }}
            onClick={handleCreatePlan} // Handle plan creation on button click
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
            {/* Render tasks with associated plan color */}
            {tasks.map((task) => (
              <div key={task.id} className="kanban-card" style={{ background: planColor, padding: "10px", marginBottom: "10px" }}>
                {task.title}
              </div>
            ))}
          </div>
        ))}
      </div>
    </>
  );
}
