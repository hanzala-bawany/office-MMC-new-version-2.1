import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Modal } from "antd";
import { LogoutOutlined, CloseOutlined, UserOutlined, SafetyOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import { logoutUser } from "../reduxToolKit/authSlice";
import logo from "../assets/MMC logo.png";
import NubitLogo from "../assets/nubit logo png.png";
import FormHeader from "../components/MedicalAssistant/FormHeader";
import FormBody from "../components/MedicalAssistant/FormBody";
import hospitraxLogo from "../assets/productLogoBgRemove.png";

const MedicalAssistant = () => {

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const loginUserData = JSON.parse(localStorage.getItem("loginUserData"));

    const handleLogout = () => {
        dispatch(logoutUser());
        toast.success("Logout Successful");
        navigate("/login");
    };

    const handleModalLogout = () => {
        setIsModalOpen(false);
        handleLogout();
    };

    const handlePrintReport = () => {

        // Check if patient data exists
        if (!selectedPatient) {
            toast.warning('No patient data available to print');
            return;
        }

        const reportData = {
            patient: selectedPatient
            //   vitals: patientsData?.patientVitals?.[0],
            //   formData: formData,
            //   doctorData: loginUserData,
            //   lastVisit: lastVisit
        };

        navigate('/prescriptionReport', {
            state: { reportData: reportData }
        });

    };

    // console.log(loginUserData, "....... loginUserData");
    // console.log(selectedPatient, "....... selectedPatient");


    return (
        <>
            {/* ── PAGE ROOT ── */}
            <div
                className="flex flex-col min-h-screen px-4 pb-7 pt-4"
                style={{
                    fontFamily: "'DM Sans', sans-serif",
                    background: "#f0f4ff",
                    backgroundImage: `radial-gradient(ellipse 80% 50% at 20% -10%, rgba(99,102,241,0.15) 0%, transparent 60%),radial-gradient(ellipse 60% 40% at 80% 110%, rgba(59,130,246,0.12) 0%, transparent 60%)`,
                }}
            >

                {/* HEADER */}
                <header className="flex-1 flex items-center justify-between mb-7">

                    <div className="flex items-center gap-4 [@media(min-width:3200px)]:gap-8 [@media(min-width:4400px)]:gap-12">

                        <img
                            src={hospitraxLogo}
                            alt="Hospitrax Logo"
                            className="w-22 4xl:w-30"
                        />
                        <div>
                            <h1 className="text-blue-600 text-2xl font-bold min-[2000px]:text-4xl [@media(min-width:3200px)]:text-5xl [@media(min-width:4400px)]:text-6xl tracking-wide drop-shadow">
                                Hospitrax
                            </h1>
                            <p className="text-gray-500 text-xs italic min-[2000px]:text-xl [@media(min-width:3000px)]:text-2xl [@media(min-width:4400px)]:text-3xl">
                                “Healthcare Management System”
                            </p>
                        </div>
                        
                    </div>

                    {selectedPatient && (
                        <button
                            onClick={handlePrintReport}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-200 hover:shadow-lg transition-all duration-200 cursor-pointer active:scale-[0.98]"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            <span>Print / Preview</span>
                        </button>
                    )}

                    {/* Logo pill - Clickable to open modal */}
                    <div
                        onClick={() => setIsModalOpen(true)}
                        className="cursor-pointer anim-slideDown flex flex-col items-center gap-3 px-4 py-2 rounded-full border border-indigo-500/50 bg-white/90 backdrop-blur shadow-md shadow-indigo-500/10 hover:shadow-lg hover:scale-105 transition-all duration-300"
                    >

                        <div className="flex items-center gap-3">

                            <img src={logo} alt="MMC Logo" className="h-12 w-12 object-contain rounded-full" />
                            <div className="text-right hidden sm:block">
                                <span style={{ fontFamily: "'Playfair Display', serif" }} className="text-lg font-semibold text-indigo-950 tracking-wide block">
                                    Memon Medical Complex
                                </span>
                                <div className="flex items-center gap-1 mt-0.5">
                                    <span className="text-[13px] font-medium text-indigo-600/80 tracking-wide">
                                        {loginUserData?.username}
                                    </span>
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                                </div>
                            </div>

                        </div>
                    </div>

                </header>

                {/* BODY */}
                <main className="flex-8 flex flex-col items-center justify-center">

                    {/* Form */}
                    <div className="anim-fadeUp w-full max-w-2xl h-max bg-white/97 rounded-3xl overflow-hidden border border-indigo-200/70" style={{ boxShadow: "0 12px 48px rgba(79,70,229,0.13), 0 2px 8px rgba(0,0,0,0.04)" }}>

                        {/* ── Form Header ── */}
                        <FormHeader selectedPatient={selectedPatient} />

                        {/* ── Form Body ── */}
                        <FormBody username={loginUserData?.username} selectedPatient={selectedPatient} setSelectedPatient={setSelectedPatient} />

                    </div>

                </main>

                {/* FOOTER */}
                <footer className="flex-1 flex justify-end items-center pt-5 pr-2">
                    <button
                        className="flex items-center gap-2 text-blue-500 hover:text-blue-700 text-sm font-medium transition-colors bg-transparent border-none"
                    >
                        Powered by
                        <img src={NubitLogo} alt="Nubit" className="w-10 object-contain" />
                    </button>
                </footer>

            </div>

            {/* Ant Design Modal */}
            <Modal
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                footer={null}
                centered
                width={400}
                closable={false}
                maskClosable={true}
                styles={{
                    content: {
                        borderRadius: '24px',
                        overflow: 'hidden',
                        padding: 0,
                    },
                    body: {
                        padding: 0,
                    }
                }}
            >
                <div className="bg-gradient-to-br from-indigo-50 to-blue-50">

                    {/* Modal Header */}
                    <div className="relative bg-gradient-to-r from-indigo-600 to-blue-600 px-6 py-4">
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white transition-colors"
                        >
                            <CloseOutlined className="text-lg cursor-pointer" />
                        </button>
                        <div className="flex items-center gap-3">
                            <div className="bg-white/20 p-2 rounded-full">
                                <SafetyOutlined className="text-white text-xl" />
                            </div>
                            <div>
                                <h3 className="text-white font-bold text-lg m-0">Memon Medical Complex</h3>
                                <p className="text-white/80 text-sm m-0">Hospital Management System</p>
                            </div>
                        </div>
                    </div>

                    {/* Modal Body */}
                    <div className="p-6">

                        {/* Warning Message */}
                        <div className="mb-6 p-5 bg-amber-50 rounded-2xl border border-amber-200 shadow-sm">

                            {/* Top Warning */}
                            <div className="flex items-center justify-center gap-2 text-amber-700 text-sm font-medium">
                                <ExclamationCircleOutlined className="text-lg" />
                                <span>Are you sure you want to logout?</span>
                            </div>

                            {/* User Info */}
                            <div className="mt-4 flex items-center justify-center gap-3 bg-white border border-gray-200 rounded-xl px-4 py-2 shadow-sm">
                                <div className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-100 text-blue-600">
                                    <UserOutlined />
                                </div>
                                <span className="text-gray-800 font-semibold text-sm tracking-wide">
                                    {loginUserData?.username}
                                </span>
                            </div>

                            {/* Footer Text */}
                            <p className="text-xs text-gray-500 mt-3 text-center">
                                You will be redirected to the login page.
                            </p>

                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="flex-1 px-4 py-2.5 cursor-pointer rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleModalLogout}
                                className="flex-1 px-4 py-2.5 rounded-xl cursor-pointer bg-red-600 text-white font-medium hover:bg-red-700 transition-all flex items-center justify-center gap-2"
                            >
                                <LogoutOutlined />
                                Logout
                            </button>
                        </div>

                    </div>

                </div>

            </Modal>

        </>
    );
};

export default MedicalAssistant;






























