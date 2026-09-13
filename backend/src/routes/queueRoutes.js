const express = require("express");
const router = express.Router();

const queueController =
    require("../controllers/queueController");

router.post(
    "/queues",
    queueController.joinQueue
);

module.exports = router;