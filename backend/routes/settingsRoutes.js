const express = require("express");
const { verifyToken } = require("../middleware/authMiddleWare");
const { getCurrentCashByUserId } = require("../controllers/statisticsController");
const { changePassword } = require("../controllers/changePassword");

const settingsRoutes = express.Router();

settingsRoutes.use(verifyToken);

settingsRoutes.post("/changePassword", changePassword);



module.exports = settingsRoutes;
