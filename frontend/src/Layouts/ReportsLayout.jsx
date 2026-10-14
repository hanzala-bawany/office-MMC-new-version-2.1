import React from "react";
import { Card, Typography, Divider } from "antd";
import {
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";
import moment from "moment";
import mmcLogo from "../assets/MMC logo.png";

const { Title, Text } = Typography;

const ReportsLayout = ({ children, reportData, Title: reportTitle, type }) => {
  const currentDate = moment().format("DD-MMMM-YYYY");
  //   const currentDate = type == "labReport" && reportData?.LAB_DATE ? reportData.LAB_DATE : moment().format("DD-MMMM-YYYY");

  console.log(reportData, "reportData ...............");

  return (
    <Card
      className="w-full max-w-4xl shadow-sm rounded-none border border-gray-200 mx-2 sm:mx-4"
      bodyStyle={{ padding: 0 }}
    >
      {/* ============ HEADER ============ */}
      <div className="bg-white p-3 sm:p-4 md:p-6 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-3">
          {/* Logo & Hospital Name */}
          <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
            <img
              src={mmcLogo}
              alt="Hospital Logo"
              className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 object-contain flex-shrink-0"
            />
            <div className="min-w-0">
              <Title
                level={5}
                className="text-gray-800 m-0 font-semibold text-sm sm:text-base md:text-lg lg:text-xl truncate"
              >
                Memon Medical Complex
              </Title>
              <Text className="text-gray-500 text-[10px] sm:text-xs block truncate">
                A Project of Bantwa Memon Association
              </Text>
            </div>
          </div>

          {/* Date & Report Type */}
          <div className="flex flex-row sm:flex-col items-center sm:items-end gap-1 sm:gap-0.5 w-full sm:w-auto border-t sm:border-t-0 pt-1.5 sm:pt-0">
            <div className="bg-gray-50 px-2 sm:px-3 py-0.5 sm:py-1 rounded border border-gray-200">
              <Text className="text-[10px] sm:text-xs font-medium text-gray-700 whitespace-nowrap">
                {currentDate}
              </Text>
            </div>
            <Text className="text-[8px] sm:text-[10px] text-gray-400">
              Report : {reportTitle}
            </Text>
          </div>
        </div>
      </div>

      {/* ============ After Header ============ */}
      {type == "medicalPrescription" ? (
        <div className="bg-gray-50 p-3 sm:p-4 border-b border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
            {/* Patient Info - Grid for better mobile view */}
            <div className="w-full">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                {/* Left Column */}
                <div className="space-y-1.5">
                  <div className="flex items-baseline gap-2">
                    <Text className="text-[10px] sm:text-xs text-gray-400 whitespace-nowrap font-medium">
                      Patient Name :
                    </Text>
                    <Text className="text-sm sm:text-base font-semibold text-gray-800 truncate">
                      {reportData?.PATIENTTITLE || ""}{" "}
                      {reportData?.PATIENTNAME || "N/A"}
                    </Text>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <Text className="text-[10px] sm:text-xs text-gray-400 whitespace-nowrap font-medium">
                      MR No :
                    </Text>
                    <Text className="text-sm sm:text-base font-medium text-gray-700">
                      {reportData?.MRNO || "N/A"}
                    </Text>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-1.5">
                  <div className="flex items-baseline gap-2">
                    <Text className="text-[10px] sm:text-xs text-gray-400 whitespace-nowrap font-medium">
                      Age / Gender :
                    </Text>
                    <Text className="text-sm sm:text-base font-medium text-gray-700">
                      {reportData?.AGE || "N/A"} {reportData?.AGEUNIT || ""} /{" "}
                      {reportData?.GENDER || "N/A"}
                    </Text>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <Text className="text-[10px] sm:text-xs text-gray-400 whitespace-nowrap font-medium">
                      Receipt No :
                    </Text>
                    <Text className="text-sm sm:text-base font-medium text-gray-700">
                      {reportData?.RECEIPTNO || "N/A"}
                    </Text>
                  </div>
                </div>
              </div>
            </div>

            {/* Consultant */}
            <div className="w-full md:w-auto text-left md:text-right border-t md:border-t-0 pt-1.5 md:pt-0">
              <Text className="text-[8px] sm:text-[10px] text-gray-400 block">
                Consultant
              </Text>
              <Text className="text-[10px] sm:text-sm font-medium text-gray-700 block">
                Dr. {reportData?.DOCTOR_NAME || "N/A"}
              </Text>
              <Text className="text-[8px] sm:text-[10px] text-gray-600 block truncate max-w-[200px]">
                {reportData?.FACULTY || ""}
              </Text>
            </div>
          </div>
        </div>
      ) : type == "sessionClosing" ? (
        <div className="bg-gray-50 p-3 sm:p-4 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-2">
            <section className="">
              <div className="flex">
                <Text className="text-[10px] sm:text-xs text-gray-400 block">
                  User :{" "}
                  <span className="text-sm sm:text-base font-semibold text-gray-800">
                    {" "}
                    {reportData?.USERID}{" "}
                  </span>{" "}
                </Text>
              </div>
              <Text className="block text-[10px] sm:text-xs text-gray-600">
                SessionID : {reportData?.SESSIONID || "N/A"}
              </Text>
            </section>

            <div className="text-left sm:text-right space-y-0.5">
              <Text className="block text-[10px] sm:text-xs text-gray-600">
                Session Start :{" "}
                {moment(reportData?.SESSIONDATE).format("DD-MMM-YYYY") || "N/A"}
              </Text>
              <Text className="block text-[10px] sm:text-xs text-gray-600">
                Session End :{" "}
                {moment(reportData?.TODATE).format("DD-MMM-YYYY") || "N/A"}
              </Text>
            </div>
          </div>
        </div>
      ) : type == "labReport" ? (
        <div className="bg-gray-50 p-3 sm:p-4 border-b border-gray-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5">
            {[
              ["Patient Name :", reportData?.PATIENT_NAME],
              ["Lab Receipt No :", reportData?.LAB_RECEIPTNO],
              ["Ordered By :", reportData?.ORDERED_BY_NAME],
              ["Lab Date :", reportData?.LAB_DATE],
              ["Age :", reportData?.AGE],
              ["Mr_Num :", reportData?.MR_NNUM],
            ].map(([label, value]) => (
              <div key={label} className="flex items-baseline gap-2">
                <Text className="text-[10px] sm:text-xs text-gray-400 whitespace-nowrap font-medium">
                  {label}
                </Text>
                <Text className="text-sm sm:text-base font-medium text-gray-800">
                  {value || "N/A"}
                </Text>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div>other</div>
      )}

      {/* ============ BODY ============ */}
      <div className="p-3 sm:p-4 md:p-6 bg-white min-h-[150px]">{children}</div>

      {/* ============ FOOTER ============ */}
      <div className="bg-gray-50 px-8 py-4 border-t border-gray-200">
        <div className="flex flex-wrap justify-between items-center text-xs text-gray-400">
          <div className="flex items-center gap-4">
            <EnvironmentOutlined />
            <span>Main Food Street, Hussainabad, Karachi, Pakistan</span>
          </div>
          <div className="flex items-center gap-4">
            <span>📞 0311-5533152</span>
            <span>📧 info@mmc.com</span>
            <span>🌐 www.mmc.com.pk</span>
          </div>
        </div>
        <Divider />

        <div className="flex flex-wrap justify-between items-center text-[10px] text-gray-400">
          <Text type="secondary">
            © 2026 Memon Medical Complex. All rights reserved.
          </Text>
        </div>
      </div>
    </Card>
  );
};

export default ReportsLayout;
