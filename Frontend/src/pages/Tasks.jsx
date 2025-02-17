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
  const [tasks, setTasks] = useState([]); // Store tasks

  const taskStates = ["OPEN", "TO-DO", "DOING", "DONE", "CLOSED"];

  /*useEffect(() => {
    const fetchTasksAndColors = async () => {
      try {
        // Fetch tasks for the current appAcronym
        const taskResponse = await axios.get(`http://localhost:8080/getTask/${appAcronym}`, { withCredentials: true });

        if (taskResponse.data.status === 'success') {
          const tasks = taskResponse.data.tasks;

          // For each task, fetch the corresponding plan color if Task_plan exists
          const tasksWithColors = await Promise.all(
            tasks.map(async (task) => {
              if (task.Task_plan) { // Check if Task_plan is defined
                const planResponse = await axios.get(`http://localhost:8080/getPlanColor/${appAcronym}`, { withCredentials: true });
                console.log("Plan Response:", planResponse.data); // Log the full response
                const planColor = planResponse.data.status === 'success' ? planResponse.data.planColor : '#d13434'; // Default to a color if no planColor found
                return { ...task, planColor }; // Add color to the task
              } else {
                return { ...task, planColor: '#d13434' }; // Default color if no Task_plan
              }
            })
          );

          setTasks(tasksWithColors); // Set the tasks with their associated plan colors
        } else {
          console.error('Error fetching tasks:', taskResponse.data.message);
        }
      } catch (error) {
        console.error('Error fetching tasks and plan colors:', error);
      }
    };

    fetchTasksAndColors();
  }, [appAcronym]);*/ 

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

  useEffect(() => {
    const fetchTasksAndColors = async () => {
      try {
        // Fetch tasks for the current appAcronym
        const taskResponse = await axios.get(`http://localhost:8080/getTask/${appAcronym}`, { withCredentials: true });
        
        console.log("Task API Response:", taskResponse.data); // Ensure Task_plan is present
        
        if (taskResponse.data.status === 'success') {
          const tasks = taskResponse.data.tasks;
  
          // For each task, fetch the corresponding plan color if Task_plan exists
          const tasksWithColors = await Promise.all(
            tasks.map(async (task) => {
              if (task.Task_plan) { // Check if Task_plan is defined
                try {
                  // Fetch all plans for the appAcronym
                  const planResponse = await axios.get(`http://localhost:8080/getPlanColor/${appAcronym}`, { withCredentials: true });
                  console.log("Plan Response:", planResponse.data); // Log the full response for debugging
  
                  if (planResponse.data.status === 'success') {
                    // Find the plan color that matches the Task_plan
                    const plan = planResponse.data.plans.find((plan) => plan.Plan_MVP_name === task.Task_plan);
  
                    if (plan) {
                      console.log(`Matched Task: ${task.Task_name}, Plan: ${task.Task_plan}, Color: ${plan.Plan_color}`);
                      return { ...task, planColor: plan.Plan_color }; // Add the plan color to the task
                    } else {
                      console.log(`No matching plan found for Task: ${task.Task_name}, Plan: ${task.Task_plan}`);
                      return { ...task, planColor: '#d13434' }; // Default color
                    }
                  }
                } catch (error) {
                  console.error('Error fetching plan color:', error);
                  return { ...task, planColor: '#d13434' }; // Default color on error
                }
              } else {
                // If no Task_plan, set a default color
                console.log(`No Task_plan for Task: ${task.Task_name}, using default color.`);
                return { ...task, planColor: '#d13434' }; // Default color
              }
            })
          );
  
          setTasks(tasksWithColors); // Set the tasks with their associated plan colors
          console.log("Tasks with colours: ", tasksWithColors); // Log the tasks to check planColor for each task
        } else {
          console.error('Error fetching tasks:', taskResponse.data.message);
        }
      } catch (error) {
        console.error('Error fetching tasks and plan colors:', error);
      }
    };
  
    fetchTasksAndColors();
  }, [appAcronym]);  

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
          label="Plan Name"
          value={planMVPName || ""}
          onChange={(e) => setPlanMVPName(e.target.value)}
          style={{ marginLeft: '10px', marginBottom: '10px' }}
        />

        <TextField
          name="Plan_startDate"
          label="Start Date"
          type="date"
          value={startDate || ""}
          onChange={(e) => setStartDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
          style={{ marginLeft: '10px', marginBottom: '10px' }}
        />

        <TextField
          name="Plan_endDate"
          label="End Date"
          type="date"
          value={endDate || ""}
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
            {/* Render tasks with their individual plan colors */}
            {tasks.filter(task => task.Task_state === state).map((task) => {
              console.log(`Rendering task: ${task.Task_name}, Plan Color: ${task.planColor}`); // Log the task's name and plan color

              // Implicit return for JSX
              return (
                <div
                  key={task.Task_id}
                  className="kanban-card"
                  style={{ background: task.planColor, padding: "10px", marginBottom: "10px" }} // Use task's planColor
                >
                  {task.Task_name}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </>
  );
}
