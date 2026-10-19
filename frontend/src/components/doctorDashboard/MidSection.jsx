import { Select, Input, Button, Tag, Badge, Table } from "antd";
const { Option } = Select;
import MyCircleChart from "../Dashboard/MyCircleChart";
import axios from "axios";
import { base_URL } from "../../utills/baseUrl";
import { memo, useState, useRef, useEffect } from "react";
import { toast } from "react-toastify";
import GetVoice from "./GetVoice";
import AddVitalsModal from "./AddVitalsModal";
import VitalCard from "./VitalCard";
import GetVoice1 from "./GetVoice1";
import VoiceTextArea from "./VoiceTextArea";
import VoiceTextAreaOnline from "./VoiceTextAreaOnline";
import AiAssistant from "./AiAssistant";
import { BulbOutlined } from "@ant-design/icons";
import StopModal from "./StopModal";
import { useNavigate } from "react-router-dom";

const MidSection = ({ patientsData, docPatientData, lastVisit, specificCallingHandlerParent, formData, setFormData }) => {

  const loginUserData = JSON.parse(localStorage.getItem("loginUserData"));
  const currentPatientsData = patientsData?.patients?.[0];
  const currentPatientsVitals = patientsData?.patientVitals?.[0];
  const [isNextLoading, setIsNextLoading] = useState(false);
  const [isSkipLoading, setIsSkipLoading] = useState(false);
  const [isResumeLoading, setIsResumeLoading] = useState(false);
  const [isRepeatCallingHandler, setRepeatCallingHandler] = useState(false);
  const [resetTrigger, setResetTrigger] = useState(false);
  const [specificSearchingToken, setSpecificSearchingToken] = useState(null);
  // let patientToken = Number(specificSearchingToken?.split(" ")[0]?.split("-")[1],);
  let patientToken = Number(specificSearchingToken?.split(" ")[0]);
  const hasAppointments = patientsData?.todayAppointments > 0;
  const hasCurrentPatient = !!currentPatientsData?.RECEIPTNO;
  const allPatientsDone = patientsData?.todayAppointments === patientsData?.patientsChecked + patientsData?.patientsSkipped;
  // const disableNext = isNextLoading || !hasAppointments || (!specificSearchingToken && allPatientsDone);
  // const disableSkip = isSkipLoading || !hasCurrentPatient;
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [selectedTest, setSelectedTest] = useState(null);
  const [activeVoiceField, setActiveVoiceField] = useState(null);
  const [isVitalsModalOpen, setIsVitalsModalOpen] = useState(false);
  const [voiceMode, setVoiceMode] = useState("offline");
  const [showAIAssistant, setShowAIAssistant] = useState(false); // for AI 
  const [aiResponse, setAiResponse] = useState(null);
  const [aiVitalAlerts, setAiVitalAlerts] = useState([]);
  const [isStopModalOpen, setIsStopModalOpen] = useState(false);
  const isFakePatientActive = currentPatientsData?.GENDER == "message"
  const [isOnBreak, setIsOnBreak] = useState(false);

  const [cooldown, setCooldown] = useState(0); // 0 matlab timer nahi chal raha
  const cooldownRef = useRef(null);
  const navigate = useNavigate()


  const startBreak = () => {
    setIsOnBreak(true);
  };

  const resumeManually = async () => {

    try {
      setIsResumeLoading(true);
      const res = await axios.post(`${base_URL}/api/opd/doctor-resume-break`, {
        doctorId: loginUserData?.doctorId,
      });
      console.log(res, "res of resume Manually by id");


      toast.success(`Now you can call patients`);
      setIsOnBreak(false);   // chahe API fail ho ya pass, UI unlock karo

    } catch (err) {
      console.log(err, "error in next Handler");
      toast.error(err?.message);
    }
    finally {
      setIsResumeLoading(false)
    }

  };

  const startCooldown = () => {
    setCooldown(16);
    cooldownRef.current = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(cooldownRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const isCoolingDown = cooldown > 0;

  useEffect(() => {
    return () => clearInterval(cooldownRef.current); // cleanup
  }, []);



  const disableNext = isNextLoading || !hasAppointments || (!specificSearchingToken && allPatientsDone) || isOnBreak || isCoolingDown;        // ← break pe sab band
  const disableSkip = isSkipLoading || !hasCurrentPatient || isOnBreak || isFakePatientActive || isCoolingDown;
  const disableRepeatCall = !currentPatientsData || isOnBreak || isFakePatientActive || isCoolingDown;
  const disableAddVitals = !currentPatientsData || isOnBreak || isFakePatientActive;
  const currentFaculty = loginUserData?.faculty ||"Physician"; 



  // let patintsW8ing;

  // console.log(specificSearchingToken, "<<<<<<<  specificSearchingToken  ");
  // console.log(currentPatientsData, "<<<<<<<  currentPatientsData ");
  // console.log(patientsData, "<<<<<<<<<");
  // console.log(loginUserData, "<<<<<<<  loginUserData  ");
  // console.log(currentPatientsVitals, "<<<<<<<  currentPatientsVitals ");
  // console.log(lastVisit, "<<<<<<<  lastVisit ");
  // console.log(patientToken, "<<<<<<<  patientToken ");

  // Sample departments data - sirf UI dikhane ke liye
  const departments = [
    { id: "1", name: "General", type: "1" },
    { id: "2", name: "BIOCHEMISTRY", type: "2" },
    { id: "3", name: "HEAMOTOLOGY", type: "2" },
    { id: "4", name: "SEROLOGY", type: "2" },
    { id: "5", name: "HORMONES", type: "2" },
    { id: "6", name: "URINE EXAMINATION", type: "2" },
    { id: "7", name: "BLOOD BANK", type: "2" },
    { id: "8", name: "FLUIDS", type: "2" },
    { id: "9", name: "MICROBIOLOGY", type: "2" },
    { id: "10", name: "STOOL EXAMINATION", type: "2" },
    { id: "11", name: "SEMEN ANALYSIS", type: "2" },
    { id: "12", name: "HEPATITIS", type: "2" },
    { id: "14", name: "HISTROPATHOLOGY", type: "2" },
    { id: "15", name: "ECHOCARDIOGRAPHY", type: "19" },
    { id: "16", name: "SPECIAL CHEMISTRY-1", type: "2" },
    { id: "17", name: "SPECIAL CHEMISTRY-2", type: "2" },
  ];

  // Sample tests data - sirf UI dikhane ke liye
  const sampleTests = [
    { id: "101", name: "Complete Blood Count", department: "2" },
    { id: "102", name: "Blood Sugar Fasting", department: "2" },
    { id: "103", name: "Lipid Profile", department: "2" },
    { id: "104", name: "Liver Function Test", department: "2" },
    { id: "105", name: "Thyroid Profile", department: "5" },
    { id: "106", name: "Urine Routine", department: "6" },
  ];

  // Sample lab patients data - sirf UI dikhane ke liye
  const sampleLabPatients = [
    {
      id: 1,
      patientName: "Ahmed Khan",
      tokenNo: "T-101",
      testName: "Complete Blood Count",
      department: "HEAMOTOLOGY",
      status: "pending",
    },
    {
      id: 2,
      patientName: "Fatima Ali",
      tokenNo: "T-102",
      testName: "Blood Sugar Fasting",
      department: "BIOCHEMISTRY",
      status: "in progress",
    },
    {
      id: 3,
      patientName: "Usman Tariq",
      tokenNo: "T-103",
      testName: "Lipid Profile",
      department: "BIOCHEMISTRY",
      status: "completed",
    },
    {
      id: 4,
      patientName: "Ayesha Malik",
      tokenNo: "T-104",
      testName: "Thyroid Profile",
      department: "HORMONES",
      status: "pending",
    },
    {
      id: 5,
      patientName: "Bilal Ahmed",
      tokenNo: "T-105",
      testName: "Urine Routine",
      department: "URINE EXAMINATION",
      status: "in progress",
    },
    {
      id: 6,
      patientName: "Hassan Raza",
      tokenNo: "T-106",
      testName: "Liver Function Test",
      department: "BIOCHEMISTRY",
      status: "completed",
    },
    {
      id: 7,
      patientName: "Sara Khan",
      tokenNo: "T-107",
      testName: "Hepatitis Screening",
      department: "HEPATITIS",
      status: "pending",
    },
    {
      id: 8,
      patientName: "Ali Hamza",
      tokenNo: "T-108",
      testName: "Stool Routine",
      department: "STOOL EXAMINATION",
      status: "pending",
    },
  ];

  const VITALS_CONFIG = [
    {
      currentKey: "CBLOOD_PRESSURE",
      formKey: "bloodPressure",
      lastKey: "BLOOD_PRESSURE",
      label: "Blood Pressure",
      unit: "mmHg",
      bgColor: "#FDF2F8",
      borderColor: "#EC4899",
      textColor: "#DB2777",
      subTextColor: "#9D174D",
    },
    {
      currentKey: "CBLOOD_SUGAR",
      formKey: "bloodSugar",
      lastKey: "BLOOD_SUGAR",
      label: "Blood Sugar",
      unit: "mg/dL",
      bgColor: "#ECFDF5",
      borderColor: "#22C55E",
      textColor: "#15803D",
      subTextColor: "#166534",
    },
    {
      currentKey: "CWEIGHT",
      formKey: "weight",
      lastKey: "WEIGHT",
      label: "Weight",
      unit: "kg",
      bgColor: "#DBEAFE",
      borderColor: "#2563EB",
      textColor: "#1D4ED8",
      subTextColor: "#1E40AF",
    },
    {
      currentKey: "CHEIGHT",
      formKey: "height",
      lastKey: "HEIGHT",
      label: "Height",
      unit: "cm",
      bgColor: "#F3F4F6",
      borderColor: "#4B5563",
      textColor: "#374151",
      subTextColor: "#1F2937",
    },
    {
      currentKey: "CTEMPERATURE",
      formKey: "temperature",
      lastKey: "TEMPERATURE",
      label: "Temp",
      unit: "°F",
      bgColor: "#EDE9FE",
      borderColor: "#7C3AED",
      textColor: "#6D28D9",
      subTextColor: "#5B21B6",
    },
    {
      currentKey: "CPULSE",
      formKey: "pulse",
      lastKey: "PULSE",
      label: "Pulse",
      unit: "bpm",
      bgColor: "#FEF9C3",
      borderColor: "#CA8A04",
      textColor: "#B45309",
      subTextColor: "#92400E",
    },
  ];

  const pieData = [
    {
      name: "Patients Remaining",
      uv: patientsData?.patientsRemaining,
      fill: "#60A5FA",
    }, // blue-400
    {
      name: "Patients Checked",
      uv: patientsData?.patientsChecked,
      fill: "#A855F7",
    }, // purple-500
  ];

  const patientData = {
    name: "Ali Raza",
    age: 32,
    gender: "Male",
    opdId: "A - 20",

    CbloodPressure: "120/80 mmHg",
    LbloodPressure: "130/85 mmHg",

    CbloodSugar: "95 mg/dL",
    LbloodSugar: "105 mg/dL",

    Cweight: "72 kg",
    Lweight: "74 kg",

    Cheight: "5.8 ft",
    Lheight: "5.8 ft",

    Ctemperature: "98.4°F",
    Ltemperature: "99.1°F",

    Cpulse: "78 bpm",
    Lpulse: "82 bpm",
  };

  const diagnosisOptions = patientsData?.diagnosisList?.map((item) => ({
    value: item.DIAGNOSIS,
    label: item.DIAGNOSIS,
  }));

  const testOptions = patientsData?.testList?.map((item) => ({
    value: item?.TEST_NAME,
    label: item?.TEST_NAME,
  }));

  const skippedTokenListOptions = patientsData?.skippedTokenList?.map((item) => ({
    value: item?.TOKENNO,
    label: `${item?.TOKENNO} | ${item?.PATIENTNAME}`,
    // Multi-line display for dropdown
    labelWithBreaks: (
      <div className="py-2 px-1 border-b border-gray-100 last:border-b-0">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-blue-100 text-blue-800">
            Token: {item?.TOKENNO}
          </span>
          <span className="font-medium text-gray-800 text-sm">
            {item?.PATIENTNAME}
          </span>
        </div>
        <div className="flex gap-4 text-xs text-gray-600">
          <span className="inline-flex items-center gap-1">
            <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="font-medium">Gender:</span> {item?.GENDER || 'N/A'}
          </span>
          <span className="inline-flex items-center gap-1">
            <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-medium">Age:</span> {item?.AGE || 'N/A'} {item?.AGE && 'yrs'}
          </span>
        </div>
      </div>
    )
  }));

  const medicinesOptions = patientsData?.medicineList?.map(
    (item) => ({
      value: item?.MEDICINE_NAME,
      label: item?.MEDICINE_NAME,
    }),
  );

  const nextHandler = async () => {

    try {
      setIsNextLoading(true);
      const res = await axios.post(`${base_URL}/api/opd/doctor/next-patient`, {
        doctorId: loginUserData?.doctorId,
        receiptNo: currentPatientsData?.RECEIPTNO || null,
        remarks: formData?.primaryComplain || null,
        primaryDiagnosis: formData?.primaryDiagnosis || null,
        medicalTests: formData?.medicalTests || null,
        treatment: formData?.treatment || null,
        medicine: formData?.medicines || null,
        medicalPlan: formData?.medicinePlan || null,
      });
      // console.log(res, "res of next Handler by id");
      await docPatientData();
      if (patientsData?.patientsRemaining > 0) {
        toast.success(`Next Patient is Coming`);
      } else {
        toast.info(`Patient Not yet`);
      }
      setFormData({
        primaryDiagnosis: [],
        medicalTests: [],
        treatment: "",
        primaryComplain: "",
        medicines: [],
        medicinePlan: "",
      });
      setResetTrigger((prev) => !prev);
      startCooldown();
    } catch (err) {
      console.log(err, "error in next Handler");
      toast.error(err?.message);
    } finally {
      setIsNextLoading(false);
    }
  };

  const specificCallingHandler = async () => {

    try {

      setIsNextLoading(true);
      await specificCallingHandlerParent(patientToken);
      setSpecificSearchingToken(null);
      startCooldown();

    } catch (err) {

      console.log(err, "error in specific Calling Handler");
      toast.error(err?.message);

    } finally {
      setIsNextLoading(false);
    }
  };

  const skipHandler = async () => {
    // console.log(formData, ">>>>>>>>>>>>>");

    try {
      setIsSkipLoading(true);
      const res = await axios.post(
        `${base_URL}/api/opd/doctor/patient-skipped`,
        {
          doctorId: loginUserData?.doctorId,
          receiptNo: null,
        },
      );
      // console.log(res, "res of skip Handler by id");
      await docPatientData();
      if (patientsData?.patientsRemaining > 0) {
        toast.success(`Next Patient is Coming`);
      } else {
        toast.info(`Patient Not yet`);
      }
      startCooldown();
    } catch (err) {
      console.log(err, "error in skip Handler");
      toast.error(err?.message);
    } finally {
      setIsSkipLoading(false);
    }
  };

  const repeatCallingHandler = async () => {
    try {
      setRepeatCallingHandler(true);
      const res = await axios.post(
        `${base_URL}/api/opd/doctor/patient-repeat-call`,
        {
          doctorId: loginUserData?.doctorId,
          doctorName: loginUserData?.name,
          patientToken: currentPatientsData?.TOKENNO,
        },
      );
      // console.log(res, "res of repeat Calling Handler");

      toast.success(`Repeat Calling`);
      startCooldown();
    } catch (err) {
      console.log(err, "error in call Repeat Handler");
      toast.error(err?.message);
    } finally {
      setRepeatCallingHandler(false);
    }
  };

  const formHandler = (key, value) => {
    setFormData({ ...formData, [key]: value });

    setActiveVoiceField(key);

    setTimeout(() => {
      setActiveVoiceField(null);
    }, 1200);
  };

  const handleAddTreatmentFromAI = (treatmentText) => {
    const currentTreatment = formData.treatment || "";
    const newTreatment = currentTreatment
      ? `${currentTreatment}\n📋 ${treatmentText}`
      : `📋 ${treatmentText}`;
    formHandler("treatment", newTreatment);
    toast.success("Treatment plan added");
  };

  const handleAddMedicinesFromAI = (medicinesList) => {
    // medicinesList is array of medicine names from AI
    const currentMedicines = formData.medicines || [];
    const newMedicines = [...new Set([...currentMedicines, ...medicinesList])];
    formHandler("medicines", newMedicines);
    toast.success(`${medicinesList.length} medicine(s) added to Medicines list`);
  };

  // Handle medicine plan from AI (for Medicine Plan textarea)
  const handleAddMedicinePlanFromAI = (planText) => {
    const currentPlan = formData.medicinePlan || "";
    const newPlan = currentPlan
      ? `${currentPlan}\n📋 ${planText}`
      : `📋 ${planText}`;
    formHandler("medicinePlan", newPlan);
    toast.success("Medicine plan added");
  };

  const BreakBtn = () => {

    return <Button
      onClick={isOnBreak ? resumeManually : () => setIsStopModalOpen(true)}
      style={{
        // width: "15%",
        borderColor: isOnBreak ? "#16a34a" : "#ef4444",
        color: isOnBreak ? "#16a34a" : "#ef4444",
      }}
      block
      loading={isResumeLoading}
      className={
        isOnBreak
          ? "hover:border-green-600! hover:text-green-600! hover:bg-green-50! active:bg-green-100! transition-all duration-200"
          : `hover:border-red-600! hover:text-red-600! hover:bg-red-50! active:bg-red-100! transition-all duration-200 `
      }
    >
      {isOnBreak ? `▶ Resume` : "BREAK"}
    </Button>
  }

  const PrintBtn = () => {

    

    return (

      <button
        onClick={handlePrintReport}
        disabled={!patientsData?.patients?.[0]}
        className={`
          flex items-center justify-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium
          transition-all duration-200 ease-in-out m-2 mx-4
          ${patientsData?.patients?.[0]
            ? 'border border-blue-600 text-blue-600 hover:bg-blue-50 hover:shadow-lg active:scale-95 cursor-pointer'
            : 'border border-gray-300 bg-gray-100 text-gray-400 cursor-not-allowed'
          }
          w-auto  
      `}
      >
        print / Preview
      </button>
    )

  }


  const handlePrintReport = () => {

    // Check if patient data exists
    if (!patientsData?.patients?.[0]) {
      toast.warning('No patient data available to print');
      return;
    }

    if (!formData?.treatment) {
      toast.warning('Treatment is required');
      return;
    }

    const reportData = {
      patient: patientsData?.patients?.[0],
      vitals: patientsData?.patientVitals?.[0],
      formData: formData,
      doctorData: loginUserData,
      lastVisit: lastVisit
    };

    navigate('/prescriptionReport' , {
      state : { reportData : reportData }
    });
    
  };



  return (

    <div className="grid grid-cols-1 gap-6 xl:grid-cols-2 xl:gap-6 2xl:grid-cols-2 mb-8 h-auto xl:grid-rows-1">

      {/* Pie Chart - sirf xl/laptop pe */}
      <div className="hidden xl:flex 2xl:hidden order-3 xl:order-3 themeBoxShadow border-none outline-none rounded-[10px] z-10 bg-white flex-col justify-between min-h-40">
        <div className="flex-1 p-2 px-4 sm:p-4 flex justify-between gap-4 sm:gap-8 items-center border-b border-gray-300 text-[18px] text-gray-500 font-medium">
          <h2 className="text-lg sm:text-xl font-semibold text-black">
            Patient Progress
          </h2>
          <div className="flex flex-col sm:flex-row justify-center gap-1 sm:gap-6 text-sm">
            <span className="text-[#60A5FA]">● Patients Remaining</span>
            <span className="text-[#A855F7]">● Patients Checked</span>
          </div>
        </div>

        <div
          className={`flex-7 ${!(patientsData?.patientsRemaining || patientsData?.patientsChecked) && "p-6"}`}
        >
          {patientsData?.patientsRemaining || patientsData?.patientsChecked ? (
            <MyCircleChart piData={pieData} active="dd" />
          ) : (
            <div className="flex flex-col items-center justify-center h-full rounded-xl border-2 border-dashed border-blue-300 bg-gradient-to-br from-blue-50 to-cyan-50 text-center transition-all">
              <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-3">
                <span className="text-3xl">📊</span>
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-blue-700">
                No Patients Checked Today
              </h3>
              <p className="text-sm text-blue-500 mt-1 max-w-[220px]">
                Patient visit data will appear here once appointments are
                scheduled
              </p>
              <div className="mt-3 px-4 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-600">
                Waiting for OPD entries
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ADD Patient Detail & Patient Vitals */}
      <div className="z-10 rounded-t-[12px] order-1  2xl:contents xl:row-span-2 relative">

        {/* Patient Vitals */}
        <div
          id="vitals-section"
          className="flex-1 z-10 themeBoxShadow rounded-t-[12px] bg-white flex flex-col justify-between transition-all duration-300 hover:shadow-lg 2xl:order-2"
        >

          <div className="flex-1  p-6 xl:p-4 flex items-center justify-between rounded-t-[12px] border-b border-gray-200 bg-gradient-to-r from-indigo-600 to-blue-500 2xl:bg-none 2xl:from-transparent 2xl:to-transparent">
            <h2 className="flex flex-col gap-2 text-lg sm:text-xl font-semibold text-white 2xl:text-black">
              Patient Vitals
              <div className="flex h-fit items-center sm:hidden font-bold gap-2 text-md px-2.5 py-0.5 rounded-full w-fit bg-white text-blue-600 border border-blue-200 xl:bg-blue-50 xl:text-blue-600 xl:border-blue-200">
                {currentPatientsData?.TOKENNO || "Not Yet"}
              </div>
            </h2>

            <div className="flex items-center gap-6">
              {/* TOKEN */}
              <div className="hidden sm:flex items-center font-bold gap-2 text-md px-2.5 py-0.5 rounded-full  bg-white text-blue-600 border border-blue-200 xl:bg-blue-50 xl:text-blue-600 xl:border-blue-200">
                {currentPatientsData?.TOKENNO || "Not Yet"}
              </div>

              {/* ADD / repeat VITALS BUTTON */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  id="btn-add-vitals"
                  size="middle"
                  onClick={() => setIsVitalsModalOpen(true)}
                  disabled={!currentPatientsData || disableAddVitals}
                  className="bg-green-500 border-none text-white hover:opacity-90 !h-auto !px-0 !py-1 text-xs  sm:!px-4 sm:!py-2 sm:text-sm"
                >
                  + Add Vitals
                </Button>

                <Button
                  id="btn-repeat-call"
                  size="middle"
                  onClick={repeatCallingHandler}
                  loading={isRepeatCallingHandler}
                  disabled={!currentPatientsData || disableRepeatCall}
                  className="w-fit bg-gradient-to-r from-indigo-500 to-blue-500 border-none text-white hover:opacity-90 md:bg-none md:bg-white/20 md:border-white/40 xl:bg-gradient-to-r xl:from-indigo-500 xl:to-blue-500 !h-auto !px-2 !py-1 text-xs  sm:!px-4 sm:!py-2 sm:text-sm"
                >
                  🔁 Repeat Call
                </Button>
              </div>

            </div>

          </div>

          <div className="p-6 flex-6 flex flex-col gap-3 text-gray-700 ">

            <p>
              <span className="font-semibold text-gray-800">Added by :</span>{" "}
              {!isFakePatientActive ? currentPatientsVitals?.CREATED_BY || "Not Yet" : "Not Yet"}
            </p>

            <p>
              <span className="font-semibold text-gray-800">Name :</span>{" "}
              {!isFakePatientActive ? currentPatientsData?.PATIENTNAME || "Not Yet" : "Not Yet"}
            </p>

            <div className="font-semibold  py-1 flex justify-between text-gray-600">

              <p>
                <span className="font-semibold text-gray-800">Age :</span>{" "}
                {!isFakePatientActive ? currentPatientsData?.AGE || "Not Yet" : "Not Yet"}
              </p>
              <p>
                <span className="font-semibold text-gray-800">Gender :</span>{" "}
                {!isFakePatientActive ? currentPatientsData?.GENDER || "Not Yet" : "Not Yet"}
              </p>

            </div>



            <div className="mt-3 grid grid-cols-2  sm:grid-cols-3 gap-3 gap-x-5 text-sm p-4 rounded-2xl shadow-lg transition-all themeBoxShadow">
              {VITALS_CONFIG?.map((vital) => (
                <VitalCard
                  key={vital.currentKey}
                  label={vital.label}
                  currentValue={
                    currentPatientsVitals &&
                    currentPatientsVitals[vital.currentKey]
                  }
                  lastValue={lastVisit[vital.lastKey]}
                  bgColor={vital.bgColor}
                  borderColor={vital.borderColor}
                  textColor={vital.textColor}
                  subTextColor={vital.subTextColor}
                  unit={vital.unit}
                />
              ))}
            </div>

          </div>

          {/* NEXT BUTTON */}
          <div className="p-4 border-t border-gray-200 hidden 2xl:flex gap-5">
            <Select
              allowClear
              showSearch
              placeholder="Select Token"
              optionFilterProp="label"
              style={{ width: "40%" }}
              options={skippedTokenListOptions}
              onChange={(value) => setSpecificSearchingToken(value)}
              value={specificSearchingToken}
            />

            <Button
              type="primary"
              block
              onClick={
                specificSearchingToken ? specificCallingHandler : nextHandler
              }
              loading={isNextLoading}
              // disabled={disableNext || !patintsW8ing}
              disabled={disableNext}
            >
              {specificSearchingToken
                ? "Specific Calling"
                : currentPatientsData?.RECEIPTNO
                  ? "Next Patient"
                  : "START"}
            </Button>


            <BreakBtn desktop={true} />

          </div>

          {/* Skip Buttons */}
          <div className="p-4 border-t  border-gray-200 hidden 2xl:flex gap-3">
            <Button
              block
              className="!border-blue-500 !text-blue-500  hover:!border-blue-600 hover:!text-blue-600 hover:!bg-blue-50 active:!bg-blue-100 transition-all duration-200"
              onClick={skipHandler}
              loading={isSkipLoading}
              disabled={disableSkip}
            >
              Skip Patient
            </Button>
          </div>

        </div>

        {/* Add Patient Detail */}
        <div className="flex-1 z-10 themeBoxShadow border-none outline-none rounded-b-[12px] rounded-t-none 2xl:rounded-xl overflow-hidden bg-white flex flex-col 2xl:order-3">

          <div className="p-4 flex-1 flex justify-between items-center 2xl:bg-gradient-to-r 2xl:from-indigo-600 2xl:to-blue-500">
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-black md:text-black xl:text-black 2xl:text-white">
                Add Patient Detail
              </h2>
              <p className="text-xs text-gray-400 md:text-gray-400 xl:text-gray-700 2xl:text-blue-100">
                Assign & Monitor
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Voice Mode Toggle */}
              <div className="flex items-center gap-1 bg-gray-100 rounded-full p-1 border border-gray-200">


                <button
                  type="button"
                  onClick={() => setVoiceMode("offline")}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-all duration-200
          ${voiceMode === "offline"
                      ? "bg-white text-gray-700 shadow-sm border border-gray-200"
                      : "text-gray-400 hover:text-gray-600"
                    }`}
                >
                  <svg
                    width="10"
                    height="10"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  >
                    <line x1="1" y1="1" x2="23" y2="23" />
                    <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55" />
                    <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39" />
                    <path d="M10.71 5.05A16 16 0 0 1 22.56 9" />
                    <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88" />
                    <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
                    <line x1="12" y1="20" x2="12.01" y2="20" />
                  </svg>
                  Offline
                </button>

                <button
                  type="button"
                  onClick={() => setVoiceMode("online")}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-all duration-200 ${voiceMode === "online" ? "bg-white text-blue-600 shadow-sm border border-blue-200" : "text-gray-400 hover:text-gray-600"}`}
                >
                  <span
                    className={`relative flex h-1.5 w-1.5 ${voiceMode === "online" ? "visible" : "invisible"}`}
                  >
                    <span className="absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75 animate-ping"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-blue-500"></span>
                  </span>
                  Online
                </button>

              </div>

              {/* OPD Badge */}
              <div className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full md:bg-blue-50 md:border md:border-blue-200 xl:bg-white/20 xl:border-0">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-green-300 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400"></span>
                </span>
                <span className="text-xs text-blue-600 md:text-blue-600 xl:text-blue-600 2xl:text-white">
                  OPD Entry
                </span>
              </div>
            </div>

          </div>

          {/* BODY */}
          <div className="flex-6 grid grid-cols-1  md:grid-cols-2  2xl:grid-cols-2  gap-5 p-4 ">

            {/* PRIMARY DIAGNOSIS */}
            <div id="form-primary-diagnosis" className="flex flex-col gap-1">

              <label className="text-sm font-medium text-gray-500">
                Primary Diagnosis
              </label>
              <Select
                // mode="multiple"
                mode="tags"
                allowClear
                showSearch
                placeholder="Select primary diagnosis"
                optionFilterProp="label"
                style={{ width: "100%" }}
                options={diagnosisOptions}
                onChange={(value) => formHandler("primaryDiagnosis", value)}
                value={formData.primaryDiagnosis}
              />

            </div>

            {/* MEDICAL TESTS */}
            <div id="form-recommended-tests" className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-500">
                Recommended Tests
              </label>
              <Select
                // mode="multiple"
                mode="tags"
                allowClear
                placeholder="Select medical tests"
                style={{ width: "100%" }}
                options={testOptions}
                onChange={(value) => formHandler("medicalTests", value)}
                value={formData.medicalTests}
              />
            </div>

            {voiceMode === "online" ? (
              <>
                <VoiceTextAreaOnline
                  label="Treatment"
                  fieldKey="treatment"
                  value={formData.treatment}
                  onChange={(val) => formHandler("treatment", val)}
                  formHandler={formHandler}
                  placeholder="Prescribed medicines or treatment"
                  driverId="form-treatment"
                  resetTrigger={resetTrigger}
                />
                <VoiceTextAreaOnline
                  driverId="form-primary-complain"
                  label="Primary Complain"
                  fieldKey="primaryComplain"
                  value={formData.primaryComplain}
                  onChange={(val) => formHandler("primaryComplain", val)}
                  formHandler={formHandler}
                  placeholder="Patient complain / symptoms"
                  resetTrigger={resetTrigger}
                />
              </>
            ) : (
              <>
                <VoiceTextArea
                  label="Treatment"
                  fieldKey="treatment"
                  value={formData.treatment}
                  onChange={(val) => formHandler("treatment", val)}
                  placeholder="Prescribed medicines or treatment"
                  driverId="form-treatment"
                />
                <VoiceTextArea
                  driverId="form-primary-complain"
                  label="Primary Complain"
                  fieldKey="primaryComplain"
                  value={formData.primaryComplain}
                  onChange={(val) => formHandler("primaryComplain", val)}
                  placeholder="Patient complain / symptoms"
                />
              </>
            )}


            {/*  MEDICINE SELECT (Dropdown) */}
            <div id="form-medicines" className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-500">
                Medicines
              </label>
              <Select
                mode="tags"
                allowClear
                showSearch
                placeholder="Select or type medicine name"
                optionFilterProp="label"
                style={{ width: "100%" }}
                options={medicinesOptions}  // You need to create this from API
                onChange={(value) => formHandler("medicines", value)}
                value={formData.medicines}

              />
            </div>

            {/*  MEDICINE PLAN (Voice/Text Area) */}
            {voiceMode === "online" ? (
              <VoiceTextAreaOnline
                label="Medicine Plan"
                fieldKey="medicinePlan"
                value={formData.medicinePlan}
                onChange={(val) => formHandler("medicinePlan", val)}
                formHandler={formHandler}
                placeholder="E.g.: Take 1 tablet after breakfast daily for 5 days"
                driverId="form-medicines-plan"
                resetTrigger={resetTrigger}
              />
            ) : (
              <VoiceTextArea
                label="Medicine Plan"
                fieldKey="medicinePlan"
                value={formData.medicinePlan}
                onChange={(val) => formHandler("medicinePlan", val)}
                placeholder="E.g.: Take 1 tablet after breakfast daily for 5 days"
                driverId="form-medicines-plan"
              />
            )}



            {/* AI Suggestion Button - Professional Floating Button */}
            {
              (formData.primaryDiagnosis?.length > 0 || (formData.primaryComplain && formData.primaryComplain.trim() !== "")) && (
                <Button
                  type="primary"
                  icon={<BulbOutlined />}
                  onClick={() => setShowAIAssistant(true)}
                  className="fixed! top-10 z-500 right-10 shadow-lg hover:shadow-xl transition-all duration-300 rounded-full px-4 py-2 bg-linear-to-r from-purple-500 to-indigo-500 border-none text-white font-medium"
                  style={{
                    borderRadius: "16px",
                    transform: "translateY(-50%)",
                    padding: "10px 24px",
                    background: "linear-gradient(120deg, rgba(99, 102, 241, 0.9) 0%, rgba(139, 92, 246, 0.9) 100%)",
                    backdropFilter: "blur(10px)",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)"
                  }}
                // disabled={!(formData.primaryDiagnosis?.length > 0 || (formData.primaryComplain && formData.primaryComplain.trim() !== ""))}
                >
                  <div className="flex items-center gap-2">
                    <span className="hidden sm:inline">AI Suggestion</span>
                    <span className="sm:hidden">AI</span>
                  </div>
                </Button>
              )
            }



          </div>

          {/* <GetVoice formHandler={formHandler} resetTrigger={resetTrigger} /> */}
          {/* <GetVoice1 formHandler={formHandler} resetTrigger={resetTrigger} /> */}

          {/* NEXT BUTTON */}
          <div className="p-4 border-t border-gray-200 flex items-center gap-4 2xl:hidden">

            {/* TOKEN SELECT */}
            <div id="dropdown-select-token" className="flex-1">
              <Select
                allowClear
                showSearch
                placeholder="Select Token"
                optionFilterProp="label"
                className="w-full"
                options={skippedTokenListOptions}
                onChange={(value) => setSpecificSearchingToken(value)}
                value={specificSearchingToken}
                optionLabelProp="label"
                dropdownStyle={{
                  minWidth: '300px',
                  width: 'auto',
                  maxWidth: '90vw',
                  position: 'fixed'
                }}
                popupRender={(menu) => (
                  <div className="custom-select-dropdown max-h-96 overflow-y-auto">
                    {skippedTokenListOptions?.map((option) => (
                      <div
                        key={option.value}
                        className={`px-3 py-2 cursor-pointer hover:bg-gray-50 transition-colors duration-150 ${specificSearchingToken === option.value ? 'bg-blue-50' : ''
                          }`}
                        onClick={() => {
                          setSpecificSearchingToken(option.value);
                          // If you need to close dropdown, you might need to use Select's ref
                        }}
                      >
                        {option.labelWithBreaks}
                      </div>
                    ))}
                  </div>
                )}
              />
            </div>

            {/* MAIN ACTION BUTTON */}
            <div id="btn-start" className="flex-1">
              <Button
                type="primary"
                block
                onClick={
                  specificSearchingToken ? specificCallingHandler : nextHandler
                }
                loading={isNextLoading}
                disabled={disableNext}
              >
                {specificSearchingToken
                  ? "Specific Calling"
                  : currentPatientsData?.RECEIPTNO
                    ? "Next Patient"
                    : "START"}
              </Button>
            </div>

            {/* SKIP BUTTON */}
            <div id="btn-skip" className="flex-1 hidden md:block">
              <Button
                block
                className="!border-blue-500 !text-blue-500  hover:!border-blue-600 hover:!text-blue-600 hover:!bg-blue-50 active:!bg-blue-100 transition-all duration-200"
                onClick={skipHandler}
                loading={isSkipLoading}
                disabled={disableSkip}
              >
                Skip Patient
              </Button>
            </div>

          </div>

          <div className="flex items-center p-4 gap-4">

            <div
              id="btn-skip"
              className="border-t border-gray-200 gap-4 flex md:hidden"
            >
              <Button
                block
                className="!border-blue-500 !text-blue-500  hover:!border-blue-600 hover:!text-blue-600 hover:!bg-blue-50 active:!bg-blue-100 transition-all duration-200"
                onClick={skipHandler}
                loading={isSkipLoading}
                disabled={disableSkip}
              >
                Skip Patient
              </Button>

            </div>

            <div className="flex w-full 2xl:hidden gap-5">
              <BreakBtn desktop={false} />
            </div>

          </div>

          <PrintBtn />

        </div>

        {isCoolingDown && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-400 rounded-full px-3 py-1 fixed top-8 left-4">
            <span className="text-xs font-semibold text-red-700">Next in</span>
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-red-500 text-white text-xs font-bold">
              {cooldown}
            </span>
          </div>
        )}

      </div>

      {/* ADD VITALS MODAL */}
      <AddVitalsModal
        isOpen={isVitalsModalOpen}
        onClose={() => setIsVitalsModalOpen(false)}
        currentPatientsData={currentPatientsData}
        loginUserData={loginUserData}
        VITALS_CONFIG={VITALS_CONFIG}
        currentPatientsVitals={currentPatientsVitals}
        docPatientData={docPatientData}
      />

      <StopModal
        startBreak={startBreak}
        isOpen={isStopModalOpen}
        onClose={() => setIsStopModalOpen(false)}
        formData={formData}
        currentPatientsData={currentPatientsData}
        loginUserData={loginUserData}
        setFormData={setFormData}
        docPatientData={docPatientData}
      />


      {/* AiAssistant component ko is tarah call karo: */}
      <AiAssistant
        visible={showAIAssistant}
        onClose={() => setShowAIAssistant(false)}
        complaint={formData.primaryComplain}
        primaryDiagnosis={formData.primaryDiagnosis}
        currentPatient={currentPatientsData}
        currentVitals={{
          bloodPressure: currentPatientsVitals?.CBLOOD_PRESSURE,
          bloodSugar: currentPatientsVitals?.CBLOOD_SUGAR,
          weight: currentPatientsVitals?.CWEIGHT,
          height: currentPatientsVitals?.CHEIGHT,
          temperature: currentPatientsVitals?.CTEMPERATURE,
          pulse: currentPatientsVitals?.CPULSE,
          age: currentPatientsData?.AGE,
        }}
        // ✅ Lifted state
        aiResponse={aiResponse}
        setAiResponse={setAiResponse}
        aiVitalAlerts={aiVitalAlerts}
        setAiVitalAlerts={setAiVitalAlerts}
        onAddTests={(tests) => {
          const currentTests = formData.medicalTests || [];
          const uniqueTests = [...new Set([...currentTests, ...tests])];
          formHandler("medicalTests", uniqueTests);
          toast.success(`${tests.length} test(s) added`);
        }}
        onAddMedicines={handleAddMedicinesFromAI}
        onAddMedicinePlan={handleAddMedicinePlanFromAI}
        onAddTreatment={handleAddTreatmentFromAI}
        faculty={currentFaculty}
      />

    </div>

  );

};

export default memo(MidSection);
