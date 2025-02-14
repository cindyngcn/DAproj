import React from "react";
import { useParams } from "react-router-dom";
import Header1 from "../components/header1"; 
import { Link } from "react-router-dom";

export default function Tasks() {
  const { appAcronym } = useParams(); // Get the app acronym from the URL

  // Define the Kanban columns
  const taskStates = ["OPEN", "TO-DO", "DOING", "DONE", "CLOSED"];

  return (
    <>
      <Header1 />
      <h1 style={{ marginLeft: '20px' }}>Task Board - {appAcronym}</h1>

      {/* Create Task Button */}
      <Link to={`/createTask/${appAcronym}`}>
        <button>Create Task</button>
      </Link>

      {/* Kanban Board */}
      <div className="kanban-board" style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
        {taskStates.map((state) => (
          <div key={state} className="kanban-column" style={{ border: "1px solid black", padding: "10px", minWidth: "200px" }}>
            <h2>{state}</h2>
            {/* Placeholder tasks */}
            <div className="kanban-card" style={{ background: "#ddd", padding: "10px", marginBottom: "10px" }}>
              Sample Task 1
            </div>
            <div className="kanban-card" style={{ background: "#ddd", padding: "10px", marginBottom: "10px" }}>
              Sample Task 2
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
