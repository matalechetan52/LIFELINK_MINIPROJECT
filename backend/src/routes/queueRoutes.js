const express = require("express");
const router = express.Router();

const queueController =
    require("../controllers/queueController");


const authenticateToken =
    require("../middleware/authMiddleware");

const authorizeRole =
    require("../middleware/roleMiddleware");

router.post(
    "/queues",
    queueController.joinQueue
);

router.get(
    "/queues",
    queueController.getAllQueues
);

router.get(
    "/queues/:id",
    queueController.getQueueById
);

router.patch(
    "/queues/:id/cancel",
    queueController.cancelQueue
);

router.get(
    "/resources/:resourceId/queue",
    queueController.getResourceQueue
);

router.post(
    "/queues/:id/convert",
    authenticateToken,
    authorizeRole("ADMIN"),
    queueController.convertQueueToBooking
);

module.exports = router;