import React from "react";
import { Link } from "react-router-dom";
import Navbar from "./layout/Navbar";

const Dashboard = () => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  return (
    <div>
      <Navbar />
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h1 className="text-2xl font-semibold text-gray-900">
                Dashboard
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                Welcome, {user.name || "User"}!
              </p>

              <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {/* Send Emails Card */}
                <div className="bg-indigo-50 overflow-hidden shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-lg font-medium text-indigo-800">
                      Send Bulk Emails
                    </h3>
                    <p className="mt-1 text-sm text-indigo-600">
                      Choose a template and upload a list of recipients to send
                      bulk emails.
                    </p>
                    <div className="mt-4">
                      <Link
                        to="/send-emails"
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                      >
                        Send Emails
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Email Logs Card */}
                <div className="bg-green-50 overflow-hidden shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-lg font-medium text-green-800">
                      Email Logs
                    </h3>
                    <p className="mt-1 text-sm text-green-600">
                      View the status and logs of all emails sent through the
                      system.
                    </p>
                    <div className="mt-4">
                      <Link
                        to="/email-logs"
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
                      >
                        View Logs
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
