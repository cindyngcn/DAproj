import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import About from './pages/About';
import Users from './pages/Users';
import LoginPage from "./pages/LoginPage";
import Admin from "./pages/Admin";
import ProfilePage from "./pages/ProfilePage";
import ProtectedRoutes from './utils/ProtectedRoutes';
import Tasks from "./pages/Tasks";

function App() {
  return (
    <Routes>
      {/* Login Page Route */}
      <Route path="/" element={<LoginPage />} />
      
      {/* Protected Routes */}
      <Route element={<ProtectedRoutes />}>
        <Route path="/home" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/users" element={<Users />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/ProfilePage" element={<ProfilePage />} />
        <Route path="/tasks/:appAcronym" element={<Tasks />} />
      </Route>
    </Routes>
  );
}
export default App;