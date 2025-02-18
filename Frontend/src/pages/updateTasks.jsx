import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

export default function UpdateTasks() {
  const { appAcronym, taskId } = useParams(); // Get parameters from URL
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState("");
  const [notesHistory, setNotesHistory] = useState("");
  const [newNote, setNewNote] = useState("");

  useEffect(() => {
    // Fetch task details
    /*const fetchTaskDetails = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/getTask/${appAcronym}`, { withCredentials: true });
        if (response.data.status === "success") {
          setTask(response.data.task);
          setNotesHistory(response.data.task.Task_notes || "");
          setSelectedPlan(response.data.task.Task_plan || "");
        } else {
          console.error("Error fetching task details:", response.data.message);
        }
      } catch (error) {
        console.error("Error fetching task details:", error);
      }
    };*/
    const fetchTaskDetails = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/getTask/${appAcronym}`, { withCredentials: true });
    
        if (response.data.status === "success") {
          const taskIdFromURL = taskId; // Get the task ID from the URL or state
          const selectedTask = response.data.tasks.find(task => task.Task_id === taskIdFromURL);
    
          if (selectedTask) {
            setTask(selectedTask);
            setNotesHistory(selectedTask.Task_notes || "");
            setSelectedPlan(selectedTask.Task_plan || "");
          } else {
            console.error("Task not found in the response.");
          }
        } else {
          console.error("Error fetching task details:", response.data.message);
        }
      } catch (error) {
        console.error("Error fetching task details:", error);
      }
    };    

    // Fetch available plans
    const fetchPlans = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/getPlanColor/${appAcronym}`, { withCredentials: true });
        if (response.data.status === "success") {
          setPlans(response.data.plans);
        } else {
          console.error("Error fetching plans:", response.data.message);
        }
      } catch (error) {
        console.error("Error fetching plans:", error);
      }
    };

    fetchTaskDetails();
    fetchPlans();
  }, [appAcronym, taskId]);

  return (
    <div style={{ width: "600px", margin: "auto", padding: "20px", borderRadius: "8px", background: "#f9f9f9" }}>
      <button 
        style={{ display: "block", marginBottom: "15px", background: "none", border: "none", color: "blue", cursor: "pointer" }}
        onClick={() => navigate(`/tasks/${appAcronym}`)}
      >
        &lt; Back
      </button>

      <h2>Update Task</h2>
      {task && (
        <form style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          {/* Task Name */}
          <label>Task Name:</label>
          <input type="text" value={task.Task_name} readOnly style={{ padding: "8px", borderRadius: "5px", border: "1px solid #ccc" }} />
          
          {/* Task ID */}
          <label>Task ID:</label>
          <input type="text" value={taskId} readOnly style={{ padding: "8px", borderRadius: "5px", border: "1px solid #ccc" }} />
          
          {/* Task Plan */}
          <label>Plan:</label>
          <select value={selectedPlan} onChange={(e) => setSelectedPlan(e.target.value)} style={{ padding: "8px", borderRadius: "5px", border: "1px solid #ccc" }}>
            <option value="">Select a Plan</option>
            {plans.map((plan) => (
              <option key={plan.Plan_MVP_name} value={plan.Plan_MVP_name}>{plan.Plan_MVP_name}</option>
            ))}
          </select>
          
          {/* Task Description */}
          <label>Description:</label>
          <textarea value={task.Task_description} readOnly style={{ padding: "8px", borderRadius: "5px", border: "1px solid #ccc" }}></textarea>
          
          {/* Notes History */}
          <label>Notes History:</label>
          <textarea value={notesHistory} readOnly style={{ minHeight: "100px", resize: "vertical", padding: "8px", borderRadius: "5px", border: "1px solid #ccc" }}></textarea>
          
          {/* New Note Input */}
          <label>Enter Note:</label>
          <textarea placeholder="Enter note" value={newNote} onChange={(e) => setNewNote(e.target.value)} style={{ minHeight: "60px", resize: "vertical", padding: "8px", borderRadius: "5px", border: "1px solid #ccc" }}></textarea>
          
          {/* Buttons */}
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <button style={{ background: "#dc3545", color: "white", padding: "10px 15px", border: "none", borderRadius: "5px", cursor: "pointer" }}>Release Task</button>
            <button style={{ background: "#007bff", color: "white", padding: "10px 15px", border: "none", borderRadius: "5px", cursor: "pointer" }}>Save Changes</button>
          </div>
        </form>
      )}
    </div>
  );
}