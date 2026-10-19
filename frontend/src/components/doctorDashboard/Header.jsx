import { Avatar, Button, Card, Modal, Badge, Spin } from "antd";
import { memo, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import logo from "../../assets/MMC logo.png";
import docotorAvatar from "../../assets/maleDoctor.png";
import { logoutUser } from "../../reduxToolKit/authSlice";
import { toggleRefreshPatients } from "../../reduxToolKit/doctorSlice";
import {
  FaSignOutAlt,
  FaTimesCircle,
  FaCalendarAlt,
  FaUserCheck,
  FaUserClock,
  FaUserTimes,
  FaFileInvoiceDollar,
} from "react-icons/fa";
import { base_URL } from "../../utills/baseUrl";
import axios from "axios";
import { socket } from "../../socket/socket";



const Header = ({ doctorData, patientsData, onStartTour, loginUserData, specificCallingHandler }) => {

  // console.log(patientsData, "patientsData >>>>>>>>>>>");
  // console.log(doctorData, "doctorData >>>>>>>>>>>");

  const [openProfile, setOpenProfile] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [patientModal, setPatientModal] = useState(null); // "waiting" | "skipped" | null
  const [callingToken, setCallingToken] = useState(null); // loading state per patient
  const stats = [
    {
      id: 1,
      driverId: "stat-today-appointments",
      title: "Today Appointments",
      value: patientsData?.todayAppointments,
      icon: <FaCalendarAlt />,
      onClick: null, // clickable nahi
    },
    {
      id: 2,
      driverId: "stat-patients-checked",
      title: "Patients Checked",
      value: patientsData?.patientsChecked,
      icon: <FaUserCheck />,
      onClick: null,
    },
    {
      id: 3,
      driverId: "stat-patients-waiting",
      title: "Patients Waiting",
      value: patientsData?.patientsRemaining,
      icon: <FaUserClock />,
      onClick: () => setPatientModal("waiting"), // ✅ clickable
    },
    {
      id: 4,
      driverId: "stat-patients-skipped",
      title: "Patients Skipped",
      value: patientsData?.patientsSkipped,
      icon: <FaUserTimes />,
      onClick: () => setPatientModal("skipped"), // ✅ clickable
    },
  ];


  const logoutHandler = async () => {

    try {
      setLogoutLoading(true);
      const res = await axios.post(`${base_URL}/api/auth/logout`, {
        doctorId: doctorData?.doctorId,
      });
      // console.log(res, "res of logout Handler by id");


    } catch (err) {
      console.log(err, "error in next Handler");
      toast.error(err?.message);
    } finally {
      setLogoutLoading(false);
    }

    dispatch(logoutUser());
    toast.success("Logout Scuccessful");
    navigate("/login");
  };

  const waitingList = patientsData?.skippedTokenList?.filter(p =>
    p.TOKENNO?.toString().includes("waiting")
  ) || [];

  const skippedList = patientsData?.skippedTokenList?.filter(p =>
    !p.TOKENNO?.toString().includes("waiting")
  ) || [];

  const handleCallPatient = async (patient) => {
    // Token number se sirf number nikalo: "1 (waiting)" → 1
    const rawToken = patient.TOKENNO?.toString().split(" ")[0];
    const tokenNo = Number(rawToken);

    setCallingToken(tokenNo);
    await specificCallingHandler(tokenNo);
    setCallingToken(null);
    setPatientModal(null); // modal band karo
  };

  // Patient list modal ka content
  const PatientListModal = ({ type }) => {

    const list = type === "waiting" ? waitingList : skippedList;
    const title = type === "waiting" ? "⏳ Waiting Patients" : "⏭️ Skipped Patients";
    const emptyMsg = type === "waiting" ? "Koi patient wait nahi kar raha" : "Koi patient skip nahi hua";
    const badgeColor = type === "waiting" ? "blue" : "orange";

    return (
      <Modal
        open={patientModal === type}
        onCancel={() => setPatientModal(null)}
        footer={null}
        centered
        width={480}
        title={
          <div className="flex items-center gap-2 text-lg font-bold">
            {type === "waiting"
              ? <FaUserClock className="text-blue-500" />
              : <FaUserTimes className="text-orange-500" />
            }
            {title}
            <Badge count={list.length} color={badgeColor} />
          </div>
        }
      >
        {
          list.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              <p className="text-4xl mb-3">🙌</p>
              <p>{emptyMsg}</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3 max-h-[60vh] overflow-y-auto py-2 pr-1">
              {
                list?.map((patient) => {
                  const tokenNo = Number(patient.TOKENNO?.toString().split(" ")[0]);
                  const isLoading = callingToken === tokenNo;

                  return (
                    <div
                      key={patient.TOKENNO}
                      className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200"
                    >
                      {/* Left: Patient Info */}
                      <div className="flex items-center gap-3">
                        {/* Token Badge */}
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-sm ${type === "waiting" ? "bg-blue-500" : "bg-orange-500"}`}>
                          {tokenNo}
                        </div>

                        <div>
                          <p className="font-semibold text-gray-800 text-sm">
                            {patient.PATIENTNAME || "N/A"}
                          </p>
                          <div className="flex gap-3 text-xs text-gray-500 mt-0.5">
                            <span>Age: {patient.AGE || "N/A"}</span>
                            <span>•</span>
                            <span>{patient.GENDER || "N/A"}</span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Call Button */}
                      <Button
                        type="primary"
                        size="small"
                        loading={isLoading}
                        onClick={() => handleCallPatient(patient)}
                        className={type === "waiting"
                          ? "bg-blue-500 border-none"
                          : "bg-orange-500 border-none hover:bg-orange-600"
                        }
                      >
                        {isLoading ? "Calling..." : "Call"}
                      </Button>
                    </div>
                  );
                })}
            </div>
          )
        }
      </Modal>
    );
  };

  useEffect(() => {
    socket.on(`${loginUserData?.doctorId}`, () => {
      logoutHandler();
    });
  }, []);



  return (
    <div className="flex flex-col 2xl:flex-row 2xl:items-center 2xl:gap-25 w-full justify-between">

      <Modal open={openProfile} onCancel={() => setOpenProfile(false)} footer={null} centered width={400} >

        <div className="flex flex-col items-center text-center py-4">
          <h2 className="text-xl font-bold text-slate-800 ">
            {" "}
            {doctorData?.name || "Doctor Name"}{" "}
          </h2>

          <p className="text-slate-400 font-medium italic underline underline-offset-4 decoration-blue-200 text-sm">
            {" "}
            {doctorData?.faculty || "Consultant"}{" "}
          </p>

          <div className="w-full flex items-center justify-between bg-slate-50 rounded-2xl p-2 shadow-sm border border-slate-100 mb-6 mt-2">
            <span className="text-sm text-slate-500 font-medium">
              Patients Cancelled
            </span>

            <span className="px-4 py-1 rounded-full bg-red-100 text-red-600 font-semibold text-lg shadow-sm">
              {patientsData?.patientsCanceled || 0}
            </span>
          </div>

          <Button
            block
            icon={<FaFileInvoiceDollar />}
            onClick={() => {
              setOpenProfile(false);
              navigate("/doctorDashboard/report");
            }}
            className="rounded-xl flex items-center justify-center gap-2 mb-2 border-green-400 text-green-600 hover:bg-green-50"
          >
            Generate &amp; Download Report
          </Button>

          {/* 👇 Help Tour Button — modal band karke tour start karega */}
          <Button
            block
            icon={<span>❓</span>}
            onClick={() => {
              setOpenProfile(false);     // pehle modal band karo
              setTimeout(() => {
                onStartTour();         // thodi delay ke baad tour shuru
              }, 300);
            }}
            className="rounded-xl flex items-center justify-center gap-2 mb-2 border-blue-400 text-blue-600 hover:bg-blue-50"
          >
            Take a Tour / Help Guide
          </Button>

          <Button
            danger
            type="primary"
            block
            size="medium"
            icon={<FaSignOutAlt />}
            onClick={logoutHandler}
            className="rounded-xl flex items-center justify-center gap-2 mt-4"
          >
            Logout Securely
          </Button>

        </div>

      </Modal>

      <PatientListModal type="skipped" />
      <PatientListModal type="waiting" />

      <div className="flex 2xl:flex-col justify-between items-center 2xl:items-start gap-4 mb-8 2xl:w-fit ">

        <div className="backdrop-blur-md py-2 px-2 sm:px-4 rounded-full border flex gap-4 justify-center items-center border-blue-600 bg-white z-10">
          <img
            src={logo}
            alt="logo"
            className="h-12 min-[2000px]:h-16 [@media(min-width:3000px)]:h-18  [@media(min-width:4400px)]:h-30 w-12 min-[2000px]:w-16 [@media(min-width:3000px)]:w-18 [@media(min-width:4400px)]:w-30 object-contain"
          />

          <h1 className="text-xl  lg:text-2xl    font-bold hidden sm:block  tracking-wide drop-shadow">
            Memon Medical Complex
          </h1>
        </div>

        <div
          id="doctor-name-btn"
          onClick={() => setOpenProfile(true)}
          className=" flex items-center gap-3 px-3 py-1.5  rounded-full  shadow-lg  cursor-pointer  transition-all duration-100 hover:shadow-xl  border border-blue-600 bg-white z-10"
        >

          {/* Avatar */}
          <div className="relative">
            <div className="w-9 h-9 rounded-full border border-gray-400 p-1 flex items-center justify-center bg-white">
              <img
                className="w-full h-full object-cover rounded-full"
                src={docotorAvatar}
                alt="Doctor Avatar"
              />
            </div>
            <span className="z-10 absolute bottom-0 right-0 w-2 h-2 bg-emerald-500 rounded-full ring-2 ring-white"></span>
          </div>

          {/* Info */}
          <div className="flex flex-col leading-tight">
            <span className="text-md font-bold text-slate-800">
              {doctorData?.name || "Doctor Name"}
            </span>
          </div>

        </div>

      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2  lg:grid-cols-4  gap-6 mb-8">

        {
          stats?.map((s) => (
            <div
              id={s?.driverId}
              key={s?.id}
              onClick={s.onClick}
              className={`relative p-[2px] rounded-2xl  bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 ${s.onClick && "cursor-pointer"} `}
            >
              <div className="rounded-2xl bg-white backdrop-blur-xl p-5 h-full  transition-all duration-300  group-hover:scale-[1.03] group-hover:shadow-2xl">
                <div className="flex items-center gap-5">
                  {/* Icon Bubble */}
                  <div className=" w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100  text-blue-700 text-xl shadow-inner">
                    {s?.icon || "👨‍⚕️"}
                  </div>

                  {/* Text */}
                  <div className="flex flex-col">
                    <p className="text-gray-500 font-medium text-lg text-start">
                      {s?.title || "Not yet"}
                    </p>

                    <p className="text-3xl font-extrabold text-slate-800 leading-tight">
                      {s?.value || 0}
                    </p>
                  </div>
                </div>

                {/* Glow on hover */}
                <div className=" absolute inset-0 rounded-2xl opacity-0  group-hover:opacity-100 transition bg-gradient-to-r from-blue-400/10 to-purple-400/10 pointer-events-none" />
              </div>
            </div>
          ))
        }

      </div>

    </div>
  );
};

export default memo(Header);
