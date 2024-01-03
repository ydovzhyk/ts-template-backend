const express = require("express");
const { ctrlWrapper } = require("../../helpers");
const ctrl = require("../../controllers/technicalController");

const {
  validateBody,
  isValidId,
  authorize,
  authenticateRefresh,
} = require("../../middlewares");

const router = express.Router();

// get technical data
router.post("/data", ctrlWrapper(ctrl.getTechnicalData));

module.exports = router;
