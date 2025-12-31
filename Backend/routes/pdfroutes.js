const express = require("express");
const router = express.Router();
const { searchPDFs } = require("../controllers/pdfSearchcontroller");

router.post("/pdf-search", searchPDFs);

module.exports = router;
