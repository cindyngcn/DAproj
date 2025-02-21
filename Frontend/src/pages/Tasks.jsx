import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Header1 from "../components/header1";
import { TextField, Button } from '@mui/material';
import { Link } from "react-router-dom";
import axios from 'axios'; // Import Axios for API requests
import { useNavigate } from "react-router-dom"; // Import useNavigate

export default function Tasks() {
  const { appAcronym } = useParams();
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [planMVPName, setPlanMVPName] = useState(""); // New state for MVP Name
  const [planColor, setPlanColor] = useState(""); // New state for Plan Color
  const [tasks, setTasks] = useState([]); // Store tasks
  const [isPL, setIsPL] = useState(false);
  const [isPM, setIsPM] = useState(false);

  const taskStates = ["OPEN", "TODO", "DOING", "DONE", "CLOSED"];

  //Edited here
  /*const [userPermissions, setUserPermissions] = useState({
    Create: false,
    Open: false,
    ToDo: false,
    Doing: false,
    Done: false,
  });*/

  const [userPermissions, setUserPermissions] = useState({});

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

    fetchUserGroups();

    const fetchPM = async () => {
      try {
        // Call the new endpoint that provides the 'isPL' field
        const response = await axios.get("http://localhost:8080/getPM", { withCredentials: true });
    
        if (response.data && response.data.isPM !== undefined) {
          // If the 'isPL' field is returned, update the state accordingly
          setIsPM(response.data.isPM);
        }
      } catch (error) {
        console.error("Error fetching user groups:", error);
      }
    }; 

    fetchPM();

    /*const fetchUserPermissions = async () => {
      try {
        const response = await axios.post(
          "http://localhost:8080/checkPermits",
          { App_Acronym: appAcronym },
          { withCredentials: true }
        );
        if (response.data.status === "success") {
          setUserPermissions({
            canCreate: response.data.permissions.Create || false,
            canOpen: response.data.permissions.Open || false,
            canToDo: response.data.permissions.ToDo || false,
            canDoing: response.data.permissions.Doing || false,
            canDone: response.data.permissions.Done || false,
          });
        } else {
          console.error("Error fetching user permissions:", response.data.message);
        }
      } catch (error) {
        console.error("Error fetching permissions:", error);
      }
    };*/
    const fetchUserPermissions = async () => {
      try {
        const response = await axios.post(
          "http://localhost:8080/checkPermits",
          { App_Acronym: appAcronym },
          { withCredentials: true }
        );
    
        console.log("Permissions Response:", response.data);  // Add this log to inspect the response
        console.log("App Acronym:", appAcronym);  // Check if it's defined correctly
    
        // Update the check for the permissions based on the correct structure
        if (response.data.status === "success" && response.data.userPermissions) {
          setUserPermissions({
            Create: response.data.userPermissions.Create,
            Open: response.data.userPermissions.Open,
            ToDo: response.data.userPermissions.ToDo,
            Doing: response.data.userPermissions.Doing,
            Done: response.data.userPermissions.Done,
          });
        } else {
          console.error("Error fetching user permissions:", response.data.message);
        }
      } catch (error) {
        console.error("Error fetching permissions:", error);
      }
    };
    
    fetchUserPermissions();

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

  const navigate = useNavigate();

  return (
    <>
      <Header1 />
      <h1 style={{ marginLeft: '20px' }}>Task Board - {appAcronym}</h1>

      {/* Create Plan UI */}
      {isPM && <div style={{ marginLeft: '20px', marginBottom: '20px' }}>
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
      </div>}

      {/* Create Task Button */}
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        {console.log("User can create task:", userPermissions.Create)} 
        {userPermissions.Create && (
          <Link to={`/createTask/${appAcronym}`} style={{ textDecoration: 'none' }}>
            <Button variant="contained" style={{ backgroundColor: '#007bff', color: 'white', padding: '10px 20px', fontSize: '16px', borderRadius: '8px', boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)' }}>
              + Create Task
            </Button>
          </Link>)}
        </div>
  
        {/* Kanban Board */}
        <div
          className="kanban-board"
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "20px",
            padding: "20px",
            maxWidth: "90vw",
            margin: "auto",
          }}
        >
          {taskStates.map((state) => (
            <div
              key={state}
              className="kanban-column"
              style={{
                flex: 1,
                minWidth: "220px",
                maxWidth: "300px",
                background: "#f4f4f4",
                borderRadius: "10px",
                padding: "15px",
                boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
              }}
            >
              <h2 style={{ textAlign: "center" }}>{state}</h2>

              {/* Render tasks */}
              {tasks.filter(task => task.Task_state === state).map((task) => {
                const displayPlan = task.Task_plan ? task.Task_plan : "..."; // Show "..." if Task_plan is missing
                const borderColor = task.planColor || "#6e7f7e"; // Use planColor or default gray

                return (
                  <div
                    key={task.Task_id}
                    className="kanban-card"
                    style={{
                      border: `2px solid ${borderColor}`,
                      padding: "12px",
                      marginBottom: "12px",
                      borderRadius: "8px",
                      boxShadow: `0px 0px 10px ${borderColor}`,
                      transition: "transform 0.2s ease-in-out",
                      cursor: "pointer",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      position: "relative",
                    }}
                    onClick={() => navigate(`/updateTask/${task.Task_id}/${appAcronym}`)} 
                    onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.05)"}
                    onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1.0)"}
                  >
                    {/* Task_plan at the top left corner */}
                    <span
                      style={{
                        position: "absolute",
                        top: "5px",
                        left: "10px",
                        fontSize: "12px",
                        fontWeight: "bold",
                        color: "#555",
                      }}
                    >
                      {displayPlan}
                    </span>

                    {/* Task_name bolded and centered */}
                    <span
                      style={{
                        fontWeight: "bold",
                        fontSize: "16px",
                        textAlign: "center",
                        marginTop: "10px",
                      }}
                    >
                      {task.Task_name}
                    </span>

                    {/* Task_id centered below Task_name */}
                    <span
                      style={{
                        fontSize: "14px",
                        color: "#666",
                        textAlign: "center",
                        marginTop: "5px",
                      }}
                    >
                      {task.Task_id}
                    </span>
                  </div>
                );
              })}
            </div>
          ))}
        </div>

    </>
  );
}