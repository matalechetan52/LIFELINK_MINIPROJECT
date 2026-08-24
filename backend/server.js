const express = require("express");
const cors = require("cors");
const db = require("./src/utils/db");
const categoryRoutes = require("./src/routes/categoryRoutes");
const resourceRoutes = require("./src/routes/resourceRoutes");

const app = express();

const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Basic API route
app.get("/api", (req, res) => {

  res.json({
    success: true,
    message: "API is running"
  });

});

//all routes.
app.use("/api/categories", categoryRoutes);
app.use("/api/resources", resourceRoutes);


// Start server
app.listen(PORT, () => {

  console.log(
    `Server is running on http://localhost:${PORT}`
  );

});