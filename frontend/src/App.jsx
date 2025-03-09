import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Auth Components
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import VerifyEmail from "./components/auth/VerifyEmail";

// Main App Components
import Dashboard from "./components/Dashboard";
import SendEmails from "./components/emails/SendEmails";
import EmailLogs from "./components/emails/EmailLogs";

// Auth Guard
import PrivateRoute from "./components/PrivateRoute";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <ToastContainer position="top-right" autoClose={3000} />
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-email/:token" element={<VerifyEmail />} />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/send-emails"
            element={
              <PrivateRoute>
                <SendEmails />
              </PrivateRoute>
            }
          />
          <Route
            path="/email-logs"
            element={
              <PrivateRoute>
                <EmailLogs />
              </PrivateRoute>
            }
          />

          {/* Redirect root to login */}
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
