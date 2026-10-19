const express = require("express");
const { verifyToken } = require("../middleware/authMiddleWare");
const { getDailyClosingSummary } = require("../controllers/managementController");

const managementRoutes = express.Router();

managementRoutes.use(verifyToken);

managementRoutes.get("/userSession/printData/:sessionId", getDailyClosingSummary);



module.exports = managementRoutes;
