const express = require("express");

const router = express.Router();

const alternativeController =
    require("../controllers/alternativeController");

router.get(
    "/alternatives/resources/:resourceId",
    alternativeController.getAlternativeResources
);

router.get(
    "/alternatives/search",
    alternativeController.searchAlternativeResources
);

module.exports = router;