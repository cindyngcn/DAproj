import React, { useRef, useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

export default function UpdateTasks() {
  const { appAcronym, taskId } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState("");
  const [notesHistory, setNotesHistory] = useState("");
  const [newNote, setNewNote] = useState("");
  const [username, setUsername] = useState(""); // Store the logged-in username

  useEffect(() => {
    // Fetch task details
    const fetchTaskDetails = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/getTask/${appAcronym}`, { withCredentials: true });
    
        if (response.data.status === "success") {
          const taskIdFromURL = taskId;
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

    // Fetch logged-in user's username
    const fetchUsername = async () => {
      try {
        // Fetch current user data from the /currentUser endpoint
        const response = await axios.get("http://localhost:8080/currentUser", { withCredentials: true });
    
        console.log(response.data); // Log the full response to inspect the data
    
        // Check if the request was successful and if user data is available
        if (response.data.username) {
          setUsername(response.data.username); // Set the logged-in username
        } else {
          console.error("No username found in the response.");
        }
      } catch (error) {
        console.error("Error fetching username:", error);
      }
    };     

    fetchTaskDetails();
    fetchPlans();
    fetchUsername();
  }, [appAcronym, taskId]);

  // Function to append log to notes history

  const appendToNotesHistory = (entry, taskPlan) => {
    const timestamp = new Date().toLocaleString();
    const logEntry = `${timestamp} (${username}): ${entry}`;

    // Update the local notes history by adding the new logEntry at the top
    setNotesHistory((prevHistory) => {
      const updatedHistory = logEntry + "\n" + prevHistory; // Add the new note at the beginning
      console.log("setting notes history" + logEntry);
      // Send the updated notes history and plan to the backend
      axios.put('http://localhost:8080/updateTask', {
        Task_id: taskId,
        Task_notes: updatedHistory,  // Updated notes history
        Task_plan: taskPlan,         // Updated plan (if changed)
        Task_app_Acronym: appAcronym // If needed, the app acronym
      }, { withCredentials: true })
      .then(response => {
        console.log('Task updated successfully:', response);
      })
      .catch(error => {
        console.error('Error updating task:', error);
      });

      return updatedHistory;  // Return the updated notes history
    });
  };
  
  /*const handleReleaseTask = async () => {
    if (task.Task_state !== "OPEN") {
        alert("Only tasks in OPEN state can be released.");
        return;
    }

    try {
        const updatedState = "TODO"; // Moving from OPEN to TODO
        console.log({
          Task_id: taskId,
          Task_state: updatedState,
          Task_app_Acronym: appAcronym
        });
        const response = await axios.put(
            "http://localhost:8080/updateTaskState",
            {
                Task_id: taskId,
                Task_state: updatedState,
                Task_app_Acronym: appAcronym
            },
            {
                withCredentials: true // ✅ Ensures cookies (authToken) are sent
            }
        );

        if (response.data.status === "success") {
            // Reflect the change in UI
            setTask((prevTask) => ({
                ...prevTask,
                Task_state: updatedState
            }));

            // Log the state change in notes history
            appendToNotesHistory(`STATE UPDATED: ${prevTask.Task_state} >> TODO`);

            alert("Task state updated successfully.");
        } else {
            alert(`Error: ${response.data.message}`);
            console.error("Error updating task state:", response.data.message);
        }
    } catch (error) {
        alert("An error occurred while updating the task state.");
        console.error("Error updating task state:", error);
    }
};*/

  const updateTaskState = async (newState) => {
    if (!["OPEN", "TODO", "DOING", "DONE", "CLOSED"].includes(newState)) {
        alert("Invalid task state.");
        return;
    }

    try {
        const response = await axios.put(
            "http://localhost:8080/updateTaskState",
            {
                Task_id: taskId,
                Task_state: newState,
                Task_app_Acronym: appAcronym
            },
            { withCredentials: true }
        );

        if (response.data.status === "success") {
            setTask((prevTask) => ({
                ...prevTask,
                Task_state: newState
            }));
            alert(`Task state updated to ${newState}.`);
        } else {
            console.error("Error updating task state:", response.data.message);
            alert(`Error: ${response.data.message}`);
        }
    } catch (error) {
        console.error("Error updating task state:", error);
        alert("An error occurred while updating the task state.");
    }
  };

  // Handle Release Task (OPEN to TODO)
  const handleReleaseTask = async () => {
    if (task.Task_state !== "OPEN") {
        alert("Only tasks in OPEN state can be released.");
        return;
    }
    await updateTaskState("TODO");
  };

  // Handle Work on Task (TODO to DOING)
  const handleWorkOnTask = async () => {
    if (task.Task_state !== "TODO") {
        alert("This task cannot be worked on until it is in the 'TO-DO' state.");
        return;
    }
    await updateTaskState("DOING");
  };

  // Handle Return to TODO (DOING to TODO)
  const handleReturnToTodo = async () => {
    if (task.Task_state !== "DOING") {
        alert("Only tasks in DOING state can be returned to TODO.");
        return;
    }
    await updateTaskState("TODO");
  };

  // Handle Seek Approval (DOING to DONE)
  const handleSeekApproval = async () => {
    if (task.Task_state !== "DOING") {
        alert("Only tasks in DOING state can be marked as DONE.");
        return;
    }
    await updateTaskState("DONE");
  };

  // Handle Reject Task (DONE to DOING)
  const handleRejectTask = async () => {
    if (task.Task_state !== "DONE") {
        alert("Only tasks in DONE state can be rejected.");
        return;
    }
    await updateTaskState("DOING");
  };

  // Handle Approve Task (DONE to CLOSED)
  const handleApproveTask = async () => {
    if (task.Task_state !== "DONE") {
        alert("Only tasks in DONE state can be approved.");
        return;
    }
    await updateTaskState("CLOSED");
  };

  useEffect(() => {
    if (task && task.Task_state) {
        let prevState = "";

        switch (task.Task_state) {
          case "TODO":
              prevState = "DOING";  // Transitioning to TODO from DOING
              break;
          case "DOING":
              prevState = "TODO";  // Transitioning to DOING from TODO
              break;
          case "CLOSED":
              prevState = "DONE";  // Transitioning to CLOSED from DONE
              break;
          case "DONE":
              prevState = "DOING";  // Transitioning to DONE from DOING
              break;
          default:
              prevState = "";
              break;
        }      

        // Append the state change to the notes history
        if (prevState) {
            appendToNotesHistory(`STATE UPDATED: ${prevState} >> ${task.Task_state}`);
        }
    }
}, [task]);

  // This useEffect will run after the task state has been updated.
  /*useEffect(() => {
    if (task && task.Task_state) {
        appendToNotesHistory(`STATE UPDATED: OPEN >> ${task.Task_state}`);
    }
  }, [task]);

  const handleWorkOnTask = async () => {
    if (task.Task_state !== "TODO") {
      alert("This task cannot be worked on until it is in the 'TO-DO' state.");
      return;
    }

    try {
      const updatedState = "DOING";
      const response = await axios.put(
        "http://localhost:8080/updateTaskState",
        {
          Task_id: taskId,
          Task_state: updatedState,
          Task_app_Acronym: appAcronym
        },
        { withCredentials: true }
      );

      if (response.data.status === "success") {
        setTask((prevTask) => ({
          ...prevTask,
          Task_state: updatedState
        }));
        appendToNotesHistory(`STATE UPDATED: ${prevTask.Task_state} >> DOING`);
        alert("Task state updated successfully.");
      } else {
        console.error("Error updating task state:", response.data.message);
      }
    } catch (error) {
      console.error("Error updating task state:", error);
    }
  };

  const handleReturnToTodo = async () => {
    if (task.Task_state !== "DOING") {
      alert("Only tasks in DOING state can be returned to TODO.");
      return;
    }
  
    try {
      const updatedState = "TODO"; // Changing task state back to TODO
      const response = await axios.put(
        "http://localhost:8080/updateTaskState",
        {
          Task_id: taskId,
          Task_state: updatedState,
          Task_app_Acronym: appAcronym
        },
        {
          withCredentials: true // ✅ Ensures cookies (authToken) are sent
        }
      );
  
      if (response.data.status === "success") {
        // Reflect the change in UI
        setTask((prevTask) => ({
          ...prevTask,
          Task_state: updatedState
        }));
  
        // Log the state change in notes history
        appendToNotesHistory(`STATE UPDATED: ${prevTaskq.Task_state} >> TODO`);
  
        alert("Task state updated successfully.");
      } else {
        alert(`Error: ${response.data.message}`);
        console.error("Error updating task state:", response.data.message);
      }
    } catch (error) {
      alert("An error occurred while updating the task state.");
      console.error("Error updating task state:", error);
    }
  };  

  // Function to handle the task state change
  const handleSeekApproval = async () => {
    if (task.Task_state !== "DOING") {
      alert("Only tasks in DOING state can be marked as DONE.");
      return;
    }
  
    try {
      const updatedState = "DONE"; // Changing task state to DONE
      const response = await axios.put(
        "http://localhost:8080/updateTaskState", // Your API endpoint
        {
          Task_id: taskId, // Task ID from the task object
          Task_state: updatedState, // The new state (DONE)
          Task_app_Acronym: appAcronym // Your app acronym
        },
        {
          withCredentials: true // Ensures cookies (authToken) are sent
        }
      );
  
      if (response.data.status === "success") {
        // Reflect the change in UI
        setTask((prevTask) => ({
          ...prevTask,
          Task_state: updatedState
        }));
  
        // Log the state change in notes history
        appendToNotesHistory(`STATE UPDATED: ${prevTask.Task_state} >> DONE`);
  
        alert("Task state updated to DONE.");
      } else {
        alert(`Error: ${response.data.message}`);
        console.error("Error updating task state:", response.data.message);
      }
    } catch (error) {
      alert("An error occurred while updating the task state.");
      console.error("Error updating task state:", error);
    }
  };  

  const handleRejectTask = async () => {
    if (task.Task_state !== "DONE") {
      alert("Only tasks in DONE state can be rejected.");
      return;
    }

    try {
      const updatedState = "DOING"; // Changing task state from DONE to DOING
      const response = await axios.put("http://localhost:8080/updateTaskState", {
        Task_id: taskId,
        Task_state: updatedState,
        Task_app_Acronym: appAcronym
      }, { withCredentials: true });

      if (response.data.status === "success") {
        setTask((prevTask) => ({
          ...prevTask,
          Task_state: updatedState
        }));
        appendToNotesHistory(`STATE UPDATED: ${prevTask.Task_state} >> DOING`);
        alert("Task state updated successfully.");
      } else {
        console.error("Error updating task state:", response.data.message);
      }
    } catch (error) {
      console.error("Error updating task state:", error);
    }
  };

  const handleApproveTask = async () => {
    if (task.Task_state !== "DONE") {
      alert("Only tasks in DONE state can be approved.");
      return;
    }

    try {
      const updatedState = "CLOSED"; // Changing task state from DONE to CLOSED
      const response = await axios.put("http://localhost:8080/updateTaskState", {
        Task_id: taskId,
        Task_state: updatedState,
        Task_app_Acronym: appAcronym
      }, { withCredentials: true });

      if (response.data.status === "success") {
        setTask((prevTask) => ({
          ...prevTask,
          Task_state: updatedState
        }));
        appendToNotesHistory(`STATE UPDATED: ${prevTask.Task_state} >> CLOSED`);
        alert("Task state updated to CLOSED.");
      } else {
        console.error("Error updating task state:", response.data.message);
      }
    } catch (error) {
      console.error("Error updating task state:", error);
    }
  };*/

  const handlePlanChange = () => {
    if (selectedPlan !== task.Task_plan) {
      appendToNotesHistory(`UPDATED_PLAN: PLAN = ${task.Task_plan} UPDATED TO ${selectedPlan}`, selectedPlan);
    }
  };

  // Handle new note addition
  const handleNewNote = () => {
    if (newNote.trim()) {
      appendToNotesHistory(newNote);
      console.log("Appending to notes history:", newNote);
      setNewNote(""); // Clear new note input
    }
  };

  return (
    <div style={{ width: "100%", height: "100vh", margin: "0", padding: "20px", background: "#f9f9f9", display: "flex", justifyContent: "center", alignItems: "center" }}>
      <div style={{ width: "80%", maxWidth: "1200px", padding: "30px", borderRadius: "10px", background: "white", boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.1)" }}>
        <button 
          style={{ background: "none", border: "none", color: "blue", cursor: "pointer", marginBottom: "20px" }}
          onClick={() => navigate(`/tasks/${appAcronym}`)}
        >
          &lt; Back
        </button>
    
        {task && (
          <form style={{ display: "flex", flexWrap: "wrap", gap: "30px" }}>
            {/* Left Section (Task Details) */}
            <div style={{ flex: "1", minWidth: "300px", display: "flex", flexDirection: "column", gap: "15px" }}>
              {/* Task Name and Task State */}
              <div style={{ display: "flex", gap: "20px", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ flex: "1" }}>
                  <label style={{ fontWeight: "600" }}>Task Name:</label>
                  <input 
                    type="text" 
                    value={task.Task_name} 
                    readOnly 
                    style={{ padding: "10px", borderRadius: "5px", border: "1px solid #ccc", width: "100%" }} 
                  />
                </div>
                <div style={{ flex: "1" }}>
                  <label style={{ fontWeight: "600" }}>Task State:</label>
                  {/* Display Task State as Read-Only */}
                  <div 
                    style={{ 
                      padding: "10px", 
                      borderRadius: "5px", 
                      border: "1px solid #ccc", 
                      width: "100%", 
                      backgroundColor: "#f9f9f9", 
                      textAlign: "center" 
                    }}
                  >
                    {task.Task_state}
                  </div>
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

              {/* Conditional Buttons for Task State */}
              <div style={{ display: "flex", gap: "20px", marginTop: "30px" }}>
              {task.Task_state === "OPEN" && (
                <button 
                  onClick={handleReleaseTask}
                  style={{
                    padding: "10px 20px",
                    backgroundColor: "#28a745",
                    border: "none",
                    borderRadius: "5px",
                    color: "#fff",
                    cursor: "pointer"
                  }}
                >
                  Release Task
                </button>
              )}

              {task.Task_state === "TODO" && (
                <button 
                  onClick={handleWorkOnTask}
                  style={{
                    padding: "10px 20px",
                    backgroundColor: "#007bff",
                    border: "none",
                    borderRadius: "5px",
                    color: "#fff",
                    cursor: "pointer"
                  }}
                >
                  Work On Task
                </button>
              )}

              {task.Task_state === "DOING" && (
                <>
                  <button 
                    onClick={handleReturnToTodo} // New function for "Return Task to TODO"
                    style={{
                      padding: "10px 20px",
                      backgroundColor: "#ffc107", // Yellow for Return button
                      border: "none",
                      borderRadius: "5px",
                      color: "#fff",
                      cursor: "pointer"
                    }}
                  >
                    Return Task to TODO
                  </button>
                  <button 
                    onClick={handleSeekApproval} // Function to change state to DONE
                    style={{
                      padding: "10px 20px",
                      backgroundColor: "#17a2b8", // Info color
                      border: "none",
                      borderRadius: "5px",
                      color: "#fff",
                      cursor: "pointer"
                    }}
                  >
                    Seek Approval
                  </button>
                  <button 
                    onClick={() => alert("Request for Deadline Extension clicked")} // Placeholder for Request for Deadline Extension
                    style={{
                      padding: "10px 20px",
                      backgroundColor: "#dc3545", // Danger color
                      border: "none",
                      borderRadius: "5px",
                      color: "#fff",
                      cursor: "pointer"
                    }}
                  >
                    Request for Deadline Extension
                  </button>
                </>
              )}

              {task.Task_state === "DONE" && (
                <div>
                  <button 
                    onClick={handleRejectTask} // Function to reject the task
                    style={{
                      padding: "10px 20px",
                      backgroundColor: "#dc3545", // Red for Reject button
                      border: "none",
                      borderRadius: "5px",
                      color: "#fff",
                      cursor: "pointer"
                    }}
                  >
                    Reject Task
                  </button>
                  <button 
                    onClick={handleApproveTask} // Function to approve the task
                    style={{
                      padding: "10px 20px",
                      backgroundColor: "#28a745", // Green for Approve button
                      border: "none",
                      borderRadius: "5px",
                      color: "#fff",
                      cursor: "pointer"
                    }}
                  >
                    Approve Task
                  </button>
                </div>
              )}
              </div>

              {task.Task_state === "CLOSED" && (
                <div style={{ padding: "20px", fontStyle: "italic", color: "#6c757d" }}>
                </div>
              )}
            </div>

            {/* Right Section (Notes History and New Note Input) */}
            <div style={{ flex: "1", minWidth: "300px", display: "flex", flexDirection: "column", gap: "15px" }}>
              {/* Notes History */}
              <div>
                <label style={{ fontWeight: "600" }}>Notes History:</label>
                <div
                  style={{
                    maxHeight: "200px",
                    overflowY: "auto",   // Allow vertical scrolling 
                    resize: "vertical", 
                    padding: "10px", 
                    borderRadius: "5px", 
                    border: "1px solid #ccc", 
                    width: "100%", 
                    background: "#f9f9f9", 
                    whiteSpace: "pre-wrap" // Ensures line breaks are preserved
                  }}
                >
                  {notesHistory.split('\n').map((line, index) => {
                    // Check if the line contains the "STATE UPDATED" phrase and change color
                    if (line.includes('STATE UPDATED')) {
                      return <div key={index} style={{ color: '#2832C2' }}>{line}</div>;
                    }
                    // Check if the line contains the plan change message
                    if (line.includes('UPDATED_PLAN')) {
                      return <span key={index} style={{ color: '#2AAA8A' }}>{line}</span>;
                    } else {
                      return <div key={index}>{line}</div>;
                    }
                  })}
                </div>
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
              background: "#3e52ff", 
              color: "white", 
              padding: "12px 20px", 
              border: "none", 
              borderRadius: "5px", 
              cursor: "pointer", 
              width: "48%" 
            }}
            onClick={() => {
              handlePlanChange(selectedPlan);  // Now it runs only when saving
              handleNewNote();
            }}
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
