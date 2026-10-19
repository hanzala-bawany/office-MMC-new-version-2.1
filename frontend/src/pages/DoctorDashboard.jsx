import { useCallback, useEffect, useState } from "react";
import { base_URL } from "../../src/utills/baseUrl.js";
import axios from "axios";
import Header from "../components/doctorDashboard/Header.jsx";
import MidSection from "../components/doctorDashboard/MidSection.jsx";
import HistoryTable from "../components/doctorDashboard/HistoryTable.jsx";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { socket } from "../socket/socket.js";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import Footer from "../components/doctorDashboard/Footer.jsx";
import { logoutUser } from "../reduxToolKit/authSlice.js";
import { useNavigate } from "react-router-dom";
import LabReportsSection from "../components/doctorDashboard/LabReportsSection.jsx";


const DoctorDashboard = () => {


  const [patientsData, setPatientsData] = useState([]);
  const [currentPatientHistoryData, setCurrentPatientHistoryData] = useState([]);
  const currentPatientHistory = currentPatientHistoryData?.data || [];
  const lastVisit = currentPatientHistoryData?.lastVisit || {};
  const loginUserData = JSON.parse(localStorage.getItem("loginUserData"));
  const isCancelClick = useSelector(
    (state) => state?.doctorSlice?.refreshPatients,
  );
  const driverObj = driver({
    showProgress: true,
    animate: true,
    overlayColor: "#0052cc",
    overlayOpacity: 0.5,
    smoothScroll: true,
    stagePadding: 8,
    popoverClass: "custom-driver-popover",
    steps: [
      {
        element: "#stat-today-appointments",
        popover: {
          title: "📅 Today's Appointments",
          description: "Total appointments booked by patients for today.",
          side: "bottom",
        },
      },
      {
        element: "#stat-patients-checked",
        popover: {
          title: "✅ Patients Checked",
          description:
            "Patients who have been seen and their status is Completed.",
          side: "bottom",
        },
      },
      {
        element: "#stat-patients-waiting",
        popover: {
          title: "⏳ Patients Waiting",
          description: "Patients currently sitting in the waiting room.",
          side: "bottom",
        },
      },
      {
        element: "#stat-patients-skipped",
        popover: {
          title: "⏭️ Patients Skipped",
          description:
            "Patients who were skipped — doctor can call them again later.",
          side: "bottom",
        },
      },
      {
        element: "#vitals-section",
        popover: {
          title: "🩺 Patient Vitals",
          description:
            "Once a patient starts, their BP, Sugar, Weight, Height, Temp and Pulse appear here.",
          side: "top",
        },
      },
      {
        element: "#btn-start",
        popover: {
          title: "▶️ START Button",
          description:
            "Press START to call the first patient. After that, it turns into a NEXT button.",
          side: "top",
        },
      },
      {
        element: "#btn-skip",
        popover: {
          title: "🔀 Skip Patient",
          description:
            "Skip the current patient — they move to the Skipped list and the next waiting patient is called.",
          side: "top",
        },
      },
      {
        element: "#dropdown-select-token",
        popover: {
          title: "🎯 Select Token",
          description:
            "Directly call any waiting or skipped patient — regardless of their position in the queue.",
          side: "top",
        },
      },
      {
        element: "#btn-repeat-call",
        popover: {
          title: "🔁 Repeat Call",
          description:
            "Announce the current patient again on the display screen — in case they didn't hear the first time.",
          side: "top",
        },
      },
      {
        element: "#btn-add-vitals",
        popover: {
          title: "📊 Add / Edit Vitals",
          description:
            "Enter or update patient vitals — Blood Pressure, Sugar, Weight, and more.",
          side: "bottom",
        },
      },
      {
        element: "#form-primary-diagnosis",
        popover: {
          title: "🏥 Primary Diagnosis",
          description:
            "Type or speak the diagnosis. Once saved, it shows up in the dropdown next time automatically.",
          side: "left",
        },
      },
      {
        element: "#form-recommended-tests",
        popover: {
          title: "🔬 Recommended Tests",
          description:
            "Select or type tests. Previously used tests appear in the dropdown for quick selection.",
          side: "left",
        },
      },
      {
        element: "#form-treatment",
        popover: {
          title: "💊 Treatment / Medication",
          description:
            "Write medicines or treatment — use keyboard or press the mic button to speak it.",
          side: "left",
        },
      },
      {
        element: "#form-primary-complain",
        popover: {
          title: "📝 Patient Complaint",
          description:
            "Record what the patient is complaining about — voice input is available here too.",
          side: "left",
        },
      },
      {
        element: "#form-medicines",
        popover: {
          title: "📝 Patient Medicines",
          description:
            "Add or select the medicines prescribed to the patient. You can also type to create new entries.",
          side: "left",
        },
      },
      {
        element: "#form-medicines-plan",
        popover: {
          title: "📝 Medicines Plan",
          description:
            "Define the treatment plan . voice input is available here too.",
          side: "left",
        },
      },
      {
        element: "#doctor-name-btn",
        popover: {
          title: "👨‍⚕️ Doctor Options",
          description:
            "Click your name to see two options: 'Cancel All' removes all waiting/skipped patients, and 'Logout' signs you out.",
          side: "bottom",
        },
      },
    ],
  });
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    primaryDiagnosis: [],
    medicalTests: [],
    treatment: "",
    primaryComplain: "",
    medicines: [],
    medicinePlan: "",
  });


  // console.log(isCancelClick, "<<<<<<< isCancelClick");
  // console.log(loginUserData, "<<<<<<< loginUserData");
  // console.log(isNextBtnClick, "<<<<<<< isNextBtnClick");
  // console.log(driverObj, "<<<<<<< driverObj");
  // console.log(isCancelClick, "<<<<<<< isCancelClick");
  // console.log(currentPatientHistory, "<<<<<<< currentPatientHistory");
  // console.log(patientsData, "<<<<<<< patientsData");
  // console.log(lastVisit, "<<<<<<< lastVisit");


  const logout = async () => {

    dispatch(logoutUser());
    toast.success("Logout Scuccessful");
    navigate("/login");

  };

  const foo = useCallback(async () => {

    try {
      const res = await axios.get(`${base_URL}/api/opd/doctor-patients/${loginUserData?.doctorId}`,);
      // console.log(res, "res of get DocotrDetail by id");
      setPatientsData(res?.data?.data);
      if (res?.data?.data?.isLoggedIn === 0) {
        console.log("isLoggedIn 0 ho chuka he >>>>>>>>> ", res?.data?.data?.isLoggedIn == 0);
        logout()
      }

    } catch (err) {
      // console.log(err, "error in get faculty");
      toast.error(err?.message);
    }

  }, [loginUserData?.doctorId]);


  const getCurrentPatientHistory = useCallback(async () => {

    try {
      const res = await axios.get(
        `${base_URL}/api/opd/getPatientsHistory?mrNum=${patientsData?.patients?.[0]?.MRNO}&doctorId=${loginUserData?.doctorId}`,
      );
      // console.log(res, "res of get current patient history by id");
      setCurrentPatientHistoryData(res?.data);
    } catch (err) {
      // console.log(err, "error in get faculty");
      toast.error(err?.message);
    }
  }, [patientsData?.patients?.[0]?.MRNO]);


  const specificCallingHandler = useCallback(async (tokenNo) => {

    try {
      const res = await axios.post(
        `${base_URL}/api/opd/doctor/patient-specific-call`,
        {
          doctorId: loginUserData?.doctorId,
          tokenNo: tokenNo || null,
          remarks: formData?.primaryComplain || null,
          primaryDiagnosis: formData?.primaryDiagnosis || null,
          medicalTests: formData?.medicalTests || null,
          treatment: formData?.treatment || null,
          medicine: formData?.medicines || null,
          medicalPlan: formData?.medicinePlan || null,
        }
      );
      await foo();
      if (patientsData?.patientsRemaining > 0 || patientsData?.patientsSkipped > 0) {
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
    } catch (err) {
      toast.error(err?.message);
    }

  }, [formData, loginUserData?.doctorId]);

  const startTour = () => {
    driverObj.drive();
  };

  useEffect(() => {
    foo();
    socket.on("opdUpdated", () => {
      foo();
    });
  }, [isCancelClick]);

  useEffect(() => {
    getCurrentPatientHistory();
    // socket.on("opdUpdated", () => {
    //   getCurrentPatientHistory();
    // });
  }, [patientsData?.patients?.[0]?.MRNO]);



  return (
    <div className="flex flex-col min-h-screen  bg-gradient-to-br from-[#e3f1ff] via-[#e3efff] to-[#FFFFFF] p-4 md:p-8 relative ">
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z' fill='%2300aaff'/%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <div className="absolute top-0 left-0 w-full h-27 bg-linear-to-r from-[#0052cc] to-[#00b0ff] z-0 rounded-b-[40px]" />

      {/* Header */}
      <Header
        onStartTour={startTour}
        doctorData={loginUserData}
        patientsData={patientsData}
        loginUserData={loginUserData}
        specificCallingHandler={specificCallingHandler}
      />

      {/* Middle Section */}
      <MidSection
        patientsData={patientsData}
        docPatientData={foo}
        lastVisit={lastVisit}
        specificCallingHandlerParent={specificCallingHandler}
        formData={formData}
        setFormData={setFormData}
      />

      {/* History */}
      <HistoryTable currentPatientHistory={currentPatientHistory} lastVisit={lastVisit} />

      <LabReportsSection mrNo={patientsData?.patients?.[0]?.MRNO} />

      {/* <Footer /> */}

    </div>
  );
};

export default DoctorDashboard;
