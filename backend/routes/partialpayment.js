const express = require("express");
const { verifyToken } = require("../middleware/authMiddleWare");
const { getPatientPartialHistoryByReceipt, deletePartialPayment, addEditPartialReceipt, getReceiptInfoByReceiptnId } = require("../controllers/partialpayment");

const partialPaymentRoutes = express.Router();

partialPaymentRoutes.use(verifyToken);

partialPaymentRoutes.get("/patientHistoryByReceipt/:receiptNum", getPatientPartialHistoryByReceipt);

partialPaymentRoutes.get("/receiptInfoByReceiptnId/:receiptNum/:id", getReceiptInfoByReceiptnId);

partialPaymentRoutes.post("/addEditPartialReceipt", addEditPartialReceipt);

partialPaymentRoutes.delete("/deletePartialPayment/:id", deletePartialPayment);


module.exports = partialPaymentRoutes;
