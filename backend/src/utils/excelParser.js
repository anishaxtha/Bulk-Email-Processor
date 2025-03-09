const xlsx = require("xlsx");

/**
 * Extract email addresses from Excel file buffer
 * @param {Buffer} buffer - Excel file buffer
 * @returns {Array} - Array of email addresses
 */
exports.extractEmailsFromExcel = (buffer) => {
  try {
    // Parse Excel file
    const workbook = xlsx.read(buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(worksheet);

    // Extract email addresses
    const emails = [];
    data.forEach((row) => {
      // Look for email in any property of the row
      Object.values(row).forEach((value) => {
        if (
          typeof value === "string" &&
          value.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
        ) {
          emails.push(value.trim());
        }
      });
    });

    // Remove duplicates
    return [...new Set(emails)];
  } catch (error) {
    console.error("Excel parsing error:", error);
    throw new Error("Failed to parse Excel file");
  }
};
