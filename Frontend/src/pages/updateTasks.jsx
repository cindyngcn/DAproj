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
  //Edited here
  const [userPermissions, setUserPermissions] = useState({
    canCreate: false,
    canOpen: false,
    canToDo: false,
    canDoing: false,
    canDone: false,
  });

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

    // Fetch user permissions
    const fetchUserPermissions = async () => {
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
    };

    fetchTaskDetails();
    fetchPlans();
    fetchUsername();
    fetchUserPermissions();
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

  // Generalized State Update Logic
  const updateTaskState = async (newState) => {
    try {
      const response = await axios.put(
        "http://localhost:8080/updateTaskState",
        {
          Task_id: taskId,
          Task_state: newState,
          Task_app_Acronym: appAcronym,
          currentState: task.Task_state
        },
        { withCredentials: true }
      );

      if (response.data.status === "success") {
        setTask((prevTask) => ({
          ...prevTask,
          Task_state: newState
        }));
        alert(`Task state updated to ${newState}.`);
        appendToNotesHistory(`STATE UPDATED: ${task.Task_state} >> ${newState}`, task.Task_plan);
      } else {
        console.error("Error updating task state:", response.data.message);
        alert(`Error: ${response.data.message}`);
      }
    } catch (error) {
      console.error("Error updating task state:", error);
      alert("An error occurred while updating the task state.");
    }
  };

  // Generalized Task State Transition Handler
  const handleTaskStateTransition = async (targetState, validStates, alertMessage, currentState) => {
    if (!validStates.includes(currentState)) {
      alert(alertMessage);
      return;
    }

    // Call the function that will update the state in your database
    await updateTaskState(targetState);
  };

  // Task-specific handlers using the generalized handler
  const handleReleaseTask = async () => {
    await handleTaskStateTransition("TODO", ["OPEN"], "Only tasks in OPEN state can be released.", task.Task_state);
  };

  const handleWorkOnTask = async () => {
    await handleTaskStateTransition("DOING", ["TODO"], "This task cannot be worked on until it is in the 'TO-DO' state.", task.Task_state);
  };

  const handleReturnToTodo = async () => {
    await handleTaskStateTransition("TODO", ["DOING"], "Only tasks in DOING state can be returned to TODO.", task.Task_state);
  };

  const handleSeekApproval = async () => {
    await handleTaskStateTransition("DONE", ["DOING"], "Only tasks in DOING state can be marked as DONE.", task.Task_state);
  };

  const handleRejectTask = async () => {
    await handleTaskStateTransition("DOING", ["DONE"], "Only tasks in DONE state can be rejected.", task.Task_state);
  };

  const handleApproveTask = async () => {
    await handleTaskStateTransition("CLOSED", ["DONE"], "Only tasks in DONE state can be approved.", task.Task_state);
  };

  // useEffect to update task state in notes history
  useEffect(() => {
    if (task && task.Task_state) {
      let prevState = "";

      console.log("Current Task State:", task.Task_state); // Debugging log for task state

      // Handle transitions based on the current state
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
          prevState = "DOING";  // Transitioning to DOING from DONE
          break;
        case "OPEN":
          prevState = "OPEN";  // Explicit handling for OPEN >> TODO
          break;
        default:
          prevState = "";
          break;
      }

      // Explicitly handle OPEN >> TODO transition
      if (prevState === "OPEN" && task.Task_state === "TODO") {
        prevState = "OPEN";  // Correctly transition from OPEN to TODO
      }

      console.log("Previous State:", prevState); // Debugging log for previous state

      // Now we append to the notes history only if there is a valid previous state
      if (prevState && prevState !== task.Task_state) {
        console.log(`Appending to notes history: STATE UPDATED: ${prevState} >> ${task.Task_state}`);
        appendToNotesHistory(`STATE UPDATED: ${prevState} >> ${task.Task_state}`, task.Task_plan);
      }
    }
  }, [task]);

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

const renderTaskName = () => {
  return(
    <div style={{ flex: "1" }}>
      <label style={{ fontWeight: "600" }}>Task Name:</label>
      <input
        type="text"
        value={task.Task_name}
        readOnly
        style={{ padding: "10px", borderRadius: "5px", border: "1px solid #ccc", width: "100%" }}
      />
    </div>
  )
} 

const renderTaskState = () => {
  return (
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
  )
}

