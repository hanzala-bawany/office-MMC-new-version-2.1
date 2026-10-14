import React, { useEffect, useRef, useState } from "react";
import { Table, Button, Select, Card, Space, Tag, Form } from "antd";
import {
  LockOutlined,
  PrinterOutlined,
  CheckCircleFilled,
  ClockCircleOutlined,
} from "@ant-design/icons";
import moment from "moment";
import { useSelector } from "react-redux";
import useFetch from "../hooks/useFetch";
import axiosInstance from "../utills/axiosInstance";
import { toast } from "react-toastify";
import { useReactToPrint } from "react-to-print";
import ReportsLayout from "../Layouts/ReportsLayout";
import UserSessionSummeryPrint from "../components/management/UserSessionSummeryPrint";

const { Option } = Select;

const UserSessionPage = () => {
  const [form] = Form.useForm();
  const [selectedUser, setSelectedUser] = useState(null);
  const [closeLoading, setCloseLoading] = useState(false);
  const loginUserData = useSelector((state) => state?.authSlice?.loginUser);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [openSessionId, setOpenSessionId] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);
  const [sessionPrintData, setSessionPrintData] = useState(null);
  const [printTrigger, setPrintTrigger] = useState(false);
  const [sessionPrintLoading, setSessionPrintLoading] = useState(null);
  const printRef = useRef();

  const {
    data: currentSessionHistoryData,
    loading: currentSessionHistoryDataLoading,
    error: currentSessionHistoryDataError,
    reFetchData: refetchcurrentSessionHistoryData,
  } = useFetch(
    loginUserData?.username
      ? `/api/receptionist/getCurrentSessionHistory/${selectedUser || loginUserData?.username}`
      : null,
  ); // loginUserData?.username = usernID

  const {
    data: usersData,
    loading: usersLoading,
    error: usersError,
  } = useFetch("/api/receptionist/users");

  // console.log(sessionPrintData, "sessionPrintData /.");
  // console.log(selectedRow, "selectedRow /.");

  useEffect(() => {
    if (printTrigger && sessionPrintData) {
      handlePrint();
      setPrintTrigger(false)
      setSessionPrintData(null);
    }
    
  }, [printTrigger , sessionPrintData]);

  const columns = [
    {
      title: "Session ID",
      dataIndex: "SESSIONID",
      key: "SESSIONID",
      width: 110,
      render: (text) => <span className="font-semibold">{text}</span>,
    },
    {
      title: "From",
      dataIndex: "FROMDATE",
      key: "FROMDATE",
      render: (date) => (
        <span>{moment(date).format("DD-MMM-YYYY hh:mm:ss A")}</span>
      ),
    },
    {
      title: "To Date",
      dataIndex: "TODATE",
      key: "TODATE",
      render: (date) =>
        date ? (
          <span>{moment(date).format("DD-MMM-YYYY hh:mm:ss A")}</span>
        ) : (
          <span className="text-gray-400 italic">Active</span>
        ),
    },
    {
      title: "Closed",
      dataIndex: "STATUS",
      key: "STATUS",
      width: 100,
      align: "center",
      render: (cellCalue, recordData, index) => {
        if (cellCalue == 0) {
          // status 0 means session is closed
          return <CheckCircleFilled className="text-green-500! text-base!" />;
        } else {
          setOpenSessionId(recordData?.SESSIONID);
          return (
            <ClockCircleOutlined className="text-orange-400! text-base!" />
          );
        }
      },
    },
    {
      title: "Session Date",
      dataIndex: "SESSIONDATE",
      key: "SESSIONDATE",
      render: (date) => <span>{moment(date).format("DD-MMM-YYYY")}</span>,
    },
    {
      title: "Shift Name",
      dataIndex: "SHIFTNAME",
      key: "SHIFTNAME",
      render: (shift) => {
        const color =
          shift === "MORNING"
            ? "blue"
            : shift === "EVENING"
              ? "purple"
              : "default";
        return (
          <Tag color={color} className="font-medium">
            {shift}
          </Tag>
        );
      },
    },
  ];

  const handleRowSelect = (record, isSelected) => {
    // console.log(record, "record .........");   // <-- pura row data yahan milega
    // console.log(isSelected, "checked ya unchecked .........");
    setSelectedRow(isSelected ? record : null);
  };

  const onOverAllSelectChange = (newSelectedRowKeys, selectedRows) => {
    // console.log("onOverAllSelectChange chala he ");
    setSelectedRowKeys(newSelectedRowKeys);
    // setSelectedRow(selectedRows[0] || null);
    // console.log(newSelectedRowKeys, "newSelectedRowKeys ..............");
    // console.log(selectedRows, "selectedRows (poora data array) .........");
  };

  const handleSessionClosed = async () => {
    if (!openSessionId) {
      toast.warning("No open session found to close!");
      return;
    }

    setCloseLoading(true);

    try {
      const res = await axiosInstance.post(
        `/api/receptionist/closedUserSession/${openSessionId}`,
      );
      toast.success(res?.data?.message);

      refetchcurrentSessionHistoryData();
      setOpenSessionId(null);
    } catch (error) {
      console.log(error, "err .............");
      toast.error(error?.response?.data?.message || "Failed to Closed Session");
    } finally {
      setCloseLoading(false);
    }
  };

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Session_${loginUserData?.username || "Report"}`,
  });

  const handlePrintClick = async () => {
    if (!selectedRow?.SESSIONID) {
      return toast.warning("Select the session first");
    }

    setSessionPrintLoading(true);

    try {
      const res = await axiosInstance.get(
        `/api/management/userSession/printData/${selectedRow.SESSIONID}`,
      );
      console.log(res, "res of session report");
      setSessionPrintData(res?.data);
      setPrintTrigger(true);
    } 
    catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to fetch print data",
      );
    } 
    finally {
      setSessionPrintLoading(false);
    }
  };

  const rowSelection = {
    type: "radio",
    selectedRowKeys,
    onChange: onOverAllSelectChange,
    onSelect: handleRowSelect, // ✅ single row select/deselect hote hi trigger hoga
  };

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <div className="flex justify-between">
        {/* ✅ Page Heading */}
        <div className="mb-4">
          <h1 className="text-xl font-bold text-gray-800">User Session</h1>
          <p className="text-sm text-gray-500">
            Track login/logout sessions, active shift status, and session
            history
          </p>
        </div>

        {loginUserData?.role == "Admin" && (
          <Form form={form} layout="vertical">
            <Form.Item
              name="userId"
              label={
                <span className="text-xs font-semibold text-gray-600">
                  User Id
                </span>
              }
              className="mb-0 min-w-[220px]"
            >
              <Select
                placeholder="Select User"
                allowClear
                value={selectedUser}
                onChange={(val) => setSelectedUser(val)}
                showSearch
                filterOption={(input, option) => {
                  // console.log(option , "option .......");
                  return option.children
                    .toLowerCase()
                    .includes(input.toLowerCase());
                }}
              >
                {usersData?.data?.map((item, i) => (
                  <Option key={`${item.USERID}-${i}`} value={item.USERID}>
                    {item.USERID}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Form>
        )}
      </div>

      {/* Filter + Actions Section */}
      <Card className="shadow-sm mb-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <Space size="middle">
            <Button
              type="primary"
              icon={<LockOutlined />}
              loading={closeLoading}
              onClick={handleSessionClosed}
              className={`shadow-md shadow-red-500/30 ${
                openSessionId
                  ? "!bg-red-500 hover:!bg-red-600"
                  : " !text-gray-800 bg-red-100! !shadow-none border-red-500!"
              }`}
              disabled={!openSessionId}
            >
              Session Closed
            </Button>

            <Button
              icon={<PrinterOutlined />}
              loading={sessionPrintLoading}
              onClick={handlePrintClick}
              className="!border-gray-300"
              disabled={!selectedRow}
            >
              Print
            </Button>
          </Space>
        </div>
      </Card>

      {/* Table Section */}
      <Card className="shadow-sm">
        <Table
          columns={columns}
          dataSource={currentSessionHistoryData?.data}
          loading={currentSessionHistoryDataLoading}
          rowSelection={rowSelection}
          rowKey={(record) => record.SESSIONID}
          rowClassName={(record) =>
            selectedRowKeys.includes(record.SESSIONID)
              ? "selected-row"
              : "hover:bg-gray-50 transition-colors"
          }
          pagination={{
            pageSize: 20,
            showSizeChanger: true,
            showQuickJumper: true,
          }}
          scroll={{ x: 900 }}
          className="user-session-table"
        />
      </Card>

      {/* Hidden Print Section */}
      <div style={{ position: "absolute", top: "-10000px", left: "-10000px" }}>
        <div ref={printRef}>
          <ReportsLayout
            reportData={selectedRow}
            Title="Daily Closing Summary"
            type="sessionClosing"
          >
            <UserSessionSummeryPrint data={sessionPrintData?.data} />
          </ReportsLayout>
        </div>
      </div>
    </div>
  );
};

export default UserSessionPage;
