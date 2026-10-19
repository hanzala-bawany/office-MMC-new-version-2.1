import { useCallback, useEffect, useState } from "react";
import {
  Form,
  Input,
  InputNumber,
  DatePicker,
  Radio,
  Button,
  Table,
  message,
} from "antd";
import dayjs from "dayjs";
import moment from "moment";
import useFetch from "../hooks/useFetch";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import axiosInstance from "../utills/axiosInstance";
import { base_URL } from "../utills/baseUrl";

const PartialPaymentPage = () => {

  const [form] = Form.useForm();
  const [selectedRow, setSelectedRow] = useState(null);
  const [patientAndHistoryDataLoading, setPatientAndHistoryDataLoading] = useState(false);
  const [historyData, setHistoryData] = useState([]);
  const [saveEditLoading, setSaveEditLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const loginUserData = useSelector((state) => state?.authSlice?.loginUser);

  const calculateTotalBalance = (data) => {

    const grossAmount = Number(data?.[0]?.GROSSAMOUNT) || 0;
    const paidTotal = data
      .filter((row) => String(row.STATUS) !== "1")
      .reduce((sum, row) => sum + (Number(row.NETAMOUNT) || 0), 0);
    const totalBalance = grossAmount - paidTotal;

    return totalBalance;

  }

  // console.log(loginUserData , "loginUserData");
  // console.log(historyData , "historyData");

  const formattedHistoryData = loginUserData?.role == "Admin" ? historyData :  historyData?.filter((i) => i?.STATUS == 0);


  // on reciept seacrh enter
  const fetchPatientHistory = async (receiptNo) => {
    if (!receiptNo) {
      message.warning("First write reciept no");
      return;
    }

    setPatientAndHistoryDataLoading(true)

    try {

      const res = await axiosInstance.get(`/api/partialPayment/patientHistoryByReceipt/${receiptNo}`);
      console.log('Saved successfully:', res);
      const patientData = res?.data?.data?.patientData
      const historyData = res?.data?.data?.historyData || []

      setHistoryData(historyData)

      if (patientData) {
        form.setFieldsValue({
          receiptNo: patientData.RECEIPTNO,
          patientName: patientData.PATIENTNAME,
          gender: patientData.GENDER,
          age: patientData.AGE,
          admissionDate: patientData.VDATE ? moment(patientData.VDATE).format("DD-MMM-YYYY") : "",
          contactNo: patientData.CONTACTNO,
          consultant: patientData.CONSULTANTNAME,
          totalBalance: calculateTotalBalance(historyData),
        });
      }

    } catch (err) {
      console.error('Error saving OPD receipt:', err);
      toast.error(err?.response?.data?.message || "Failed to generate OPD reciept");
    }
    finally {
      setPatientAndHistoryDataLoading(false)
    }

  };

  const handleReceiptSearch = (e) => {
    e.preventDefault();
    const value = e.target.value?.trim();
    fetchPatientHistory(value);
  };

  // on save and update
  const onFinish = async (values) => {

    if (!values?.amount) return
    console.log("PartialPayment form values:", values);

    setSaveEditLoading(true);
    try {
      const res = await axiosInstance.post(
        `${base_URL}/api/partialPayment/addEditPartialReceipt`,
        {
          id: values?.id || null,
          receiptNo: values?.receiptNo,
          vdate: moment(),
          partialAmount: values?.amount,
          balanceAmount: values?.totalBalance,
          receiptMode: values?.paymentMode,
          editBy: loginUserData?.username,
          status: 0,
          terminalId: null
        },
      );
      console.log(res, "res of handle Remove Doctor by id");

      toast.success(res?.data?.message || "Saved successfully");
      // form.resetFields();
      await fetchPatientHistory(values?.receiptNo);
      form.setFieldsValue({
        id: null,
        amount: 0,
        paymentMode: "CASH",
      });
      setSelectedRow(null);

    } catch (err) {
      console.log(err, "err in save / edit");
      toast.error(err?.response?.data?.message || "Saved failed");
    } finally {
      setSaveEditLoading(false);
    }

  };

  // on new
  const handleNew = useCallback(() => {
    form.resetFields();
    setSelectedRow(null);
    setHistoryData([]);
  }, [form]);

  // on delete
  const handleDelete = async () => {

    if (!selectedRow?.ID) {
      return toast.warning("select a receipt first")
    }
    // console.log("PartialPayment form values:", values);
    const receiptNo = form.getFieldValue("receiptNo");

    setDeleteLoading(true);
    try {
      const res = await axiosInstance.delete(
        `${base_URL}/api/partialPayment/deletePartialPayment/${selectedRow.ID}`,
        {
          data: {
            editBy: loginUserData?.username,
            terminalId: null,
          },
        },
      );
      console.log(res, "res of handle Remove Doctor by id");

      toast.success(res?.data?.message || "Deleted successfully");
      // form.resetFields();
      await fetchPatientHistory(receiptNo);
      form.setFieldsValue({
        id: null,
        amount: 0,
        paymentMode: "CASH",
      });
      setSelectedRow(null);

    } catch (err) {
      console.log(err, "err in Deleted receipt");
      toast.error(err?.response?.data?.message || "Deleted failed");
    } finally {
      setDeleteLoading(false);
    }

  };


  const handleRowDoubleClick = (record, i) => {

    if (i === 0) {
      toast.warning("You cannot update generated slip");
      return;
    }

    setSelectedRow(record)

    setSelectedRow(record);
    form.setFieldsValue({
      id: record.ID,
      amount: record.NETAMOUNT,
      paymentMode: record.RECEIPTMODE,
      date: record.VDATE ? moment(record.CREATEDTIME, "DD-MMM-YYYY HH:mm:ss") : dayjs(),
      // totalBill: record.totalBill,
      // createdBy: record.createdBy,
    });
  };


  const columns = [
    { title: "Receipt*", dataIndex: "RECEIPTNO", key: "RECEIPTNO" },
    {
      title: "Date",
      dataIndex: "VDATE",
      key: "VDATE",
      render: (val) => (
        val ? moment(val, "DD-MMM-YYYY HH:mm:ss").format("DD-MMM-YYYY") : "-"
      ),
    },
    {
      // har row me first row ka GROSSAMOUNT dikhana hai, apna wala nahi
      title: "Total Bill",
      dataIndex: "GROSSAMOUNT",
      key: "GROSSAMOUNT",
      render: () => historyData?.[0]?.GROSSAMOUNT ?? 0,
    },
    { title: "Amount", dataIndex: "NETAMOUNT", key: "NETAMOUNT" },
    {
      title: "Created By",
      key: "createdByInfo",
      render: (_, record) => (
        <div className="flex flex-col leading-tight">
          <span>{record.CREATEDBY || "-"}</span>
          <span className="text-xs text-gray-400">
            {
              record.CREATEDTIME
                ? moment(record.CREATEDTIME, "DD-MMM-YYYY HH:mm:ss").format("DD-MMM-YYYY hh:mm A")
                : ""
            }
          </span>
        </div>
      ),
    },
    {
      title: "Edit By",
      key: "editByInfo",
      render: (_, record) => (
        <div className="flex flex-col leading-tight">
          <span>{record.EDITBY || "-"}</span>
          <span className="text-xs text-gray-400">
            {record.EDITTIME
              ? moment(record.EDITTIME, "DD-MMM-YYYY HH:mm:ss").format("DD-MMM-YYYY hh:mm A")
              : ""}
          </span>
        </div>
      ),
    },
    { title: "Terminal Id", dataIndex: "TERMINALID", key: "TERMINALID" },
  ];



  return (
    <div className="flex h-full flex-col overflow-hidden">

      {/* Module Heading */}
      <div className="shrink-0 bg-gray-50 px-6 py-3 mb-4 rounded-md border border-gray-200">
        <h2 className="text-xl font-bold text-black text-center">
          Partial Payment Information
        </h2>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{
          date: dayjs(),
          amount: 0,
          paymentMode: "CASH",
        }}
        className="flex-1 min-h-0 overflow-y-auto space-y-4 px-4!"
      >

        {/* Patient Info (left) + Receipt Info (right) side by side */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* Left: Patient Info */}
          <fieldset className="border border-gray-300 rounded-md px-4 pb-4 pt-2 col-span-2">

            <legend className="px-2 text-sm font-semibold text-gray-700">
              Patient Info
            </legend>
            <div className="grid grid-cols-3 gap-3">

              <Form.Item label="Receipt. No" name="receiptNo" className="mb-0">
                <Input placeholder="Enter receipt no" onPressEnter={handleReceiptSearch} />
              </Form.Item>
              <Form.Item label="Patient Name" name="patientName" className="mb-0">
                <Input readOnly />
              </Form.Item>

              {/* Gender + Age half-half same row */}
              <div className="grid grid-cols-2 gap-3">
                <Form.Item label="Gender" name="gender" className="mb-0">
                  <Input readOnly />
                </Form.Item>
                <Form.Item label="Age" name="age" className="mb-0">
                  <InputNumber readOnly className="w-full!" />
                </Form.Item>
              </div>

              <Form.Item label="Adm. Date" name="admissionDate" className="mb-0">
                <Input readOnly />
              </Form.Item>
              <Form.Item label="Contact No" name="contactNo" className="mb-0">
                <Input readOnly />
              </Form.Item>
              <Form.Item label="Consultant" name="consultant" className="mb-0">
                <Input readOnly />
              </Form.Item>

            </div>
          </fieldset>

          {/* Right: Receipt Info (vertical) + Mode of Payment */}
          <div className="grid grid-cols-1 gap-4">

            <fieldset className="border border-gray-300 rounded-md px-4 pb-4 pt-2">

              <legend className="px-2 text-sm font-semibold text-gray-700">
                Receipt Info
              </legend>

              <div className="grid grid-cols-2 gap-3">

                <Form.Item label="Date" name="date" className="mb-0 col-span-2">
                  <DatePicker
                    disabled
                    showTime
                    format="DD-MMM-YYYY hh:mm A"
                    className="w-full! [&_.ant-picker-input>input]:text-gray-900! [&_.ant-picker-input>input]:bg-white! [&_.ant-picker-input>input]:opacity-100!"
                  />
                </Form.Item>

                <Form.Item label="Receipt" name="id" className="mb-0">
                  <Input readOnly />
                </Form.Item>

                <Form.Item
                  label="Amount"
                  name="amount"
                  rules={[{ required: true, message: "Please enter amount" }]}
                  className="mb-0"
                >
                  <InputNumber min={0} className="w-full!" />
                </Form.Item>

              </div>
            </fieldset>

          </div>

        </div>

        <div className="flex flex-wrap items-center justify-between gap-4">

          <div className="flex flex-wrap gap-2">
            <Button onClick={handleNew}>New</Button>

            <Button type="primary" htmlType="submit" loading={saveEditLoading} disabled={selectedRow && loginUserData?.role != "Admin"}>
              {selectedRow ? "Update" : "Save"}
            </Button>

            <Button>Print</Button>

            <Button disabled={!selectedRow || loginUserData?.role != "Admin"} danger onClick={handleDelete} loading={deleteLoading}>
              Delete
            </Button>
          </div>

          {/* Payment Mode */}
          <Form.Item
            label="Payment Mode"
            name="paymentMode"
            className="mb-0"
          >
            <Radio.Group>
              <Radio value="CASH">CASH</Radio>
              <Radio value="CHEQUE">CHEQUE</Radio>
              <Radio value="CARD">CREDIT CARD</Radio>
            </Radio.Group>
          </Form.Item>

          <Form.Item label="Total Balance" name="totalBalance" className="mb-0">
            <Input readOnly className="w-50!" />
          </Form.Item>

        </div>

        {/* Advance History */}
        <div>
          <div className="flex items-baseline gap-2 mb-2">
            <h3 className="text-sm font-bold text-gray-800">Advance History</h3>
          </div>
          <Table
            // bordered
            columns={columns}
            dataSource={formattedHistoryData}
            loading={patientAndHistoryDataLoading}
            rowKey={(record, i) => `${record.receiptNo}-${i}`}
            // size="small"
            pagination={false}
            scroll={{ y: 300 }}
            onRow={(record, index) => ({
              onDoubleClick: () => handleRowDoubleClick(record, index),
              className: 'cursor-pointer hover:bg-blue-50',
            })}
            className="user-session-table"
            rowClassName={(record) =>
              record?.STATUS == 1 ? 'row-deleted' : 'hover:bg-gray-50 transition-colors'
            }
          />
        </div>

      </Form>


    </div>
  );
};

export default PartialPaymentPage;