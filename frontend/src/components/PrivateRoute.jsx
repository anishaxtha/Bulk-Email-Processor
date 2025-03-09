import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

const PrivateRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    console.log("Token in Local Storage:", localStorage.getItem("token"));
    setIsAuthenticated(!!token); // Convert token to boolean
  }, []);

  if (isAuthenticated === null) {
    return <p>Loading...</p>;
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
};

export default PrivateRoute;
