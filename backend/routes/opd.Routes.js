
const express = require("express");
const router = express.Router();

const {getPatientLabReports ,  repeatCallPatient, getTodayDoctorPatients, getDoctorNextPatient, getDoctorPatientsWithStats, getDoctorNextPatientSkip, getDoctorNextPatientQueue, doctorStop ,cancelAllDoctorPatients , doctorCallTokenByNumber,getActiveConsultants,addPatientVitals, setDoctorRoom, getDoctorRoom, getPatientHistory, getPatientVitals, getActiveConsultants1, doctorResumeBreak, getTodayDoctorPatientsByScreen, getPatientFullDetails } = require("../controllers/opd.controller");

router.get("/patients", getTodayDoctorPatients);
router.get("/doctor-patients/:doctorId", getDoctorPatientsWithStats);
router.post("/doctor/next-patient", getDoctorNextPatient);
router.post("/doctor/patient-skipped", getDoctorNextPatientSkip);
router.post("/doctor/patient-skipped-call", getDoctorNextPatientQueue);
router.post("/doctor/patient-cancel-all", cancelAllDoctorPatients);
router.post("/doctor/patient-specific-call", doctorCallTokenByNumber);
router.post("/doctor/patient-specific-call", doctorCallTokenByNumber);
router.post("/doctor/patient-repeat-call", repeatCallPatient);
router.get("/consultants/active", getActiveConsultants);
router.post("/doctor/patient-vitals/add", addPatientVitals);
router.post("/doctor/stop", doctorStop);
router.post("/set-room",setDoctorRoom);
router.post("/set-room",setDoctorRoom);
router.get("/get-room",getDoctorRoom)
router.get("/getPatientsHistory",getPatientHistory)
router.get("/doctor/patient-vitals/:receiptNo", getPatientVitals);
router.get("/consultants/active1",   getActiveConsultants1);
router.post("/doctor-resume-break", doctorResumeBreak);
router.get("/patients-by-screen", getTodayDoctorPatientsByScreen);
router.get("/patient-full-details/:receiptNo", getPatientFullDetails);
router.get("/patient-Lab-Reports", getPatientLabReports);


module.exports = router;