const renderTaskID = () => {
  return (
    <div>
      <label style={{ fontWeight: "600" }}>Task ID:</label>
      <input
        type="text"
        value={taskId}
        readOnly
        style={{ padding: "10px", borderRadius: "5px", border: "1px solid #ccc", width: "100%" }}
      />
    </div>
  )
}

const renderTaskPlan = () => {
  if (task.Task_state !== "OPEN" && task.Task_state !== "DONE"){
    return (
     <div>
      <label style={{ fontWeight: "600" }}>Plan:</label>
      <select
        value={selectedPlan}
        onChange={(e) => setSelectedPlan(e.target.value)}
        style={{ padding: "10px", borderRadius: "5px", border: "1px solid #ccc", width: "100%" }}
        disabled
      >
        <option value="">Select a Plan</option>
        {plans.map((plan) => (
          <option key={plan.Plan_MVP_name} value={plan.Plan_MVP_name}>{plan.Plan_MVP_name}</option>
        ))}
      </select>
     </div>
    );
  };

  return (
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
  )
}

const renderTaskDescription = () => {
  return (
    <div>
      <label style={{ fontWeight: "600" }}>Description:</label>
      <textarea
        value={task.Task_description}
        readOnly
        style={{ padding: "10px", resize: "vertical", borderRadius: "5px", border: "1px solid #ccc", width: "100%", minHeight: "120px" }}
      ></textarea>
    </div>
  )
}

const renderNotesHistory = () => {
  return (
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
  )
}

const renderNewNote = () => {
  if (task.Task_state === "CLOSED"){
    return (
      <div>
      <textarea
        placeholder="Enter note"
        value={newNote}
        readOnly
        style={{ minHeight: "80px", resize: "vertical", padding: "10px", borderRadius: "5px", border: "1px solid #ccc", width: "100%" }}
      ></textarea>
    </div>
    )
  }
  return (
    <div>
      <textarea
        placeholder="Enter note"
        value={newNote}
        onChange={(e) => setNewNote(e.target.value)}
        style={{ minHeight: "80px", resize: "vertical", padding: "10px", borderRadius: "5px", border: "1px solid #ccc", width: "100%" }}
      ></textarea>
    </div>
  )
}

const conditionalButtons = () => {
  //e.g. if you are given permissions in the "OPEN" state, need to make that Task_state ="OPEN" and u are in that particular group
  //need to design an endpoint that takes in all App_Acronym and output the App_Permit_* 
  /*permits={
    App_Acronym: {
      App_Permit_Create: true/false
    }
  }*/
  return (
    <div style={{ display: "flex", gap: "20px", marginTop: "30px" }}>
      {task.Task_state === "OPEN" &&(
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
  )
}

const saveChangesButton = () => {
  if (task.Task_state === "CLOSED"){
    return null;
  } 
  return (
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
  )
}


  if (task === null) {
    return null;
  }

  return (
    <div style={{ width: "100%", height: "100vh", margin: "0", padding: "20px", background: "#f9f9f9", display: "flex", justifyContent: "center", alignItems: "center" }}>
      <div style={{ width: "80%", maxWidth: "1200px", padding: "30px", borderRadius: "10px", background: "white", boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.1)" }}>
        <button 
          style={{ background: "none", border: "none", color: "blue", cursor: "pointer", marginBottom: "20px" }}
          onClick={() => navigate(`/tasks/${appAcronym}`)}
        >
          &lt; Back
        </button>
    
     
          <form style={{ display: "flex", flexWrap: "wrap", gap: "30px" }}>
            {/* Left Section (Task Details) */}
            <div style={{ flex: "1", minWidth: "300px", display: "flex", flexDirection: "column", gap: "15px" }}>
              {/* Task Name and Task State */}
              <div style={{ display: "flex", gap: "20px", justifyContent: "space-between", alignItems: "center" }}>
                {renderTaskName()}
                {renderTaskState()}
              </div>

              {/* Task ID */}
              {renderTaskID()}

              {/* Task Plan */}
              {renderTaskPlan()}

              {/* Task Description */}
              {renderTaskDescription()}

              {/* Conditional Buttons for Task State */}
              {conditionalButtons()}

            </div>

            {/* Right Section (Notes History and New Note Input) */}
            <div style={{ flex: "1", minWidth: "300px", display: "flex", flexDirection: "column", gap: "15px" }}>
              {/* Notes History */}
              {renderNotesHistory()}

              {/* New Note Input */}
              {renderNewNote()}
            </div>
          </form>

        {/* Buttons */}
        {saveChangesButton()}
      </div>
    </div>
  );
}
