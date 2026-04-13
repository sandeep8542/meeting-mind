const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();

// ✅ Middleware
app.use(cors({
  origin: "*", // later replace with frontend URL
  credentials: true
}));
app.use(express.json());

// ✅ CONNECT MONGODB (CRITICAL FIX)
mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/meetingmind")
  .then(() => console.log("MongoDB Connected ✅"))
  .catch(err => console.error("MongoDB Error ❌", err));

// ✅ Routes
app.use("/api/meetings", require("./routes/meetings"));
app.use("/api/auth", require("./routes/auth"));
app.use("/api/dashboard", require("./routes/dashboard"));
app.use("/api/actions", require("./routes/actions"));
app.use("/api/ai", require("./routes/ai"));
app.use("/api/actions", require("./routes/actionRoutes"));
const path = require("path");

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../client/build")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../client/build/index.html"));
  });
}

// ✅ Test route
app.get("/", (req, res) => {
  res.send("API Running...");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});