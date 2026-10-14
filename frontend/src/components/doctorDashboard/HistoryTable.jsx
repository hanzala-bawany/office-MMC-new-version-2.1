import {
  FaFileMedical,
  FaNotesMedical,
  FaFlask,
  FaXRay,
  FaFolderOpen,
  FaMicroscope,
  FaHistory,
  FaHeartbeat,
  FaPills,
  FaSyringe,
  FaClock,
  FaUserMd,
} from "react-icons/fa";
import { Card, Button, Table, Modal, Tag, Tabs, Typography } from "antd";
import { useState } from "react";
import ReportsLayout from "../../Layouts/ReportsLayout";
import CBCReport from "../PatientHistory/CBCReport";
import UrineReport from "../PatientHistory/UrineReport";
import KidneyFunction from "../PatientHistory/KidneyFunction";


const { Title, Text } = Typography;



const HistoryTable = ({ currentPatientHistory, lastVisit }) => {

  const [openReport, setOpenReport] = useState(null);
  const [openVitals, setOpenVitals] = useState(false);
  const [openTreatment, setOpenTreatment] = useState(false);
  const card = "rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 themeBoxShadow";
  const [openPatientDetail, setOpenPatientDetail] = useState(false);
  const [selectedHistory, setSelectedHistory] = useState(null);
  const [activeReportTab, setActiveReportTab] = useState("cbc");


  console.log(currentPatientHistory, "currentPatientHistory ,,,,,,,,,,,");
  // console.log(selectedHistory, "selectedHistory ,,,,,,,,,,,");
  // console.log(lastVisit, "lastVisit ,,,,,,,,,,,");


  const openDetailModal = (record) => {
    setSelectedHistory(record);
    setOpenPatientDetail(true);
  };

  const openVitalsModal = (openVitalsModal) => {
    setSelectedHistory(openVitalsModal);
    setOpenVitals(true);
  };

  const openReportModal = (record) => {
    setSelectedHistory(record);
    setOpenReport(true);
    setActiveReportTab("cbc");
  };


  const historyColumns = [
    { title: "Date", dataIndex: "VISIT_DATE" },
    { title: "Patient", dataIndex: "PATIENTNAME" },
    {
      title: "Vitals",
      render: (_, rowData) => (
        <Button
          icon={<FaHeartbeat />}
          className="flex items-center gap-2 border-blue-500 text-blue-500 "
          onClick={() => openVitalsModal(rowData)}
        >
          View
        </Button>
      ),
    },
    {
      title: "Patient Detail",
      dataIndex: "GENDER",
      render: (GENDERWaliValue, record) => (
        <>
          {/* {console.log(GENDERWaliValue,"GENDERWaliValue , ,,,,,,,,,,,,,,,,,,")} */}

          <Button
            icon={<FaFileMedical />}
            className="flex items-center gap-2 border-blue-500 text-blue-500"
            onClick={() => openDetailModal(record)}
          >
            View
          </Button>
        </>
      ),
    },
    // {
    //   title: "Report",
    //   render: (_, rowData) => (
    //     <>
    //       {/* {console.log(rowData, "rowData of reports , ,,,,,,,,,,,,,,,,,,")} */}
    //       <Button
    //         icon={<FaMicroscope />}
    //         className="flex items-center gap-2 border-blue-500 text-blue-500 "
    //         onClick={() => openReportModal(rowData)}
    //       >
    //         View
    //       </Button>
    //     </>
    //   ),
    // },
  ];

  // console.log(selectedHistory, "selectedHistory?.MEDICAL_TESTS");

  // const isCBC = selectedHistory?.MEDICAL_TESTS?.toLowerCase().includes("cbc") 
  // const isUrine = selectedHistory?.MEDICAL_TESTS?.toLowerCase()?.includes("urine");
  // const iskidneyFunction = selectedHistory?.MEDICAL_TESTS?.toLowerCase()?.includes("kidneyfunction") || selectedHistory?.MEDICAL_TESTS?.toLowerCase()?.includes("kidney function");

  // const getReportTabs = () => {

  //   const tabs = [];

  //   if (isCBC) {
  //     tabs.push({
  //       key: "cbc",
  //       label: (
  //         <span className="flex items-center gap-2">
  //           <FaFlask className="text-blue-500" />
  //           CBC Report
  //         </span>
  //       ),
  //       children: <CBCReport patientData={selectedHistory} />,
  //     });
  //   }

  //   if (isUrine) {
  //     tabs.push({
  //       key: "urine",
  //       label: (
  //         <span className="flex items-center gap-2">
  //           <FaNotesMedical className="text-green-500" />
  //           Urine Report
  //         </span>
  //       ),
  //       children: <UrineReport patientData={selectedHistory} />,
  //     });
  //   }

  //   if (iskidneyFunction) {
  //     tabs.push({
  //       key: "kidneyFunction",
  //       label: (
  //         <span className="flex items-center gap-2">
  //           <FaNotesMedical className="text-green-500" />
  //           kidney Function Report
  //         </span>
  //       ),
  //       children: <KidneyFunction patientData={selectedHistory} />,
  //     });
  //   }

  //   // If no specific tests found, show a message
  //   if (tabs.length === 0) {
  //     tabs.push({
  //       key: "no-report",
  //       label: (
  //         <span className="flex items-center gap-2">
  //           <FaMicroscope className="text-gray-500" />
  //           No Reports
  //         </span>
  //       ),
  //       children: (
  //         <div className="p-8 text-center">
  //           <FaMicroscope className="text-4xl text-gray-300 mx-auto mb-3" />
  //           <p className="text-gray-500 font-medium">No lab reports available for this visit</p>
  //           <p className="text-gray-400 text-sm mt-1">Medical tests: {selectedHistory?.MEDICAL_TESTS || 'Not specified'}</p>
  //         </div>
  //       ),
  //     });
  //   }

  //   return tabs;
  // };


  return (
    <>

      {/* ===================== Patient vitals Modal ===================== */}

      <Modal
        open={openVitals}
        onCancel={() => setOpenVitals(false)}
        footer={null}
        centered
        width={600}
      >

        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
            <FaHeartbeat className="text-red-500" />
            Patient Vitals
          </h2>

          <span className="text-sm text-gray-600 font-medium mr-6">
            Recorded before OPD
          </span>
        </div>

        {/* Body */}
        <div className="mt-3 grid grid-cols-2 lg:grid-cols-3 gap-4 text-sm p-4 rounded-2xl themeBoxShadow">

          {/* Blood Pressure */}
          <div className="flex flex-col p-3 rounded-lg border bg-pink-50 border-pink-500">
            <span className="text-black font-semibold flex items-center gap-1">
              Blood Pressure
            </span>
            <span className="font-bold text-pink-700">
              {selectedHistory?.BLOOD_PRESSURE || "N/A"} mmHg
            </span>
          </div>

          {/* Blood Sugar */}
          <div className="flex flex-col p-3 rounded-lg border bg-green-50 border-green-500">
            <span className="text-black font-semibold flex items-center gap-1">
              Blood Sugar
            </span>
            <span className="font-bold text-green-700">
              {selectedHistory?.BLOOD_SUGAR || "N/A"} mg/dL
            </span>
          </div>

          {/* Weight */}
          <div className="flex flex-col p-3 rounded-lg border bg-blue-50 border-blue-600">
            <span className="text-black font-semibold flex items-center gap-1">
              Weight
            </span>
            <span className="font-bold text-blue-700">
              {selectedHistory?.WEIGHT || "N/A"} kg
            </span>
          </div>

          {/* Height */}
          <div className="flex flex-col p-3 rounded-lg border bg-gray-100 border-gray-600">
            <span className="text-black font-semibold flex items-center gap-1">
              Height
            </span>
            <span className="font-bold text-gray-700">
              {selectedHistory?.HEIGHT || "N/A"} ft
            </span>
          </div>

          {/* Temperature */}
          <div className="flex flex-col p-3 rounded-lg border bg-purple-50 border-purple-600">
            <span className="text-black font-semibold flex items-center gap-1">
              Temperature
            </span>
            <span className="font-bold text-purple-700">
              {selectedHistory?.TEMPERATURE || "N/A"} °F
            </span>
          </div>

          {/* Pulse */}
          <div className="flex flex-col p-3 rounded-lg border bg-yellow-50 border-yellow-600">
            <span className="text-black font-semibold flex items-center gap-1">
              Pulse
            </span>
            <span className="font-bold text-yellow-700">
              {selectedHistory?.PULSE || "N/A"} bpm
            </span>
          </div>

        </div>


      </Modal>

      {/* ===================== Patient Detail Modal ===================== */}

      <Modal
        open={openPatientDetail}
        onCancel={() => setOpenPatientDetail(false)}
        footer={null}
        centered
        width={850}
      >
        <div className="flex justify-between items-center mb-4">

          <h2 className="text-lg font-bold text-gray-700 flex items-center gap-2">
            <FaFileMedical className="text-blue-600" />
            Patient Details
          </h2>

          <div className="text-sm text-gray-600 mr-6">
            {selectedHistory?.PATIENTNAME}
          </div>

        </div>

        {/* tabs section */}

        <Tabs
          defaultActiveKey="1"
          items={[
            {
              key: "1",
              label: "Diagnosis",
              children: (
                <div className="p-3 bg-gray-50 rounded-xl">
                  {selectedHistory?.PRIMARY_DIAGNOSIS?.split(",").join(" -- ") || "No Data"}
                </div>
              ),
            },

            {
              key: "2",
              label: "Medical Tests",
              children: (
                <div className="p-3 bg-gray-50 rounded-xl">
                  {selectedHistory?.MEDICAL_TESTS?.split(",").join("  ,  ") || "No Data"}
                </div>
              ),
            },

            {
              key: "3",
              label: "Medical Plan",
              children: (
                <div className="p-3 bg-gray-50 rounded-xl">
                  {selectedHistory?.MEDICAL_PLAN || "No Data"}
                </div>
              ),
            },

            {
              key: "4",
              label: "Medicine",
              children: (
                <div className="p-3 bg-gray-50 rounded-xl">
                  {selectedHistory?.MEDICINE || "No Data"}
                </div>
              ),
            },

            {
              key: "5",
              label: "Complain",
              children: (
                <div className="p-3 bg-gray-50 rounded-xl">
                  {selectedHistory?.REMARKS || "No Data"}
                </div>
              ),
            },

            {
              key: "6",
              label: "Treatment",
              children: (
                <div className="p-3 bg-gray-50 rounded-xl whitespace-pre-line">
                  {selectedHistory?.TREATMENT || "No Data"}
                </div>
              ),
            },
          ]}
          tabBarStyle={{
            marginBottom: 0,
          }}
          renderTabBar={(props, DefaultTabBar) => (
            <div style={{ overflowX: 'auto', whiteSpace: 'nowrap' }}>
              <DefaultTabBar {...props} style={{ flexWrap: 'nowrap', minWidth: 'max-content' }} />
            </div>
          )}
        />
      </Modal>

      {/* =====================  Report Component ===================== */}

      {/* <Modal
        open={openReport}
        onCancel={() => setOpenReport(false)}
        footer={null}
        centered
        width={900}
        className="report-modal"
        styles={{
          body: {
            padding: 0,
            maxHeight: '80vh',
            overflowY: 'auto',
          }
        }}
        closeIcon={
          <span className="text-red-600 hover:text-red-800 bg-red-100 px-1 text-xl font-bold transition-colors">
            X
          </span>
        }

      >

        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-gray-700 flex items-center gap-2">
            <FaMicroscope className="text-purple-600" />
            Lab Reports
          </h2>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 mr-4">
              {selectedHistory?.PATIENTNAME} | MR: {selectedHistory?.MRNO}
            </span>
          </div>
        </div>

        <Tabs
          activeKey={activeReportTab}
          onChange={(key) => setActiveReportTab(key)}
          items={getReportTabs()}
          tabBarStyle={{ marginBottom: 0 }}

        />

      </Modal> */}

      {/* ===================== History ===================== */}

      <Card
        title={

          <div className="flex justify-between items-center w-full">

            <div className="flex items-center  text-md sm:text-lg gap-2 font-bold text-slate-700">
              <FaHistory className="text-blue-500" />
              Patient <span className="hidden sm:inline"> Visit </span> History
            </div>


            <div className="hidden md:flex items-center gap-3 bg-blue-50 px-3 py-1 rounded-full shadow-sm">
              <FaHeartbeat className="text-red-500 text-lg" />
              <span className="text-red-600 font-semibold text-xs sm:text-sm">
                Chronic Patient
              </span>
            </div>


            <div className="flex items-center gap-4 text-xs sm:text-sm">

              <div className="flex flex-col sm:flex-row sm:gap-2  text-center">
                <span className="text-black">Last Visit</span>
                <span className="font-semibold text-blue-600">
                  {lastVisit?.VISIT_DATE?.split(" ")[0]}
                </span>
              </div>

              <div className="h-8 w-[1px] bg-gray-200" />

              <div className="flex flex-col sm:flex-row sm:gap-2  text-center">
                <span className="text-black">Total Visits</span>
                <span className="font-semibold text-blue-600">
                  {currentPatientHistory?.length}
                </span>
              </div>

            </div>


          </div>
        }
        className={`${card} flex-1`}
        styles={{
          header: {
            borderBottom: "2px solid #E5E7EB",
            padding: "15px 16px",
            background: "#F9FAFB",
          },
          body: {
            padding: "15px",
          },
        }}
      >
        <Table
          columns={historyColumns}
          dataSource={currentPatientHistory}
          pagination={false}
          scroll={{ x: true }}
          rowKey={(record, i) => record?.RECEIPTNO || i}
        />
      </Card>

    </>
  )
}

export default HistoryTable