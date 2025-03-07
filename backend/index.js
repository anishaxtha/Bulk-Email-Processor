import express from "express";
import cors from "cors";

//app config
const app = express();
const port = 4005;

// app middleware
app.use(express.json());
app.use(cors());

// checking the end points
app.get("/", (req, res) => {
  res.send("Hello from api...");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  console.log(`Browse to http://localhost:${port}`);
});
