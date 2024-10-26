// backend/server.js

const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const rulesRouter = require("./routes/rules");

const app = express();
const PORT = process.env.PORT || 5000;

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.use(cors());
app.use(express.json());
// app.use(bodyParser.json());
app.use("/api/rules", rulesRouter);

app.get("/test", (req, res) => {
  res.send("Test root is working");
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
