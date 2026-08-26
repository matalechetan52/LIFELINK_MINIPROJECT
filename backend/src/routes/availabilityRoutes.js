const express = require("express");
const router = express.Router();

const availabilityController =
    require("../controllers/availabilityController");

router.get(
    "/resources/:id/availability",
    availabilityController.getResourceAvailability
);

module.exports = router;