const express = require("express");
const { verifyToken } = require("../middleware/authMiddleWare");
const { getCurrentCashByUserId } = require("../controllers/statisticsController");

const statisticsRoutes = express.Router();

statisticsRoutes.use(verifyToken);

statisticsRoutes.get("/getCurrentCash/:userId", getCurrentCashByUserId);



module.exports = statisticsRoutes;
