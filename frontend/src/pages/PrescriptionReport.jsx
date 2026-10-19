import { useCallback, useEffect, useRef, useState } from "react";
import ReportsLayout from "../Layouts/ReportsLayout";
import axios from "axios";
import { base_URL } from "../utills/baseUrl";
import { useLocation, useNavigate } from "react-router-dom";
import { Button, Space, Typography, Spin, Empty, Tag, Divider, Card } from "antd";
import {
    ArrowLeftOutlined,
    PrinterOutlined,
    FilePdfOutlined,
    UserOutlined,
    CalendarOutlined,
    IdcardOutlined,
    PhoneOutlined,
    MedicineBoxOutlined,
    HeartOutlined,
    BarcodeOutlined,
    LoadingOutlined
} from "@ant-design/icons";
import { toast } from "react-toastify";
import { useReactToPrint } from 'react-to-print';



const { Title, Text } = Typography;


const PrescriptionReport = () => {

    const [currentPatientData, setCurrentPatientData] = useState(null)
    const [loadingData, setLoadingData] = useState(false)
    const navigate = useNavigate();
    const location = useLocation();
    const printRef = useRef();
    const patientDetail = location.state?.reportData?.formData;
    const patientData = location.state?.reportData?.patient;


    useEffect(() => {
        getCurrentPatientData();
    }, []);


    const getCurrentPatientData = async () => {

        setLoadingData(true)

        try {
            const res = await axios.get(`${base_URL}/api/opd/patient-full-details/${patientData?.RECEIPTNO}`,);
            // console.log(res, "res of get DocotrDetail by id");
            setCurrentPatientData(res?.data?.data);
        }
        catch (err) {
            // console.log(err, "error in get faculty");
            toast.error(err?.message);
            setCurrentPatientData(null);
        }
        finally {
            setLoadingData(false)
        }

    }


    const handleBack = () => {
        navigate(-1);
    };

    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: `Prescription_${currentPatientData?.PATIENTNAME || 'Report'}`,
    });


    if (loadingData) {

        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
                <div className="text-center">
                    <Spin
                        indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />}
                        tip="Loading Patient Report..."
                        size="large"
                        className="mb-4"
                    />
                    <div className="mt-8 flex flex-col items-center gap-2">
                        <div className="animate-pulse flex space-x-4">
                            <div className="h-3 w-3 bg-blue-400 rounded-full"></div>
                            <div className="h-3 w-3 bg-blue-400 rounded-full animation-delay-200"></div>
                            <div className="h-3 w-3 bg-blue-400 rounded-full animation-delay-400"></div>
                        </div>
                        <Text type="secondary" className="text-sm">
                            Fetching patient details...
                        </Text>
                    </div>
                </div>
            </div>
        );
    }
    else if (!currentPatientData) {

        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="text-6xl mb-4">📄</div>
                    <Title level={4}>No Report Data Available</Title>
                    <Text type="secondary">Please go back and generate a report</Text>
                    <br />
                    <Button type="primary" onClick={handleBack} className="mt-4">
                        Go Back
                    </Button>
                </div>
            </div>
        );
    }


    // console.log(currentPatientData, "currentPatientData ..........");



    return (
        <>
            <div className="min-h-screen bg-gray-100 p-6 flex items-center justify-center">

                {/* Action Buttons - Hidden when printing */}
                <div className="fixed top-4 right-4 z-50 flex gap-2 w-full justify-end">
                    <Button
                        type="default"
                        icon={<ArrowLeftOutlined />}
                        onClick={handleBack}
                        className="shadow-md bg-white"
                    >
                        Back
                    </Button>
                    <Button
                        type="primary"
                        icon={<PrinterOutlined />}
                        onClick={() => handlePrint()}
                        className="shadow-md bg-blue-600 hover:bg-blue-700"
                    >
                        Print
                    </Button>
                    {/* <Button
                        type="primary"
                        icon={<FilePdfOutlined />}
                        className="shadow-md bg-red-600 hover:bg-red-700"
                    >
                        PDF
                    </Button> */}
                </div>

                {/* Report Content */}
                <div className="mt-12 p-6 flex items-center justify-center ">

                    <div ref={printRef} >
                        <ReportsLayout Title="Medical Prescription" currentPatientData={currentPatientData}>

                            <div className="p-2">

                                {/* Medical Details - Unified Card */}
                                <div className="border border-gray-200 rounded-lg p-4 mb-6">

                                    <Title level={5} className="text-gray-700 m-0 mb-4 flex items-center gap-2">
                                        <MedicineBoxOutlined className="text-blue-500" />
                                        Medical Details
                                    </Title>

                                    <div className="space-y-4">
                                        {/* Treatment */}
                                        <div className="flex flex-col">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-semibold text-gray-600 min-w-[130px]">💊 Treatment</span>
                                                <div className="flex-1 bg-gray-50 px-3 py-2 rounded-lg border border-gray-100">
                                                    <Text className="text-sm text-gray-700 whitespace-pre-wrap">
                                                        {patientDetail?.treatment || currentPatientData?.TREATMENT || (
                                                            <span className="text-gray-400 italic">No treatment recorded</span>
                                                        )}
                                                    </Text>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Medicine Plan */}
                                        <div className="flex flex-col">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-semibold text-gray-600 min-w-[130px]">📋 Medicine Plan</span>
                                                <div className="flex-1 bg-blue-50 px-3 py-2 rounded-lg border border-blue-100">
                                                    <Text className="text-sm text-gray-700 whitespace-pre-wrap">
                                                        {patientDetail?.medicinePlan || currentPatientData?.MEDICAL_PLAN || (
                                                            <span className="text-gray-400 italic">No medicine plan specified</span>
                                                        )}
                                                    </Text>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Medicines Prescribed */}
                                        <div className="flex flex-col">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-semibold text-gray-600 min-w-[130px]">💊 Medicines</span>
                                                <div className="flex-1 bg-green-50 px-3 py-2 rounded-lg border border-green-100">
                                                    {(patientDetail?.medicines?.length > 0 || currentPatientData?.MEDICINE) ? (
                                                        <div className="flex flex-wrap gap-1">
                                                            {(() => {
                                                                const medicines = patientDetail?.medicines?.length > 0
                                                                    ? patientDetail.medicines
                                                                    : currentPatientData?.MEDICINE?.split(',') || [];
                                                                return medicines.map((med, idx) => (
                                                                    <Tag key={idx} color="green" className="text-sm">
                                                                        {typeof med === 'string' ? med.trim() : med}
                                                                    </Tag>
                                                                ));
                                                            })()}
                                                        </div>
                                                    ) : (
                                                        <span className="text-gray-400 italic text-sm">No medicines prescribed</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Primary Diagnosis */}
                                        {/* <div className="flex flex-col">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-semibold text-gray-600 min-w-[130px]">🏥 Primary Diagnosis</span>
                                                <div className="flex-1 bg-purple-50 px-3 py-2 rounded-lg border border-purple-100">
                                                    {(patientDetail?.primaryDiagnosis?.length > 0 || currentPatientData?.PRIMARY_DIAGNOSIS) ? (
                                                        <div className="flex flex-wrap gap-1">
                                                            {(() => {
                                                                const diagnoses = patientDetail?.primaryDiagnosis?.length > 0
                                                                    ? patientDetail.primaryDiagnosis
                                                                    : currentPatientData?.PRIMARY_DIAGNOSIS?.split(',') || [];
                                                                return diagnoses.map((diag, idx) => (
                                                                    <Tag key={idx} color="purple" className="text-sm">
                                                                        {typeof diag === 'string' ? diag.trim() : diag}
                                                                    </Tag>
                                                                ));
                                                            })()}
                                                        </div>
                                                    ) : (
                                                        <span className="text-gray-400 italic text-sm">Not recorded yet</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div> */}

                                        {/* Medical Tests */}
                                        <div className="flex flex-col">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-semibold text-gray-600 min-w-[130px]">🔬 Medical Tests</span>
                                                <div className="flex-1 bg-orange-50 px-3 py-2 rounded-lg border border-orange-100">
                                                    {(patientDetail?.medicalTests?.length > 0 || currentPatientData?.MEDICAL_TESTS) ? (
                                                        <div className="flex flex-wrap gap-1">
                                                            {(() => {
                                                                const tests = patientDetail?.medicalTests?.length > 0
                                                                    ? patientDetail.medicalTests
                                                                    : currentPatientData?.MEDICAL_TESTS?.split(',') || [];
                                                                return tests.map((test, idx) => (
                                                                    <Tag key={idx} color="orange" className="text-sm">
                                                                        {typeof test === 'string' ? test.trim() : test}
                                                                    </Tag>
                                                                ));
                                                            })()}
                                                        </div>
                                                    ) : (
                                                        <span className="text-gray-400 italic text-sm">No tests recommended</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Primary Complaint / Clinical Remarks */}
                                        {/* <div className="flex flex-col">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-semibold text-gray-600 min-w-[130px]">📝 Primary Complaint</span>
                                                <div className="flex-1 bg-gray-50 px-3 py-2 rounded-lg border border-gray-100">
                                                    <Text className="text-sm text-gray-700 whitespace-pre-wrap">
                                                        {patientDetail?.primaryComplain || currentPatientData?.CLINICAL_REMARKS || (
                                                            <span className="text-gray-400 italic">No primary complaint</span>
                                                        )}
                                                    </Text>
                                                </div>
                                            </div>
                                        </div> */}

                                    </div>

                                </div>

                                {/* Vitals Section */}
                                <div className="mb-6">

                                    <div className="border border-gray-200 rounded-lg p-4">

                                        <Title level={5} className="text-gray-700 m-0 mb-3 flex items-center gap-2">
                                            🩺 Patient Vitals
                                            <Tag color="blue" className="text-xs">Current</Tag>
                                        </Title>

                                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                                            <div className="bg-pink-50 p-3 rounded-lg border border-pink-100 text-center">
                                                <Text className="text-xs text-pink-600 block">Blood Pressure</Text>
                                                <Text className="text-sm font-semibold text-pink-800">
                                                    {currentPatientData?.BLOOD_PRESSURE || 'N/A'}
                                                </Text>
                                            </div>
                                            <div className="bg-green-50 p-3 rounded-lg border border-green-100 text-center">
                                                <Text className="text-xs text-green-600 block">Blood Sugar</Text>
                                                <Text className="text-sm font-semibold text-green-800">
                                                    {currentPatientData?.BLOOD_SUGAR || 'N/A'}
                                                </Text>
                                            </div>
                                            <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 text-center">
                                                <Text className="text-xs text-blue-600 block">Weight</Text>
                                                <Text className="text-sm font-semibold text-blue-800">
                                                    {currentPatientData?.WEIGHT || 'N/A'} kg
                                                </Text>
                                            </div>
                                            <div className="bg-purple-50 p-3 rounded-lg border border-purple-100 text-center">
                                                <Text className="text-xs text-purple-600 block">Height</Text>
                                                <Text className="text-sm font-semibold text-purple-800">
                                                    {currentPatientData?.HEIGHT || 'N/A'} cm
                                                </Text>
                                            </div>
                                            <div className="bg-orange-50 p-3 rounded-lg border border-orange-100 text-center">
                                                <Text className="text-xs text-orange-600 block">Temperature</Text>
                                                <Text className="text-sm font-semibold text-orange-800">
                                                    {currentPatientData?.TEMPERATURE || 'N/A'} °F
                                                </Text>
                                            </div>
                                            <div className="bg-red-50 p-3 rounded-lg border border-red-100 text-center">
                                                <Text className="text-xs text-red-600 block">Pulse</Text>
                                                <Text className="text-sm font-semibold text-red-800">
                                                    {currentPatientData?.PULSE || 'N/A'} bpm
                                                </Text>
                                            </div>
                                        </div>


                                    </div>
                                </div>

                            </div>

                        </ReportsLayout>

                    </div>

                </div>

            </div>
        </>
    )
}

export default PrescriptionReport