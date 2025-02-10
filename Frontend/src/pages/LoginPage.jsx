import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const LoginPage = () => {
  const navigate = useNavigate(); // Navigate to other pages
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Handle login when form is submitted
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent form from reloading the page
  
    try {
      // Send POST request to the backend API
      const response = await axios.post('http://localhost:8080/auth/login', {
        username,
        password
      },
      {
        withCredentials: true
      });
  
      if (response.data.status === 'success') {
        console.log('Login successful:', response.data.message);
        // Redirect to admin (Home) page
        navigate('/admin');
      }
    } catch (error) {
      // Display error message if login fails
      console.error('Login failed:', error.response?.data?.message || error.message);
      setErrorMessage(error.response?.data?.message || 'An error occurred during login');
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        fontFamily: 'Arial, sans-serif',
        backgroundColor: 'white',
        position: 'relative'
      }}
    >
      <div
        style={{
          position: 'absolute',
          fontSize: '24px',
          fontWeight: 'bold',
          color: '#333',
          top: '0',
          left: '0',
          width: '100%',
          height: '70px',
          backgroundColor: '#CCCCFF',
          paddingTop: '15px',
          paddingLeft: '20px'
        }}
      >
        Task Management System
      </div>

      {/* Login Form */}
      <form
        onSubmit={handleSubmit}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={{
            width: '100%',
            padding: '10px',
            margin: '10px 0',
            border: '2px solid black',
            borderRadius: '4px',
            fontSize: '16px',
            textAlign: 'center'
          }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{
            width: '100%',
            padding: '10px',
            margin: '10px 0',
            border: '2px solid black',
            borderRadius: '4px',
            fontSize: '16px',
            textAlign: 'center'
          }}
        />
        <button
          type="submit"
          style={{
            width: '50%',
            padding: '12px',
            marginTop: '10px',
            border: 'none',
            borderRadius: '4px',
            backgroundColor: '#ADD8E6',
            color: 'white',
            fontSize: '16px',
            cursor: 'pointer',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            transition: 'all 0.3s ease'
          }}
        >
          Login
        </button>
      </form>

      {/* Display error message if login fails */}
      {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
    </div>
  );
};

export default LoginPage;