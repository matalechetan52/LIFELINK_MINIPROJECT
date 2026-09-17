const express = require("express");
const cors = require("cors");
const db = require("./src/utils/db");
const categoryRoutes = require("./src/routes/categoryRoutes");
const resourceRoutes = require("./src/routes/resourceRoutes");
const maintenanceRoutes = require("./src/routes/maintenanceRoutes");
const availabilityRoutes = require("./src/routes/availabilityRoutes");
const bookingRoutes = require("./src/routes/bookingRoutes");
const alternativeRoutes = require("./src/routes/alternativeRoutes");

const authRoutes =require("./src/routes/authRoutes");
const queueRoutes =require("./src/routes/queueRoutes");

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
app.use("/api/maintenance", maintenanceRoutes);
app.use("/api", availabilityRoutes);
app.use("/api",bookingRoutes);
app.use("/api/auth", authRoutes);
app.use("/api", queueRoutes);
app.use("/api", alternativeRoutes);



// Start server
app.listen(PORT, () => {

  console.log(
    `Server is running on http://localhost:${PORT}`
  );

});