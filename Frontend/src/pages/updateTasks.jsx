import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Header1 from "../components/header1";
import { TextField, Button, MenuItem, Select, InputLabel, FormControl } from '@mui/material';
import axios from 'axios';

export default function UpdateTask() {
  const { appAcronym } = useParams(); // Extract appAcronym from URL params
  const [taskDetails, setTaskDetails] = useState(null);
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState("");
  const [planColor, setPlanColor] = useState("");

  console.log('App Acronym:', appAcronym); // Logging appAcronym

  // Fetch task details using App_Acronym
  useEffect(() => {
    const fetchTaskDetails = async () => {
      try {
        const taskResponse = await axios.get(`http://localhost:8080/getTask/${appAcronym}`, { withCredentials: true });
        console.log('Task Response:', taskResponse.data); // Log the task response
        if (taskResponse.data.status === 'success') {
          const task = taskResponse.data.tasks.find(t => t.Task_id === appAcronym); // Find task based on Task_id
          console.log('Fetched Task:', task); // Log the fetched task
          setTaskDetails(task);
          setSelectedPlan(task.Task_plan || ""); // Set the initial plan value, handle null
        } else {
          console.error('Error fetching task details:', taskResponse.data.message);
        }
      } catch (error) {
        console.error('Error fetching task details:', error);
      }
    };

    const fetchPlans = async () => {
      try {
        // Fetch plans for the application using App_Acronym
        const planResponse = await axios.get(`http://localhost:8080/getPlans/${appAcronym}`, { withCredentials: true });
        console.log('Plans Response:', planResponse.data); // Log the plans response
        if (planResponse.data.status === 'success') {
          setPlans(planResponse.data.plans);
        } else {
          console.error('Error fetching plans:', planResponse.data.message);
        }
      } catch (error) {
        console.error('Error fetching plans:', error);
      }
    };

    fetchTaskDetails();
    fetchPlans();
  }, [appAcronym]); // Fetch data when appAcronym changes

  const handlePlanChange = (event) => {
    setSelectedPlan(event.target.value);
  };

  // Fetch color for the selected plan
  useEffect(() => {
    const fetchPlanColor = async () => {
      try {
        // Fetch the plan color based on the selected plan and appAcronym
        const planResponse = await axios.get(`http://localhost:8080/getPlanColor/${appAcronym}/${selectedPlan}`, { withCredentials: true });
        console.log('Plan Color Response:', planResponse.data); // Log the color response
        if (planResponse.data.status === 'success') {
          const plan = planResponse.data.plan;
          setPlanColor(plan.Plan_color);
        } else {
          setPlanColor('#d13434'); // Default color if no color found
        }
      } catch (error) {
        console.error('Error fetching plan color:', error);
        setPlanColor('#d13434'); // Default color
      }
    };

    if (selectedPlan) {
      fetchPlanColor();
    }
  }, [selectedPlan, appAcronym]);

  if (!taskDetails) {
    return <div>Loading...</div>; // Loading state while fetching
  }

  return (
    <>
      <Header1 />
      <h1 style={{ marginLeft: '20px' }}>Update Task - {taskDetails.Task_name}</h1>

      {/* Task Details Form */}
      <div style={{ marginLeft: '20px', marginBottom: '20px' }}>
        <TextField
          name="Task_name"
          label="Task Name"
          value={taskDetails.Task_name}
          InputProps={{ readOnly: true }}
          style={{ marginLeft: '10px', marginBottom: '10px' }}
        />
        <TextField
          name="Task_id"
          label="Task ID"
          value={taskDetails.Task_id}
          InputProps={{ readOnly: true }}
          style={{ marginLeft: '10px', marginBottom: '10px' }}
        />

        <FormControl style={{ marginLeft: '10px', marginBottom: '10px' }}>
          <InputLabel>Task Plan</InputLabel>
          <Select
            value={selectedPlan}
            onChange={handlePlanChange}
            label="Task Plan"
          >
            {plans.map((plan) => (
              <MenuItem key={plan.Plan_MVP_name} value={plan.Plan_MVP_name}>
                {plan.Plan_MVP_name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Plan Color Display */}
        <div style={{ marginTop: '10px' }}>
          <span style={{ fontWeight: 'bold', marginRight: '10px' }}>Plan Color:</span>
          <span style={{ backgroundColor: planColor, padding: '5px 10px', borderRadius: '5px', color: 'white' }}>
            {planColor}
          </span>
        </div>
      </div>
    </>
  );
}
