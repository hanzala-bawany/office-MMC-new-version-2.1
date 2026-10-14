const express = require("express");
const statisticsRoutes = require("./statisticsRoutes");
const settingsRoutes = require("./settingsRoutes");
const managementRoutes = require("./managementRoutes");
const outPatientRoutes = require("./outPatients");
// const { verifyToken } = require("../middleware/authMiddleWare");
const routes = express.Router();

// routes.use(verifyToken);

routes.use("/statisticsRoutes", statisticsRoutes);
routes.use("/settings", settingsRoutes);
routes.use("/management", managementRoutes);
routes.use("/outPatient", outPatientRoutes);



module.exports = routes;
