// src/components/auth/VerifyEmail.js
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";

const VerifyEmail = () => {
  const [status, setStatus] = useState("loading");
  const { token } = useParams();

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        await axios.get(`/api/auth/verify-email/${token}`);
        setStatus("success");
      } catch (error) {
        setStatus("error");
      }
    };

    verifyEmail();
  }, [token]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md text-center">
        {status === "loading" && (
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              Verifying your email...
            </h2>
            <div className="mt-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto"></div>
            </div>
          </div>
        )}

        {status === "success" && (
          <div>
            <h2 className="text-2xl font-bold text-green-600">
              Email Verified Successfully!
            </h2>
            <p className="mt-2 text-gray-600">
              Your email has been verified. You can now login to your account.
            </p>
            <div className="mt-6">
              <Link
                to="/login"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Go to Login
              </Link>
            </div>
          </div>
        )}

        {status === "error" && (
          <div>
            <h2 className="text-2xl font-bold text-red-600">
              Verification Failed
            </h2>
            <p className="mt-2 text-gray-600">
              The verification link is invalid or has expired.
            </p>
            <div className="mt-6">
              <Link
                to="/login"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Go to Login
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
