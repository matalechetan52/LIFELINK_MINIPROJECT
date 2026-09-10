const express = require("express");
const router = express.Router();

const bookingController =
    require("../controllers/bookingController");

router.post( "/bookings",bookingController.createBooking);
router.get("/bookings",bookingController.getAllBookings);
router.get("/bookings/:id",bookingController.getBookingById);
router.patch("/bookings/:id/cancel",bookingController.cancelBooking);

module.exports = router;