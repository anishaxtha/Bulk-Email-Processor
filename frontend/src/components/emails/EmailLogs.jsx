// src/components/emails/EmailLogs.js
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import Navbar from "../layout/Navbar";

const EmailLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchLogs = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `/api/emails/logs?page=${page}&status=${filter}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setLogs(response.data.data || []);
        setTotalPages(response.data.pagination.totalPages || 1);
      } else {
        setLogs([]);
        setTotalPages(1);
        toast.error("Failed to fetch email logs");
      }
    } catch (error) {
      console.error("Error fetching logs:", error);
      toast.error(
        error.response?.data?.message || "Failed to fetch email logs"
      );
      setLogs([]); // Ensure logs is always an array even on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, filter]);

  const handleRefresh = () => {
    setLoading(true);
    fetchLogs();
  };

  const getStatusBadgeClass = (status) => {
    switch (status.toLowerCase()) {
      case "success":
      case "sent":
        return "bg-green-100 text-green-800";
      case "failed":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <div>
      <Navbar />
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex justify-between items-center">
                <h1 className="text-2xl font-semibold text-gray-900">
                  Email Logs
                </h1>
                <div className="flex items-center gap-4">
                  <select
                    value={filter}
                    onChange={(e) => {
                      setFilter(e.target.value);
                      setPage(1);
                    }}
                    className="block w-40 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  >
                    <option value="all">All Statuses</option>
                    <option value="success">Success</option>
                    <option value="failed">Failed</option>
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                  </select>
                  <button
                    onClick={handleRefresh}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <svg
                      className="h-4 w-4 mr-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                    Refresh
                  </button>
                </div>
              </div>

              {loading ? (
                <div className="flex justify-center py-10">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
                </div>
              ) : logs.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-gray-500 text-lg">No email logs found</p>
                </div>
              ) : (
                <div className="mt-6 overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Recipient
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Template
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Status
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Sent At
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Message
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {logs.map((log) => (
                        <tr key={log._id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {log.recipient}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {log.templateName || "N/A"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(
                                log.status
                              )}`}
                            >
                              {log.status.charAt(0).toUpperCase() +
                                log.status.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {log.sentAt
                              ? formatDate(log.sentAt)
                              : "Not sent yet"}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                            {log.message || "No message"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                      <div className="flex-1 flex justify-between sm:hidden">
                        <button
                          onClick={() => setPage(page > 1 ? page - 1 : 1)}
                          disabled={page === 1}
                          className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                            page === 1
                              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                              : "bg-white text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          Previous
                        </button>
                        <button
                          onClick={() =>
                            setPage(page < totalPages ? page + 1 : totalPages)
                          }
                          disabled={page === totalPages}
                          className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                            page === totalPages
                              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                              : "bg-white text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          Next
                        </button>
                      </div>
                      <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                        <div>
                          <p className="text-sm text-gray-700">
                            Showing page{" "}
                            <span className="font-medium">{page}</span> of{" "}
                            <span className="font-medium">{totalPages}</span>
                          </p>
                        </div>
                        <div>
                          <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                            <button
                              onClick={() => setPage(page > 1 ? page - 1 : 1)}
                              disabled={page === 1}
                              className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                                page === 1
                                  ? "text-gray-300 cursor-not-allowed"
                                  : "text-gray-500 hover:bg-gray-50"
                              }`}
                            >
                              <span className="sr-only">Previous</span>
                              <svg
                                className="h-5 w-5"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                                aria-hidden="true"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </button>

                            {/* Page numbers */}
                            {[...Array(totalPages)].map((_, i) => (
                              <button
                                key={i}
                                onClick={() => setPage(i + 1)}
                                className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium ${
                                  page === i + 1
                                    ? "z-10 bg-indigo-50 border-indigo-500 text-indigo-600"
                                    : "bg-white text-gray-500 hover:bg-gray-50"
                                }`}
                              >
                                {i + 1}
                              </button>
                            ))}

                            <button
                              onClick={() =>
                                setPage(
                                  page < totalPages ? page + 1 : totalPages
                                )
                              }
                              disabled={page === totalPages}
                              className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                                page === totalPages
                                  ? "text-gray-300 cursor-not-allowed"
                                  : "text-gray-500 hover:bg-gray-50"
                              }`}
                            >
                              <span className="sr-only">Next</span>
                              <svg
                                className="h-5 w-5"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                                aria-hidden="true"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </button>
                          </nav>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailLogs;
