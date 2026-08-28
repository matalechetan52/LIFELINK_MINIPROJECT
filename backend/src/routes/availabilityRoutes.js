const express = require("express");
const router = express.Router();

const availabilityController =
    require("../controllers/availabilityController");

router.get(
    "/resources/:id/availability",
    (req, res) => {

        if (req.query.start || req.query.end) {
            return availabilityController.checkResourceAvailability(
                req,
                res
            );
        }

        return availabilityController.getResourceAvailability(
            req,
            res
        );
    }
);

router.get("/resources/:id/next-available",availabilityController.getNextAvailableTime)

module.exports = router;