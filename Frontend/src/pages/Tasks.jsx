import React from "react";
import { useParams } from "react-router-dom";
import Header1 from "../components/header1"; 

export default function Tasks() {
  const { appAcronym } = useParams(); // Get the app acronym from the URL

  return (
    <>
      <Header1 />
      <h1 style={{ marginLeft: '20px' }}>Task Board - {appAcronym}</h1>
    </>
  );
}
