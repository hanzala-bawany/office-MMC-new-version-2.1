// routes/maRoutes.js  ->  app.use("/api/ma", maRoutes)
const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/authMiddleWare");
const ma = require("../controllers/ma.controller");

// Only Medical Assistants (and Admin) may use the MA actions.
const isMedicalAssistant = (req, res, next) => {
  const role = String(req.user?.role || "").trim().toLowerCase();
  if (role === "medical assistant" || role === "admin") return next();
  return res.status(403).json({ success: false, message: "Medical Assistant access required" });
};

// Public: Screen 5 display data (same as the other display endpoints, no login on the TV).
router.get("/screen-board", ma.getScreenBoard);

// Everything below needs a valid token + MA role.
router.use(verifyToken, isMedicalAssistant);

router.get("/board", ma.getBoard);
router.post("/call-next", ma.callNext);
router.post("/call", ma.callSpecific);
router.post("/skip", ma.skip);
router.post("/repeat", ma.repeat);
router.post("/remove", ma.remove);
router.post("/save-vitals", ma.saveVitals);
router.post("/set-counter", ma.setCounter);

module.exports = router;