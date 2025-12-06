const express = require("express");
const { smartWebSearch } = require("../controllers/webSearchController");

const router = express.Router();

router.post("/smart-search", smartWebSearch);

module.exports = router;
