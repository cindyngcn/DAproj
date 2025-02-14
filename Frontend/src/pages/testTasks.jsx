import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function CreateTasks() {
  const { appAcronym } = useParams(); // Get the app acronym from URL params
  /*const navigate = useNavigate();
  
  const [taskName, setTaskName] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [taskNotes, setTaskNotes] = useState("");
  const [taskPlan, setTaskPlan] = useState("");
  const [plans, setPlans] = useState([]);

  useEffect(() => {
    // Fetch available plans for this application
    const fetchPlans = async () => {
      try {
        const response = await fetch(`http://localhost:8080/getPlansByAcronym/${appAcronym}`);
        const data = await response.json();
        setPlans(data.plans || []);
      } catch (error) {
        console.error("Error fetching plans:", error);
      }
    };
    fetchPlans();
  }, [appAcronym]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newTask = {
      Task_name: taskName,
      Task_description: taskDescription,
      Task_notes: taskNotes,
      Task_plan: taskPlan,
      Task_app_Acronym: appAcronym,
    };

    try {
      const response = await fetch("http://localhost:8080/createTask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTask),
        credentials: "include",
      });
      if (response.ok) {
        alert("Task created successfully!");
        navigate(`/tasks/${appAcronym}`);
      } else {
        alert("Failed to create task");
      }
    } catch (error) {
      console.error("Error creating task:", error);
    }
  };*/

  return (
    <div>
      <h1>Create Task for {appAcronym}</h1>
      <form onSubmit={handleSubmit}>
        <label>Task Name:</label>
        <input type="text" value={taskName} onChange={(e) => setTaskName(e.target.value)} required />
        
        <label>Description:</label>
        <textarea value={taskDescription} onChange={(e) => setTaskDescription(e.target.value)} />
        
        <label>Notes:</label>
        <textarea value={taskNotes} onChange={(e) => setTaskNotes(e.target.value)} />
        
        <label>Plan:</label>
        <select value={taskPlan} onChange={(e) => setTaskPlan(e.target.value)}>
          <option value="">Select Plan</option>
          {plans.map((plan) => (
            <option key={plan.Plan_name} value={plan.Plan_name}>{plan.Plan_name}</option>
          ))}
        </select>
        
        <button type="submit">Create Task</button>
        <button type="button" onClick={() => navigate(`/tasks/${appAcronym}`)}>Cancel</button>
      </form>
    </div>
  );
}
