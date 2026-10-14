const express = require("express");
const { verifyToken } = require("../middleware/authMiddleWare");
const { getOpdReceiptTestPrint, getOpdReceiptPrint, getCompanyDetail, getOpdReceiptnTestPrint } = require("../controllers/outPatients");

const outPatientRoutes = express.Router();

outPatientRoutes.use(verifyToken);

outPatientRoutes.get("/opdReceipt/getOpdReceiptnTestPrint/:vreceipt", getOpdReceiptnTestPrint);
outPatientRoutes.get("/opdReceipt/getCompanyDetail", getCompanyDetail);


module.exports = outPatientRoutes;
