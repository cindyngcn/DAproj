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
    <div style={{
      width: "100%", 
      height: "100vh", 
      margin: "0", 
      padding: "20px", 
      background: "#f9f9f9", 
      display: "flex", 
      justifyContent: "center", 
      alignItems: "center"
    }}>
      <div style={{
        width: "80%", 
        maxWidth: "1200px", 
        padding: "30px", 
        borderRadius: "10px", 
        background: "white", 
        boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.1)"
      }}>
        <button 
          style={{ 
            background: "none", 
            border: "none", 
            color: "blue", 
            cursor: "pointer", 
            marginBottom: "20px" 
          }}
          onClick={() => navigate(`/tasks/${appAcronym}`)}
        >
          &lt; Back
        </button>
  
        <h2 style={{ textAlign: "center", marginBottom: "30px" }}>Update Task</h2>
  
        {task && (
          <form style={{ display: "flex", flexWrap: "wrap", gap: "30px" }}>
            {/* Left Section (Task Details) */}
            <div style={{ flex: "1", minWidth: "300px", display: "flex", flexDirection: "column", gap: "15px" }}>
              {/* Task Name and Task State (in the same row) */}
              <div style={{ display: "flex", gap: "20px", justifyContent: "space-between", alignItems: "center" }}>
                {/* Task Name */}
                <div style={{ flex: "1" }}>
                  <label style={{ fontWeight: "600" }}>Task Name:</label>
                  <input 
                    type="text" 
                    value={task.Task_name} 
                    readOnly 
                    style={{ padding: "10px", borderRadius: "5px", border: "1px solid #ccc", width: "100%" }} 
                  />
                </div>
  
                {/* Task State */}
                <div style={{ flex: "1" }}>
                  <label style={{ fontWeight: "600" }}>Task State:</label>
                  <input 
                    type="text" 
                    value="OPEN" 
                    readOnly 
                    style={{ textAlign: 'center', fontWeight: 'bold', padding: "10px", borderRadius: "5px", border: "1px solid #ccc", width: "100%" }} 
                  />
                </div>
              </div>
  
              {/* Task ID */}
              <div>
                <label style={{ fontWeight: "600" }}>Task ID:</label>
                <input 
                  type="text" 
                  value={taskId} 
                  readOnly 
                  style={{ padding: "10px", borderRadius: "5px", border: "1px solid #ccc", width: "100%" }} 
                />
              </div>
              
              {/* Task Plan */}
              <div>
                <label style={{ fontWeight: "600" }}>Plan:</label>
                <select 
                  value={selectedPlan} 
                  onChange={(e) => setSelectedPlan(e.target.value)} 
                  style={{ padding: "10px", borderRadius: "5px", border: "1px solid #ccc", width: "100%" }}
                >
                  <option value="">Select a Plan</option>
                  {plans.map((plan) => (
                    <option key={plan.Plan_MVP_name} value={plan.Plan_MVP_name}>{plan.Plan_MVP_name}</option>
                  ))}
                </select>
              </div>
              
              {/* Task Description */}
              <div>
                <label style={{ fontWeight: "600" }}>Description:</label>
                <textarea 
                  value={task.Task_description} 
                  readOnly 
                  style={{ padding: "10px", resize: "vertical", borderRadius: "5px", border: "1px solid #ccc", width: "100%", minHeight: "120px" }} 
                ></textarea>
              </div>
            </div>
  
            {/* Right Section (Notes History and New Note Input) */}
            <div style={{ flex: "1", minWidth: "300px", display: "flex", flexDirection: "column", gap: "15px" }}>
              {/* Notes History */}
              <div>
                <label style={{ fontWeight: "600" }}>Notes History:</label>
                <textarea 
                  value={notesHistory} 
                  readOnly 
                  style={{ minHeight: "150px", resize: "vertical", padding: "10px", borderRadius: "5px", border: "1px solid #ccc", width: "100%" }} 
                ></textarea>
              </div>
  
              {/* New Note Input */}
              <div>
                <textarea 
                  placeholder="Enter note" 
                  value={newNote} 
                  onChange={(e) => setNewNote(e.target.value)} 
                  style={{ minHeight: "80px", resize: "vertical", padding: "10px", borderRadius: "5px", border: "1px solid #ccc", width: "100%" }} 
                ></textarea>
              </div>
            </div>
          </form>
        )}
  
        {/* Buttons */}
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "30px" }}>
          <button 
            style={{ 
              background: "#ff3e8d", 
              color: "white", 
              padding: "12px 20px", 
              border: "none", 
              borderRadius: "5px", 
              cursor: "pointer", 
              width: "48%" 
            }}
          >
            Release Task
          </button>
          <button 
            style={{ 
              background: "#3e52ff", 
              color: "white", 
              padding: "12px 20px", 
              border: "none", 
              borderRadius: "5px", 
              cursor: "pointer", 
              width: "48%" 
            }}
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
  
}