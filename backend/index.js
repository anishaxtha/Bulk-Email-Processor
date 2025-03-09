const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { connectDB } = require("./src/config/db");
const authRoutes = require("./src/routes/authRoutes");
const emailRoutes = require("./src/routes/emailRoutes");
const templateRoutes = require("./src/routes/templatesRoutes");

dotenv.config();

//app config
const app = express();
const PORT = process.env.PORT || 5001;

// app middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// db connection
connectDB();

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/emails", emailRoutes);
app.use("/api/templates", templateRoutes);

// checking the end points
app.get("/", (req, res) => {
  res.send("Hello from api...");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Browse to http://localhost:${PORT}`);
});
