const express = require("express");
const router = express.Router();

const queueController =
    require("../controllers/queueController");

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
module.exports = router;