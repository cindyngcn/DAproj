import React, { useEffect, useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import axios from 'axios';

const ProtectedRoutes = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if the user is authenticated by calling the backend '/auth/verify' route
    const checkAuthentication = async () => {
      try {
        const response = await axios.get('http://localhost:8080/auth/verify', {
          withCredentials: true, // Ensure the cookies are sent with the request
        });

        if (response.data.status === 'success') {
          setIsAuthenticated(true); // User is authenticated
        } else {
          setIsAuthenticated(false); // User is not authenticated
        }
      } catch (error) {
        console.error('Error verifying authentication:', error);
        setIsAuthenticated(false); // In case of error, consider the user not authenticated
      } finally {
        setLoading(false); // Set loading to false once the check is done
      }
    };

    checkAuthentication(); // Call the authentication check function
  }, []);

  if (loading) {
    return <div>Loading...</div>; // You can add a loading spinner or message here
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/" />;
};

export default ProtectedRoutes;