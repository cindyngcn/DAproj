import React from "react";
import { useParams } from "react-router-dom";

export default function CreateTasks() {
  const { appAcronym } = useParams(); // Get the application acronym

  return (
    <>
      <h1>Create Task for {appAcronym}</h1>
      <form>
        <label>Task Name:</label>
        <input type="text" required />
        
        <label>Description:</label>
        <textarea required />

        <button type="submit">Create Task</button>
      </form>
    </>
  );
}
