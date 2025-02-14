import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

export default function CreateTasks() {
  const { appAcronym } = useParams(); // Get the application acronym
  const navigate = useNavigate();
  const [taskName, setTaskName] = useState("");
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/getPlanColor/${appAcronym}`, { withCredentials: true });
        if (response.data.status === 'success') {
          setPlans(response.data.plans); // Store the list of plans
        } else {
          console.error('Error fetching plans:', response.data.message);
        }
      } catch (error) {
        console.error('Error fetching plans:', error);
      }
    };
  
    fetchPlans();
  }, [appAcronym]);  

  return (
    <div style={{ width: '600px', margin: 'auto', padding: '20px', borderRadius: '8px', background: '#f9f9f9' }}>
        <button 
            style={{ display: 'block', marginBottom: '15px', background: 'none', border: 'none', color: 'blue', cursor: 'pointer' }}
            onClick={() => navigate(`/tasks/${appAcronym}`)}
        >
            &lt; Back
        </button>

        <form style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {/* Row 1: Task Name and Task State */}
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '15px' }}>
            <div style={{ flex: '1', display: 'flex', flexDirection: 'column' }}>
                <label>Task Name:</label>
                <input 
                type="text" 
                required 
                value={taskName} 
                onChange={(e) => setTaskName(e.target.value)} 
                style={{ padding: '8px', borderRadius: '5px', border: '1px solid #ccc' }}
                />
            </div>

            <div style={{ flex: '1', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <label>Task State:</label>
                <input 
                type="text" 
                value="OPEN" 
                readOnly 
                style={{ textAlign: 'center', fontWeight: 'bold', padding: '8px', borderRadius: '5px', border: '1px solid #ccc' }} 
                />
            </div>
            </div>

            {/* Row 2: Task App Acronym and Notes History */}
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '15px' }}>
            <div style={{ flex: '1', display: 'flex', flexDirection: 'column' }}>
                <label>Application:</label>
                <input 
                type="text" 
                value={appAcronym} 
                readOnly 
                style={{ padding: '8px', borderRadius: '5px', border: '1px solid #ccc' }} 
                />
            </div>

            <div style={{ flex: '1', display: 'flex', flexDirection: 'column' }}>
                <label>Notes History:</label>
                <textarea 
                disabled
                style={{ minHeight: '100px', resize: 'vertical', padding: '8px', borderRadius: '5px', border: '1px solid #ccc' }}
                ></textarea>
            </div>
            </div>

            {/* Row 3: Plan selection */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label>Plan:</label>
            <select 
                value={selectedPlan} 
                onChange={(e) => setSelectedPlan(e.target.value)} 
                style={{ padding: '8px', borderRadius: '5px', border: '1px solid #ccc' }}
            >
                <option value="">Select a Plan</option>
                {plans.map((plan) => (
                <option key={plan.Plan_MVP_name} value={plan.Plan_MVP_name}>
                    {plan.Plan_MVP_name}
                </option>
                ))}
            </select>
            </div>

            {/* Row 4: Description */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label>Description:</label>
            <textarea 
                required 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                style={{ padding: '8px', borderRadius: '5px', border: '1px solid #ccc' }}
            />
            </div>

            {/* Row 5: Notes Entry */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
            <textarea 
                disabled 
                placeholder="Enter note" 
                style={{ minHeight: '60px', resize: 'vertical', padding: '8px', borderRadius: '5px', border: '1px solid #ccc' }}
            ></textarea>
            </div>

            {/* Create Task Button */}
            <button 
            type="submit" 
            style={{ alignSelf: 'flex-end', background: '#007bff', color: 'white', padding: '10px 15px', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
            >
            Create Task
            </button>
        </form>
        </div>

  );  
}
