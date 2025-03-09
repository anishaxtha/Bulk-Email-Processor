import React, { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import Navbar from "../layout/Navbar";

const SendEmails = () => {
  console.log("API Base URL:", axios.defaults.baseURL); // Debug log for API URL

  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchingTemplates, setFetchingTemplates] = useState(true);

  const fileInputRef = useRef(null);

  const createDefaultTemplates = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Please login to continue");
        return;
      }

      setLoading(true);

      // Call the create-defaults endpoint
      const response = await axios.post(
        "/api/templates/create-defaults",
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        toast.success("Default templates created successfully");
        // Update templates list
        setTemplates(response.data.data);
      } else {
        toast.error(
          response.data.message || "Failed to create default templates"
        );
      }
    } catch (error) {
      console.error("Error creating templates:", error);
      toast.error(
        error.response?.data?.message || "Failed to create templates"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          toast.error("Please login to continue");
          setFetchingTemplates(false);
          return;
        }

        console.log("Making request with token:", token); // Debug log

        const response = await axios.get("/api/templates", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log("Template response:", response.data); // Debug log

        if (response.data.success && Array.isArray(response.data.data)) {
          setTemplates(response.data.data);
          console.log(
            "Templates loaded:",
            response.data.data.map((t) => ({ id: t._id, name: t.name }))
          ); // Debug log

          if (response.data.data.length === 0) {
            toast.info(
              "No email templates found. Please create a template first."
            );
          }
        } else {
          console.log("Invalid response format:", response.data); // Debug log
          setTemplates([]);
          toast.error("Failed to fetch templates: Invalid response format");
        }
      } catch (error) {
        console.error("Error fetching templates:", error);
        console.error("Error details:", {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
        }); // Detailed error log

        toast.error(
          error.response?.data?.message || "Failed to fetch email templates"
        );
        setTemplates([]);
      } finally {
        setFetchingTemplates(false);
      }
    };

    fetchTemplates();
  }, []);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];

    if (selectedFile) {
      // Validate file format and size
      const validExtensions = [".xlsx", ".xls", ".csv", ".pdf"];
      const validMimeTypes = [
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // xlsx
        "application/vnd.ms-excel", // xls
        "text/csv", // csv
        "application/pdf", // pdf
      ];

      const isValidExtension = validExtensions.some((ext) =>
        selectedFile.name.toLowerCase().endsWith(ext)
      );
      const isValidMimeType = validMimeTypes.includes(selectedFile.type);

      if (!isValidExtension || !isValidMimeType) {
        toast.error(
          "Please upload a valid Excel (.xlsx, .xls), CSV, or PDF file"
        );
        e.target.value = null;
        return;
      }

      // Check file size (5MB limit)
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      if (selectedFile.size > maxSize) {
        toast.error("File size should be less than 5MB");
        e.target.value = null;
        return;
      }

      setFile(selectedFile);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedTemplate) {
      return toast.error("Please select an email template");
    }

    if (!file) {
      return toast.error("Please upload a file with email recipients");
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      // Debug: Check if template exists in templates array
      const selectedTemplateExists = templates.some(
        (t) => t._id === selectedTemplate
      );
      console.log("Template validation:", {
        selectedTemplateId: selectedTemplate,
        exists: selectedTemplateExists,
        availableTemplates: templates.map((t) => ({ id: t._id, name: t.name })),
      });

      if (!selectedTemplateExists) {
        toast.error("Selected template not found in available templates");
        return;
      }

      const formData = new FormData();
      formData.append("templateId", selectedTemplate);
      formData.append("file", file);

      // Debug logs
      console.log("Preparing to send request:", {
        templateId: selectedTemplate,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        token: token ? "Present" : "Missing",
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      const response = await axios.post("/api/emails/bulk-send", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      // Debug log for response
      console.log("Server response:", response.data);

      toast.success("Bulk email task has been queued successfully");
      setSelectedTemplate("");
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      // Enhanced error logging
      console.error("Bulk send error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        selectedTemplate,
        fileName: file?.name,
        templateCount: templates.length,
      });

      toast.error(
        error.response?.data?.message || "Failed to queue bulk email task"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-semibold text-gray-900">
                  Send Bulk Emails
                </h1>
                {templates.length === 0 && !fetchingTemplates && (
                  <button
                    type="button"
                    onClick={createDefaultTemplates}
                    disabled={loading}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    {loading ? "Creating..." : "Create Default Templates"}
                  </button>
                )}
              </div>

              {fetchingTemplates ? (
                <div className="flex justify-center py-10">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div className="space-y-6">
                    {/* Template Selection */}
                    <div>
                      <label
                        htmlFor="template"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Select Email Template
                      </label>
                      <select
                        id="template"
                        name="template"
                        value={selectedTemplate}
                        onChange={(e) => setSelectedTemplate(e.target.value)}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                        required
                      >
                        <option value="">Select a template</option>
                        {templates && templates.length > 0 ? (
                          templates.map((template) => (
                            <option key={template._id} value={template._id}>
                              {template.name}
                            </option>
                          ))
                        ) : (
                          <option value="" disabled>
                            No templates available
                          </option>
                        )}
                      </select>
                      {templates.length === 0 && !fetchingTemplates && (
                        <p className="mt-2 text-sm text-red-600">
                          No templates available. Please create a template
                          first.
                        </p>
                      )}
                    </div>

                    {/* File Upload */}
                    <div>
                      <label
                        htmlFor="file-upload"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Upload Recipients List (Excel/CSV)
                      </label>
                      <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                        <div className="space-y-1 text-center">
                          {/* Valid SVG for file upload */}
                          <svg
                            className="mx-auto h-12 w-12 text-gray-400"
                            stroke="currentColor"
                            fill="none"
                            viewBox="0 0 48 48"
                          >
                            <path
                              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>

                          <div className="flex text-sm text-gray-600">
                            <label
                              htmlFor="file-upload"
                              className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500"
                            >
                              <span>Upload a file</span>
                              <input
                                id="file-upload"
                                name="file-upload"
                                type="file"
                                className="sr-only"
                                onChange={handleFileChange}
                                ref={fileInputRef}
                                required
                              />
                            </label>
                            <div className="flex text-sm text-gray-600">
                              <p className="pl-1">or drag and drop</p>
                            </div>
                          </div>
                          <p className="text-xs text-gray-500">
                            Excel (.xlsx, .xls), CSV, or PDF files
                          </p>
                          {file && (
                            <p className="text-sm text-indigo-600 font-medium">
                              Selected file: {file.name}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <div>
                      <button
                        type="submit"
                        disabled={loading}
                        className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                          loading
                            ? "bg-indigo-400 cursor-not-allowed"
                            : "bg-indigo-600 hover:bg-indigo-700 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        }`}
                      >
                        {loading ? "Processing..." : "Send Bulk Emails"}
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SendEmails;
