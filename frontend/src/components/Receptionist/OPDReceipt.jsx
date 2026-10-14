import React, { useRef, useState } from 'react';
import {
    Button,
    Input,
    Select,
    DatePicker,
    Card,
    Row,
    Col,
    Form,
    Divider,
    Space,
    Radio,
    InputNumber,
    Badge,
    AutoComplete
} from 'antd';
import {
    SaveOutlined,
    DeleteOutlined,
    PrinterOutlined,
    CloseOutlined,
    SearchOutlined,
    UserAddOutlined,
    PlusOutlined,
    UndoOutlined,
    EyeOutlined,
    ReloadOutlined
} from '@ant-design/icons';
import moment from 'moment';
import LastSlipIssuedModal from './LastSlipIssuedModal';
import { useEffect } from 'react';
import axiosInstance from '../../utills/axiosInstance';
import useFetch from '../../hooks/useFetch';
import { useSelector } from 'react-redux';
import OpdReceiptModal from './opdReceiptModal';
import './OPDReceipt.css';
import { toast } from 'react-toastify';
import OPDCardReceipt from '../OutPatient/OPDCardReceipt';
import { useReactToPrint } from 'react-to-print';
import OPDServiceReceipt from '../OutPatient/OPDServiceReceipt';



const { TextArea } = Input;
const { Option } = Select;


const OPDReceipt = ({ editRecord, clearEditRecord, handleEdit }) => {

    const loginUserData = useSelector((state) => state?.authSlice?.loginUser);
    const [form] = Form.useForm();
    const [grossAmount, setGrossAmount] = useState(0);
    const [netAmount, setNetAmount] = useState(0);
    const [addEditPatientLoading, setAddEditPatientLoading] = useState(false);
    const [deleteAndRefundLoading, setDeleteAndRefundLoading] = useState(false);
    const [showLastVisitModal, setShowLastVisitModal] = useState(false);
    const [showOpdReceiptModal, setShowOpdReceiptModal] = useState(false);
    const [selectedLabTestAmounts, setSelectedLabTestAmounts] = useState([]);
    const [patientTypeId, setPatientTypeId] = useState(null);
    const [opdCategoryId, setOpdCategoryId] = useState(null);
    const [islabortaryAble, setIslabortaryAble] = useState(false);
    const [showPartialnBalance, setShowPartialnBalance] = useState(false);
    const [showZakatnSPD, setShowZakatnSPD] = useState(null);
    const [showMember, setShowMember] = useState(null);
    const [selectedMemberNo, setSelectedMemberNo] = useState(null);
    const [selectedMemberPatientId, setSelectedMemberPatientId] = useState(null);
    const [searchType, setSearchType] = useState('contactNo');
    const [searchValue, setSearchValue] = useState('');
    const [searchPatientsData, setSearchPatientsData] = useState(null);
    const [searchPatientsLoading, setSearchPatientsLoading] = useState(false);
    const [printData, setPrintData] = useState(null);
    const [printLoading, setPrintLoading] = useState(false);
    const [shouldPrint, setShouldPrint] = useState(false);
    const printRef = useRef();
    const discountAmount = Form.useWatch('discountAmount', form);
    const partialAmount = Form.useWatch('partialPayment', form);

    const { data: opdCategoryData, loading: opdCategorLoading, error: opdCategorError } = useFetch('/api/receptionist/opdCategory');
    const { data: patientCategoryData, loading: patientCategorLoading, error: patientCategorError } = useFetch('/api/receptionist/patientCategory');
    const { data: membersData, loading: membersLoading, error: membersError } = useFetch('/api/receptionist/members');
    const { data: labTestData, loading: labTestLoading, error: labTestError } = useFetch('/api/receptionist/getLabTest');
    const { data: usersData, loading: usersLoading, error: usersError } = useFetch('/api/receptionist/users');
    const { data: memberDependentData, loading: memberDependentLoading, error: memberDependentError } =
        useFetch(selectedMemberNo ? `/api/receptionist/members/${selectedMemberNo}` : null);
    const { data: last10PatientsData, loading: last10PatientsLoading, error: last10PatientsError, reFetchData: refetchLast10Patients } =
        useFetch(loginUserData?.username ? `/api/receptionist/lastPatient/${loginUserData?.username}` : null);
    const { data: currentCashData, loading: currentCashDataLoading, error: currentCashDataError, reFetchData: refetchcurrentCashData } =
        useFetch(loginUserData?.username ? `/api/receptionist/getCurrentCash/${loginUserData?.username}` : null);
    const { data: referenceData, loading: referenceLoading, error: referenceError } =
        useFetch(`/api/receptionist/reference`);
    const { data: consultantsData, loading: consultantsLoading, error: consultantsError } =
        useFetch('/api/receptionist/allConsultant', { facultyId: opdCategoryId || null });



    const titleOptions = [
        { label: "Mr.", value: "Mr." },
        { label: "Ms.", value: "Ms." },
        { label: "Miss.", value: "Miss." },
        { label: "Mrs.", value: "Mrs." },
        { label: "Master.", value: "Master." },
        { label: "Baby.", value: "Baby." },
        { label: "S/O.", value: "S/O." },
        { label: "D/O.", value: "D/O." },
    ];

    const ageTypeOptions = [
        { label: "Year", value: "Year" },
        { label: "Month", value: "Month" },
        { label: "Day", value: "Day" },
    ];

    const genders = [
        { value: 'male', label: 'Male' },
        { value: 'female', label: 'Female' },
    ];

    const partialPayment = [
        { value: 0, label: "No" },
        { value: 1, label: "Yes" },
    ];

    const references = [
        { value: 'walkin', label: 'Walk-in' },
        { value: 'referral', label: 'Referral' },
        { value: 'online', label: 'Online Booking' },
        { value: 'camp', label: 'Medical Camp' },
    ];


    // console.log(grossAmount, "grossAmount ..............");
    // console.log(patientCategoryData, "patientCategoryData ..............");
    // console.log(membersData, "membersData ..............");
    // console.log(memberDependentData, "memberDependentData ..............");
    // console.log(usersData, "usersData ..............");
    // console.log(opdCategoryData, "opdCategoryData ..............");
    // console.log(consultantsData, "consultantsData ..............");
    // console.log(opdCategoryId, "opdCategoryId ..............");
    // console.log(selectedMemberPatientId, "selectedMemberPatientId ..............");
    // console.log(last10PatientsData, "last10PatientsData ..............");
    // console.log(searchPatientsData, "searchPatientsData ..............");
    // console.log(labTestData, "labTestData ..............");
    // console.log(selectedLabTestAmounts, "selectedLabTestAmounts  ..............");
    // console.log(loginUserData, "loginUserData  ..............");
    // console.log(currentCashData, "currentCashData  ..............");
    // console.log(receiptNumToPrintRef.current, "receiptNumToPrintRef  ..............");


    useEffect(() => {

        form.setFieldsValue({ grossPayment: grossAmount });
        if (grossAmount === 0) {
            form.setFieldsValue({
                discountAmount: 0,
                partialPayment: 0,
                netPayment: 0,
                balancePayment: 0,
            });

        }
    }, [grossAmount])

    useEffect(() => {

        const discount = Number(discountAmount) || 0;
        const partial = Number(partialAmount) || 0;

        if (!partial) {
            const net = grossAmount - discount;
            form.setFieldsValue({ netPayment: net < 0 ? 0 : net });
        } else {
            form.setFieldsValue({ netPayment: partial });
            const balance = (grossAmount - discount) - partial;
            form.setFieldsValue({ balancePayment: balance < 0 ? 0 : balance });
        }

    }, [grossAmount, discountAmount, partialAmount]);

    useEffect(() => {

        handleEditPatient(editRecord)

    }, [editRecord]);

    useEffect(() => {
        if (shouldPrint && printData) {
            // React ne data render kar diya
            handlePrint()
            setShouldPrint(false);
        }
    }, [printData, shouldPrint]);


    const handleFieldChange = (changedValues, allValues) => {

        // console.log(changedValues, "changedValues");
        console.log(allValues, "allValues");


        if (changedValues?.type) {
            setPatientTypeId(changedValues.type);
            form.setFieldsValue({ reference: undefined });
        }
        else if (changedValues?.opdCategory) {
            setOpdCategoryId(changedValues.opdCategory);
            form.setFieldsValue({ consultant: undefined });
        }
    };

    const onFinish = async (values) => {

        setAddEditPatientLoading(true);

        try {
            const payload = {
                ReceiptNo: editRecord?.RECEIPTNO || null,
                TokenNo: null,
                Vdate: values.date ? values.date.format('DD-MMM-YYYY HH:mm:ss') : null,
                CatagoryId: values.opdCategory,
                ConsultantID: !islabortaryAble ? values.consultant : null,
                PatientType: values.type,
                MemberID: values.members || null,
                PatientId: showMember ? selectedMemberPatientId : null,
                PatientTitle: values.patientTitle,
                PatientName: values.patientName || null,
                Gender: values.gender,
                ContactNo: values.contact,
                Age: values.ageValue,
                AgeUnit: values.ageType,
                ReferenceId: values.reference || null,
                Remarks: values.remarks,
                GrossAmount: Number(values.grossPayment) || 0,
                Discount: Number(values.discountAmount) || 0,
                NetAmount: Number(values.netPayment),
                partialAmount: Number(values.partialPayment) || 0,
                netbalance: Number(values.balancePayment) || 0,
                User: loginUserData?.username || null,
                TerminalId: null,                          //  ye kar na he 
                status: 0,                                 // ye dekhn ahe 
                isPartial: values.isPartial || null,
                electricitycharges: null,                  // ye dekhna he 
                laboratoryConsultantid: islabortaryAble ? values.consultant : null,
                LabTestIds: islabortaryAble ? (values.labTest || []) : [],
                LabTestAmounts: islabortaryAble ? selectedLabTestAmounts : [],
            };

            const res = await axiosInstance.post('/api/receptionist/opdAddandEditPatient', payload);

            console.log('Saved successfully:', res);
            toast.success(res?.data?.message)
            // form.resetFields();
            refetchLast10Patients?.();
            refetchcurrentCashData?.();
            if (editRecord) {
                clearEditRecord?.();
            }

            if (!editRecord) {
                const receiptNum = res?.data?.data?.receiptNo;
                getReceiptDataForPrint(receiptNum)
            }


        } catch (err) {
            console.error('Error saving OPD receipt:', err);
            toast.error(err?.response?.data?.message || "Failed to generate OPD reciept");
        } finally {
            setAddEditPatientLoading(false);
        }

    };

    const onDeleteAndRefund = async (type) => {

        setDeleteAndRefundLoading(true);
        const values = form.getFieldsValue();

        const receiptNo = values.recieptNo || editRecord?.RECEIPTNO;

        if (!receiptNo) {
            toast.warning("No receipt found to delete/refund");
            return;
        }

        try {
            const payload = {
                ReceiptNo: receiptNo || null,
                status: type == "restore" ? 0 : 1,
                User: loginUserData?.username || null,
                TerminalId: null,
                Remarks: values.remarks,
                refundBy: type == "restore" ? null : values.refundBy || null,
                refundDate: values.refundDatenTime
                    ? values.refundDatenTime.format('DD-MMM-YYYY HH:mm:ss')
                    : null,
            };

            const res = await axiosInstance.post('/api/receptionist/deleteAndRefundPatient', payload);

            console.log('Saved successfully:', res);
            toast.success(res?.data?.message || "OPD reciept dleeted successfully")
            handleReset()
            refetchcurrentCashData?.()
            if (editRecord) {
                clearEditRecord?.();
            }

        } catch (err) {
            console.error('Error saving OPD receipt:', err);
            toast.error(err?.response?.data?.message || "Failed to delete OPD reciept");
        } finally {
            setDeleteAndRefundLoading(false);
        }

    };

    const onFinishFailed = (errorInfo) => {
        console.log('Form validation failed:', errorInfo);
    };

    const handleReset = () => {
        form.resetFields();
        setSearchType("contactNo")
        setSearchValue('');
        setSearchPatientsData(null);
        if (editRecord) {
            clearEditRecord?.();
        }
        setPrintData(null)
    };

    const labTestHandler = (value, option) => {

        const selectedTests = labTestData?.data?.filter(item =>
            value.includes(item.ID)
        );

        const total = selectedTests?.reduce(
            (sum, item) => sum + Number(item.HOSPITALRATE || 0),
            0
        ) || 0;

        setGrossAmount(total);

        const amounts = selectedTests?.map(item => {

            const existing = selectedLabTestAmounts.find(
                prev => String(prev.id) === String(item.ID)
            );

            return {
                id: item.ID,
                title: item.TITLE,
                amount: item.HOSPITALRATE,
                rowId: existing?.rowId || null   // ✅ purana rowId preserve, naye ke liye null
            };
        });

        setSelectedLabTestAmounts(amounts || []);

    }

    const opdCategoryHandler = (value, option) => {
        setIslabortaryAble(value == 2 ? true : false)
        setGrossAmount(0);
    }

    const consultantHandler = (value, option) => {
        const selectedConsultant = consultantsData?.data?.find(item => item.ID === value);
        setGrossAmount(Number(selectedConsultant?.HOSPITALRATE) || 0);
    }

    const handleSearchPatient = async () => {
        if (!searchValue?.trim()) return;

        setSearchPatientsLoading(true);
        try {
            const res = await axiosInstance.get('/api/receptionist/filterPatients', {
                params: {
                    [searchType]: searchValue,
                },
            });
            // console.log(res?.data, "search Patients Data ,,,,,,,,,");
            setSearchPatientsData(res?.data);

        } catch (error) {
            console.log(error, "err .............");
            toast.error(error?.response?.data?.message || "Patient not found");
        } finally {
            setSearchPatientsLoading(false);
        }
    };

    const handleSelectSearchedPatient = (receiptNo) => {
        const patient = searchPatientsData?.data?.find(p => p.RECEIPTNO === receiptNo);
        // console.log(searchType, "searchType ...........");

        if (patient) {
            if (searchType != "receiptNo") {

                form.setFieldsValue({
                    patientTitle: patient.PATIENTTITLE,
                    patientName: patient.PATIENTNAME,
                    contact: patient.CONTACTNO,
                    gender: patient.GENDER,
                    remarks: patient.REMARKS,
                    ageValue: Number(patient.AGE),
                    ageType: patient.AGEUNIT,
                })
            }
            else {
                handleEdit?.(patient);
            }
        }
    };

    const handleEditPatient = (editRecord) => {
        console.log(editRecord, "editRecord ,,,,,,,,,");

        if (!editRecord) return;

        setPrintData(null)
        setPatientTypeId(editRecord.PATIENTTYPE);
        setOpdCategoryId(editRecord.CATAGORYID);
        setIslabortaryAble(editRecord.CATAGORYID == 2);
        setShowPartialnBalance(editRecord.ISPARTIAL == 1);
        setSelectedMemberPatientId(editRecord.PATIENTID);
        setGrossAmount(Number(editRecord.GROSSAMOUNT) || 0);

        // type select ka onChange manually replicate kar rahe hen
        if (editRecord.PATIENTTYPE == 2 || editRecord.PATIENTTYPE == 4) {
            setShowZakatnSPD({ children: editRecord.PATIENTTYPENAME });
            setShowMember(null);
            setSelectedMemberNo(null);
        } else if (editRecord.PATIENTTYPE == 3) {
            setShowMember(true);
            setShowZakatnSPD(null);
            setSelectedMemberNo(editRecord.MEMBERID);
        } else {
            setShowZakatnSPD(null);
            setShowMember(null);
            setSelectedMemberNo(null);
        }

        if (editRecord.LABTESTS?.length) {
            const testIds = editRecord.LABTESTS.map(item => Number(item.testId));

            const amounts = editRecord.LABTESTS.map(item => ({
                id: Number(item.testId),
                title: item.testName,
                amount: item.amount,
                rowId: item.rowId
            }));

            setSelectedLabTestAmounts(amounts);
        }

        form.setFieldsValue({
            type: editRecord.PATIENTTYPE,
            isPartial: editRecord.ISPARTIAL,
            reference: editRecord.REFERENCEID || undefined,
            members: editRecord.MEMBERID || undefined,
            date: editRecord.VDATE ? moment(editRecord.VDATE) : null,
            refundDatenTime: editRecord.VDATE ? moment(editRecord.VDATE) : null,
            refundBy: editRecord.REFUNDUSER || editRecord.CREATEDBY || null,
            opdCategory: editRecord.CATAGORYID,
            consultant: editRecord.CONSULTANTID,
            patientTitle: editRecord.PATIENTTITLE,
            patientName: editRecord.PATIENTNAME,
            contact: editRecord.CONTACTNO,
            gender: editRecord.GENDER,
            remarks: editRecord.REMARKS,
            ageValue: Number(editRecord.AGE),
            ageType: editRecord.AGEUNIT,
            grossPayment: Number(editRecord.GROSSAMOUNT) || 0,
            discountAmount: Number(editRecord.DISCOUNT) || 0,
            partialPayment: Number(editRecord.PARTIALAMOUNT) || 0,
            netPayment: Number(editRecord.NETAMOUNT) || 0,
            balancePayment: Number(editRecord.NETBALANCE) || 0,
            tokenNo: editRecord.TOKENNO || undefined,
            recieptNo: editRecord.RECEIPTNO || undefined,
            mrNumber: editRecord.MRNO || undefined,
            createdBy: `${editRecord.CREATEDBY} - ${moment(editRecord.CREATEDTIME).format('DD-MMM-YYYY | h:mm A')}` || undefined,
            editBy: editRecord.EDITBY || undefined,
            labTest: editRecord.LABTESTS?.length
                ? editRecord.LABTESTS.map(item => item.testId)
                : undefined,
        });
    }

    const getReceiptDataForPrint = async (receiptNum) => {

        if (!receiptNum) {
            return toast.warning("Receipt Num is missing");
        }
        setPrintLoading(true);
        try {
            const res = await axiosInstance.get(`/api/outPatient/opdReceipt/getOpdReceiptnTestPrint/${receiptNum}`);
            console.log(res, "res of get Opd ReceiptnTest Print");
            setPrintData(res?.data?.data);
            setShouldPrint(true);
        } catch (error) {
            toast.error(error?.response?.data?.message || "Failed to fetch  Opd ReceiptnTest Print");
            throw error;
        } finally {
            setPrintLoading(false);
        }
    }

    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: `OPD_${"Receipt"}`
    });

    const printBtnHandler = () => {
        const receiptNo = editRecord?.RECEIPTNO;
        if (receiptNo) {
            getReceiptDataForPrint(receiptNo)
        } else {
            toast.warning("No receipt number found to print");
        }
    }


    // console.log(printData , "printData ..............");


    return (
        <div className="opd-receipt-container h-full flex flex-col">

            {
                < LastSlipIssuedModal
                    open={showLastVisitModal}
                    onCancel={() => setShowLastVisitModal(false)}
                    form={form}
                    last10PatientsData={last10PatientsData}
                    handleEdit={handleEdit}
                />
            }


            {
                < OpdReceiptModal open={showOpdReceiptModal} onCancel={() => setShowOpdReceiptModal(false)} form={form} />
            }

            <Card
                className="shadow-sm rounded-xl border-0 flex-1 min-h-0 flex flex-col"
                bodyStyle={{
                    display: 'flex',
                    flexDirection: 'column',
                    flex: 1,
                    minHeight: 0,
                    padding: '10px 16px',
                }}
                style={{
                    background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                }}
                title={
                    <div className="flex items-center justify-between">

                        <div className="flex items-center gap-3">
                            <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-full"></div>
                            <span className="text-lg font-semibold text-gray-800">
                                OPD RECEIPT
                            </span>
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                                {editRecord ? "Edit" : "New"}  Patient
                            </span>
                        </div>

                        <div className="flex-1 max-w-lg min-w-[280px]">

                            <Space.Compact className="w-full">
                                <Select
                                    value={searchType}
                                    onChange={(value) => setSearchType(value)}
                                    style={{ width: 130 }}
                                    options={[
                                        { value: 'contactNo', label: 'Contact' },
                                        { value: 'mrNo', label: 'MR No' },
                                        { value: 'receiptNo', label: 'Receipt No' },
                                    ]}
                                />
                                <AutoComplete
                                    value={searchValue}
                                    onChange={(value) => setSearchValue(value)}
                                    onSelect={handleSelectSearchedPatient}
                                    placeholder={
                                        searchType === 'receiptNo'
                                            ? 'Enter Receipt No'
                                            : searchType === 'mrNo'
                                                ? 'Enter MR No'
                                                : 'Enter Contact No'
                                    }
                                    options={searchPatientsData?.data?.map(item => ({
                                        value: item.RECEIPTNO,
                                        label: item.PATIENTNAME,
                                    }))}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            handleSearchPatient();
                                        }
                                    }}
                                    allowClear
                                    onClear={() => {
                                        setSearchValue('');
                                        setSearchPatientsData(null);
                                    }}
                                    style={{ flex: 1 }}
                                    className="hover:border-blue-400 focus:border-blue-500"
                                />
                                <Button
                                    type="primary"
                                    icon={<SearchOutlined />}
                                    onClick={() => handleSearchPatient()}
                                    className="bg-gradient-to-r from-blue-500 to-indigo-600 border-0"
                                    loading={searchPatientsLoading}
                                >
                                    Search
                                </Button>
                            </Space.Compact>

                        </div>

                        <div className="flex items-center gap-2 shrink-0">

                            <button
                                onClick={() => setShowOpdReceiptModal(true)}
                                className="flex cursor-pointer items-center gap-1.5 px-4 py-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-sm font-medium rounded-lg shadow-md shadow-blue-500/30 hover:from-blue-600 hover:to-indigo-700 transition-all duration-300"
                            >
                                <SearchOutlined className="text-white" />
                                OPD Receipt
                            </button>

                            <button
                                onClick={() => setShowLastVisitModal(true)}
                                className="flex cursor-pointer items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-medium rounded-lg shadow-md shadow-purple-500/30 hover:from-purple-600 hover:to-pink-600 transition-all duration-300"
                            >
                                <EyeOutlined className="text-white" />
                                Last 10 Receipt
                            </button>

                        </div>

                    </div>
                }
            >

                <Form
                    form={form}
                    layout="vertical"
                    className="opd-form flex-1 min-h-0 flex flex-col"
                    onFinish={onFinish}
                    onFinishFailed={onFinishFailed}
                    initialValues={{
                        date: moment(),
                        gender: 'male',
                        payment: 'cash',
                        patientTitle: 'Mr.',
                        isPartial: 0,
                        type: "1",
                    }}
                    onValuesChange={handleFieldChange}
                >

                    <div className="flex-1 min-h-0 overflow-y-auto pr-1" style={{ scrollbarGutter: 'stable' }}>

                        {/* TOP: OPD Receipt fields (LEFT) + Patient Details fields (RIGHT) */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

                            {/* ============ LEFT: OPD RECEIPT INFO ============ */}
                            <div>
                                <Divider orientation="left" className="text-xs font-semibold text-gray-600 !my-1.5">
                                    <span className="flex items-center gap-2">
                                        <span className="w-1 h-4 bg-gradient-to-b from-blue-400 to-indigo-500 rounded-full"></span>
                                        OPD Receipt
                                    </span>
                                </Divider>

                                <div className="grid grid-cols-3 gap-2">


                                    <Form.Item
                                        name="opdCategory"
                                        label={<span className="text-xs font-semibold text-gray-600">OPD Category</span>}
                                        rules={[{ required: true, message: 'Please select OPD category' }]}
                                        className="mb-0"
                                    >
                                        <Select
                                            placeholder="Select OPD Category"
                                            className="rounded-lg"
                                            allowClear
                                            suffixIcon={<span className="text-gray-400">▼</span>}
                                            onChange={opdCategoryHandler}
                                            showSearch
                                            filterOption={(input, option) =>
                                                option.children.toLowerCase().includes(input.toLowerCase())
                                            }
                                        >
                                            {opdCategoryData?.data?.map(item => (
                                                <Option key={item?.ID} value={item?.ID}>{item?.TITLE}</Option>
                                            ))}
                                        </Select>
                                    </Form.Item>

                                    <Form.Item
                                        name="consultant"
                                        label={<span className="text-xs font-semibold text-gray-600">Consultant</span>}
                                        rules={[{ required: true, message: 'Please select consultant' }]}
                                        className="mb-0"
                                    >
                                        <Select
                                            placeholder="Select Consultant"
                                            showSearch
                                            allowClear
                                            className="rounded-lg"
                                            suffixIcon={<span className="text-gray-400">▼</span>}
                                            filterOption={(input, option) =>
                                                option.children.toLowerCase().includes(input.toLowerCase())
                                            }
                                            onChange={consultantHandler}
                                        >
                                            {consultantsData?.data?.map(item => (
                                                <Option key={item.ID} value={item.ID}>{item.NAME}</Option>
                                            ))}
                                        </Select>

                                    </Form.Item>

                                    <Form.Item
                                        name="type"
                                        label={<span className="text-xs font-semibold text-gray-600">Patient Type</span>}
                                        rules={[{ required: true, message: 'Please select type' }]}
                                        className="mb-0"
                                    >
                                        <Select
                                            placeholder="Select Type"
                                            className="rounded-lg"
                                            allowClear
                                            suffixIcon={<span className="text-gray-400">▼</span>}
                                            onChange={(value, option) => {

                                                if (value == 2 || value == 4) {
                                                    setShowZakatnSPD(option)
                                                    setShowMember(null)
                                                    setSelectedMemberNo(null)
                                                }
                                                else if (value == 3) {
                                                    setShowMember(option)
                                                    setShowZakatnSPD(null)
                                                }
                                                else {
                                                    setShowZakatnSPD(null)
                                                    setShowMember(null)
                                                    setSelectedMemberNo(null)

                                                }

                                            }}
                                        >
                                            {patientCategoryData?.data?.map(item => (
                                                <Option key={item?.ID} value={item?.ID}>{item?.TITLE}</Option>
                                            ))}
                                        </Select>
                                    </Form.Item>

                                    {
                                        showMember ?
                                            <Form.Item
                                                name="members"
                                                label={<span className="text-xs font-semibold text-gray-600">Members</span>}
                                                className="mb-0"
                                            >
                                                <Select
                                                    placeholder="Select Members"
                                                    className="rounded-lg"
                                                    allowClear
                                                    suffixIcon={<span className="text-gray-400">▼</span>}
                                                    showSearch
                                                    filterOption={(input, option) => {
                                                        console.log(option, "option ......")
                                                        return option.children.toLowerCase().includes(input.toLowerCase())
                                                    }}
                                                    onChange={(value, fullOption) => setSelectedMemberNo(value || null)}
                                                >
                                                    {membersData?.data?.map(item => (
                                                        <Option key={item?.NEWNO} value={item?.NEWNO}>{item?.NAME}</Option>
                                                    ))}
                                                </Select>
                                            </Form.Item>
                                            :
                                            <Form.Item
                                                name="reference"
                                                label={<span className="text-xs font-semibold text-gray-600">Reference</span>}
                                                className="mb-0"

                                            >
                                                <Select
                                                    placeholder="Select Reference"
                                                    className="rounded-lg"
                                                    allowClear
                                                    suffixIcon={<span className="text-gray-400">▼</span>}
                                                    showSearch
                                                    filterOption={(input, option) =>
                                                        option.children.toLowerCase().includes(input.toLowerCase())
                                                    }
                                                    disabled={!showZakatnSPD ? true : false}
                                                >
                                                    {referenceData?.data?.map(item => (
                                                        <Option key={item.ID} value={item.ID}>{item.NAME}</Option>
                                                    ))}
                                                </Select>
                                            </Form.Item>
                                    }

                                    <Form.Item
                                        name="isPartial"
                                        label={<span className="text-xs font-semibold text-gray-600">Is Partial</span>}
                                        rules={[{ required: true, message: 'Please select Partial Payment' }]}
                                        className="mb-0"
                                    >
                                        <Select
                                            placeholder="Select Partial Payment"
                                            className="rounded-lg"
                                            allowClear
                                            suffixIcon={<span className="text-gray-400">▼</span>}
                                            onChange={(value, option) => {

                                                if (value == 1) {
                                                    setShowPartialnBalance(true)
                                                }
                                                else (
                                                    setShowPartialnBalance(false)
                                                )

                                            }}
                                        >
                                            {partialPayment?.map(item => (
                                                <Option key={item.value} value={item.value}>{item.label}</Option>
                                            ))}
                                        </Select>
                                    </Form.Item>

                                    <Form.Item
                                        name="date"
                                        label={<span className="text-xs font-semibold text-gray-600">Date & Time</span>}
                                        rules={[{ required: true, message: 'Please select date and time' }]}
                                        className="mb-0"
                                    >
                                        <DatePicker
                                            showTime
                                            format="DD-MMM-YYYY hh:mm"
                                            className="w-full rounded-lg hover:border-blue-400 focus:border-blue-500"
                                            placeholder="Select Date & Time"
                                            allowClear
                                            suffixIcon={<span className="text-gray-400">📅</span>}
                                        />
                                    </Form.Item>

                                    <div className='col-span-3  p-2'>

                                        <Form.Item
                                            name="labTest"
                                            label={<span className="text-xs font-semibold text-gray-600">Lab test & Amount</span>}
                                            className="mb-0 h-full"
                                        >
                                            <Select
                                                mode="multiple"
                                                placeholder="Select Lab test"
                                                showSearch
                                                allowClear
                                                className="rounded-lg vertical-tags-select h-full w-full"
                                                suffixIcon={<span className="text-gray-400">▼</span>}
                                                onChange={labTestHandler}
                                                optionFilterProp="label"
                                                filterOption={(input, option) => {
                                                    // console.log(option, "option ,........");
                                                    return option?.label?.toLowerCase().includes(input.toLowerCase())
                                                }}
                                                disabled={!islabortaryAble}
                                                listHeight={200}
                                                dropdownStyle={{ maxHeight: '300px' }}
                                            >
                                                {labTestData?.data?.map(item => (
                                                    <Option key={item?.ID} value={item?.ID} label={item.TITLE}>
                                                        <div className="flex justify-between items-center w-full">
                                                            <span className="font-medium">{item?.TITLE}</span>
                                                            <span className="text-green-600 font-semibold ml-4">
                                                                Rs. {item?.HOSPITALRATE || 0}
                                                            </span>
                                                        </div>
                                                    </Option>
                                                ))}
                                            </Select>
                                        </Form.Item>

                                    </div>

                                </div>

                            </div>

                            {/* ============ RIGHT: PATIENT DETAILS ============ */}
                            <div>

                                <Divider orientation="left" className="text-xs font-semibold text-gray-600 !my-1.5">
                                    <span className="flex items-center gap-2">
                                        <span className="w-1 h-4 bg-gradient-to-b from-blue-400 to-indigo-500 rounded-full"></span>
                                        Patient Details
                                    </span>
                                </Divider>

                                <div className="grid grid-cols-3 gap-2">

                                    <div className="flex gap-2 col-span-2">

                                        <Form.Item
                                            name="patientTitle"
                                            label={<span className="text-xs font-semibold text-gray-600">Title</span>}
                                            rules={[{ required: true, message: 'Please select title' }]}
                                            className="mb-0 w-30"
                                        >
                                            <Select
                                                placeholder="Title"
                                                className="rounded-lg"
                                                allowClear
                                                suffixIcon={<span className="text-gray-400">▼</span>}
                                                options={titleOptions}
                                            />
                                        </Form.Item>

                                        {
                                            !showMember ?
                                                <Form.Item
                                                    name="patientName"
                                                    label={<span className="text-xs font-semibold text-gray-600">Patient Name</span>}
                                                    rules={[
                                                        { required: true, message: 'Please enter patient name' },
                                                        { min: 2, message: 'Name must be at least 2 characters' }
                                                    ]}
                                                    className="mb-0 flex-1"
                                                >
                                                    <Input
                                                        placeholder="Enter patient full name"
                                                        className="rounded-lg hover:border-blue-400 focus:border-blue-500"
                                                        allowClear
                                                        prefix={<span className="text-gray-400 text-xs">👤</span>}
                                                    />
                                                </Form.Item>

                                                :
                                                <Form.Item
                                                    name="patientName"
                                                    label={<span className="text-xs font-semibold text-gray-600">Patient Name</span>}
                                                    rules={[{ required: true, message: 'Please select patient name' }]}
                                                    className="mb-0 flex-1"
                                                >
                                                    <Select
                                                        placeholder="Select patient full name"
                                                        className="rounded-lg"
                                                        allowClear
                                                        suffixIcon={<span className="text-gray-400">▼</span>}
                                                        onChange={(value, option) => {
                                                            // console.log(option , "option");
                                                            setSelectedMemberPatientId(option?.key || null)
                                                        }}
                                                        showSearch
                                                        filterOption={(input, option) => option.children.toLowerCase().includes(input.toLowerCase())}
                                                    >
                                                        {memberDependentData?.data?.map(item => (
                                                            <Option key={item?.ID} value={item?.NAME}>{item?.NAME}</Option>
                                                        ))}
                                                    </Select>
                                                </Form.Item>

                                        }

                                    </div>

                                    <Form.Item
                                        name="contact"
                                        label={<span className="text-xs font-semibold text-gray-600">Contact #</span>}
                                        rules={[
                                            { required: true, message: 'Please enter contact number' },
                                            { pattern: /^[0-9+\-\s()]{7,15}$/, message: 'Please enter a valid phone number' }
                                        ]}
                                        className="mb-0"
                                    >
                                        <Input
                                            placeholder="Enter contact number"
                                            className="rounded-lg hover:border-blue-400 focus:border-blue-500"
                                            allowClear
                                            prefix={<span className="text-gray-400 text-xs">📞</span>}
                                        />
                                    </Form.Item>

                                    <div className="flex gap-2 col-span-2">

                                        <Form.Item
                                            name="gender"
                                            label={<span className="text-xs font-semibold text-gray-600">Gender</span>}
                                            rules={[{ required: true, message: 'Please select gender' }]}
                                            className="mb-0 w-30"
                                        >
                                            <Select
                                                placeholder="Select Gender"
                                                className="rounded-lg"
                                                allowClear
                                                style={{ maxWidth: 140 }}
                                                suffixIcon={<span className="text-gray-400">▼</span>}
                                            >
                                                {genders.map(item => (
                                                    <Option key={item.value} value={item.value}>{item.label}</Option>
                                                ))}
                                            </Select>
                                        </Form.Item>

                                        <Form.Item
                                            name="remarks"
                                            label={<span className="text-xs font-semibold text-gray-600">Remarks</span>}
                                            className="mb-0 flex-1"
                                        >
                                            <TextArea
                                                placeholder="Enter any remarks or notes"
                                                rows={1}
                                                className="rounded-lg hover:border-blue-400 focus:border-blue-500"
                                                allowClear
                                            />
                                        </Form.Item>

                                    </div>

                                    <Form.Item
                                        label={<span className="text-xs font-semibold text-gray-600">Age</span>}
                                        className="mb-0"
                                        required
                                    >
                                        <div className="grid grid-cols-2 gap-2">
                                            <Form.Item
                                                name="ageValue"
                                                rules={[
                                                    { required: true, message: 'Please enter age' },
                                                    { type: 'number', min: 0, max: 150, message: 'Age must be greater then 0' }
                                                ]}
                                                className="mb-0 "
                                            >
                                                <InputNumber
                                                    placeholder="Enter age"
                                                    className="w-full! rounded-lg hover:border-blue-400 focus:border-blue-500"
                                                    type="number"
                                                    min={0}
                                                    allowClear
                                                    prefix={<span className="text-gray-400 text-xs">🔢</span>}
                                                />
                                            </Form.Item>

                                            <Form.Item
                                                name="ageType"
                                                rules={[{ required: true, message: 'Please select age type' }]}
                                                className="mb-0"
                                                initialValue="Year"
                                            >
                                                <Select
                                                    placeholder="Select Age Type"
                                                    className="rounded-lg w-full!"
                                                    allowClear
                                                    suffixIcon={<span className="text-gray-400">▼</span>}
                                                    options={ageTypeOptions}
                                                />
                                            </Form.Item>
                                        </div>

                                    </Form.Item>


                                </div>

                                {/* ============ BELOW BOTH: PAYMENT DETAILS ============ */}
                                <Divider orientation="left" className="text-xs font-semibold text-gray-600 my-1.5!">
                                    <span className="flex items-center gap-2">
                                        <span className="w-1 h-4 bg-linear-to-r from-green-400 to-emerald-500 rounded-full"></span>
                                        Payment Details
                                    </span>
                                </Divider>

                                <div className="grid grid-cols-3 lg:grid-cols-5 gap-2">

                                    <Form.Item
                                        name="grossPayment"
                                        label={<span className="text-xs font-semibold text-gray-600">Gross Payment</span>}
                                        rules={[
                                            { required: true, message: 'Please enter gross payment amount' },
                                            { type: 'number', min: 0, message: 'Amount must be greater than 0' }
                                        ]}
                                        className="mb-0"
                                    >
                                        <InputNumber
                                            placeholder="Enter gross amount"
                                            className="rounded-lg hover:border-blue-400 focus:border-blue-500 w-full!"
                                            type="number"
                                            min={0}
                                            // step={100}
                                            allowClear
                                            prefix={<span className="text-gray-400 text-xs">Rs.</span>}
                                        />
                                    </Form.Item>

                                    <Form.Item
                                        name="discountAmount"
                                        label={<span className="text-xs font-semibold text-gray-600">{showZakatnSPD?.children} Amount</span>}
                                        rules={[
                                            { type: 'number', min: 0, message: 'Amount must be greater than 0' }
                                        ]}
                                        className="mb-0"
                                    >
                                        <InputNumber
                                            placeholder="Enter  amount"
                                            className="rounded-lg hover:border-blue-400 focus:border-blue-500 w-full!"
                                            type="number"
                                            min={0}
                                            // step={100}
                                            allowClear
                                            prefix={<span className="text-gray-400 text-xs">Rs.</span>}
                                            disabled={!showZakatnSPD}
                                        />
                                    </Form.Item>


                                    <Form.Item
                                        name="partialPayment"
                                        label={<span className="text-xs font-semibold text-gray-600">Partial Payment</span>}
                                        rules={[
                                            { type: 'number', min: 0, message: 'Amount must be greater than 0' }
                                        ]}
                                        className="mb-0"
                                    >
                                        <InputNumber
                                            placeholder="Enter partial amount"
                                            className="rounded-lg hover:border-blue-400 focus:border-blue-500 w-full!"
                                            type="number"
                                            min={0}
                                            // step={100}
                                            allowClear
                                            prefix={<span className="text-gray-400 text-xs">Rs.</span>}
                                            disabled={!showPartialnBalance}
                                        />
                                    </Form.Item>

                                    <Form.Item
                                        name="netPayment"
                                        label={<span className="text-xs font-semibold text-gray-600">Net Payment</span>}
                                        rules={[
                                            { required: true, message: 'Please enter net payment amount' },
                                            { type: 'number', min: 0, message: 'Amount must be greater than 0' }
                                        ]}
                                        className="mb-0"
                                    >
                                        <InputNumber
                                            placeholder="Enter net amount"
                                            className="rounded-lg hover:border-blue-400 focus:border-blue-500 w-full!"
                                            type="number"
                                            min={0}
                                            // step={100}
                                            allowClear
                                            prefix={<span className="text-gray-400 text-xs">Rs.</span>}
                                        />
                                    </Form.Item>

                                    <Form.Item
                                        name="balancePayment"
                                        label={<span className="text-xs font-semibold text-gray-600">Balance Amount</span>}
                                        rules={[
                                            { type: 'number', min: 0, message: 'Amount must be greater than 0' }
                                        ]}
                                        className="mb-0"
                                    >
                                        <InputNumber
                                            placeholder="Enter net amount"
                                            className="rounded-lg hover:border-blue-400 focus:border-blue-500 w-full!"
                                            type="number"
                                            min={0}
                                            // step={100}
                                            allowClear
                                            prefix={<span className="text-gray-400 text-xs">Rs.</span>}
                                            disabled={!showPartialnBalance}
                                        />
                                    </Form.Item>


                                </div>

                            </div>

                        </div>

                    </div>


                    {/* STICKY ACTION FOOTER */}
                    <div className="shrink-0 pt-2 mt-2 border-t border-gray-200 flex flex-col items-center justify-between gap-2">

                        {loginUserData?.role == "Admin" &&
                            <div className="flex justify-between w-full bg-gradient-to-r from-red-50/70 to-orange-50/70 p-2 rounded-xl border border-red-200/50">

                                <div className="flex items-center gap-2">
                                    <div className="w-1 h-5 bg-gradient-to-b from-red-400 to-orange-500 rounded-full"></div>
                                    <span className="text-sm font-semibold text-red-600">Refund Information</span>
                                    <span className="px-2 py-0.5 bg-red-100 text-red-600 text-[10px] font-medium rounded-full">Optional</span>
                                </div>

                                <div className="flex items-center gap-3 bg-white/60 p-1.5 rounded-lg">
                                    <span className="text-xs font-medium text-gray-500 min-w-[80px]">Refund By:</span>
                                    <Form.Item
                                        name="refundBy"
                                        noStyle
                                    >
                                        <Select
                                            placeholder="Select Members"
                                            className="rounded-lg"
                                            allowClear
                                            suffixIcon={<span className="text-gray-400">▼</span>}
                                            showSearch
                                            filterOption={(input, option) => {
                                                console.log(option, "option ......")
                                                return option.children.toLowerCase().includes(input.toLowerCase())
                                            }}
                                        // onChange={(value, fullOption) => setSelectedMemberNo(value || null)}
                                        >
                                            {usersData?.data?.map((item, index) => (
                                                <Option key={`${item.USERID}-${index}`} value={item?.USERID}>{item?.USERID}</Option>
                                            ))}
                                        </Select>
                                    </Form.Item>
                                </div>

                                <div className="flex items-center gap-3 bg-white/60 p-1.5 rounded-lg">
                                    <span className="text-xs font-medium text-gray-500 min-w-[80px]">Date & Time :</span>
                                    <Form.Item
                                        name="refundDatenTime"
                                        noStyle
                                    >
                                        <DatePicker
                                            showTime
                                            format="DD-MMM-YYYY hh:mm A"
                                            className="w-full rounded-lg hover:border-blue-400 focus:border-blue-500"
                                            placeholder="Select Date & Time"
                                            allowClear
                                            suffixIcon={<span className="text-gray-400">📅</span>}
                                        />
                                    </Form.Item>
                                </div>

                            </div>
                        }

                        <div className='flex justify-between w-full'>

                            <div className="flex flex-wrap gap-2">

                                {
                                    editRecord?.STATUS != 1 ?
                                        <Button
                                            danger
                                            icon={<DeleteOutlined />}
                                            className="shadow-sm hover:shadow-md"
                                            onClick={() => onDeleteAndRefund("delete")}
                                            loading={deleteAndRefundLoading}
                                            disabled={!editRecord || loginUserData?.role != "Admin"}
                                        >
                                            Delete
                                        </Button>
                                        :

                                        <Button
                                            type="primary"
                                            icon={<SaveOutlined />}
                                            onClick={() => onDeleteAndRefund("restore")}
                                            loading={deleteAndRefundLoading}
                                            className="!bg-yellow-100/60 !text-yellow-700 !border-yellow-300 shadow-md shadow-yellow-500/20 hover:!bg-yellow-200/70 hover:shadow-lg hover:shadow-yellow-500/30"
                                        >
                                            Restore
                                        </Button>
                                }

                                <Button
                                    type="default"
                                    icon={<PrinterOutlined />}
                                    className="hover:border-blue-400 hover:text-blue-600"
                                    disabled={!editRecord || loginUserData?.role != "Admin"}
                                    onClick={printBtnHandler}
                                    loading={printLoading}
                                >
                                    Print
                                </Button>

                                <Button
                                    type="default"
                                    icon={<UserAddOutlined />}
                                    className="flex cursor-pointer items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-600! hover:text-blue-700! hover:border-blue-700! text-sm font-medium rounded-lg hover:bg-blue-100 transition-all duration-300 border! border-blue-200!"
                                    onClick={() => {
                                        handleReset()
                                    }}
                                >
                                    New
                                </Button>


                                <Button
                                    type="primary"
                                    icon={<SaveOutlined />}
                                    loading={addEditPatientLoading || (!editRecord && printLoading)}
                                    disabled={editRecord && loginUserData?.role != "Admin"}
                                    htmlType="submit"
                                    className="bg-linear-to-r from-emerald-500 to-green-600 border-0 shadow-md shadow-green-500/30 hover:shadow-lg hover:shadow-green-500/40"
                                >
                                    {editRecord ? "Edit" : "Save"}
                                </Button>

                            </div>

                            <div className="flex items-center gap-3 bg-gradient-to-r from-gray-50 to-blue-50/50 px-4 py-1.5 rounded-xl border border-blue-100/50">
                                <span className="text-sm font-semibold text-gray-600">Current Cash:</span>
                                <span className="text-xl font-bold text-green-600">Rs. {currentCashData?.data?.[0]?.NETAMOUNT || "0"}</span>
                            </div>

                        </div>

                    </div>

                </Form>

            </Card>

            {/* ✅ Hidden print component - Data passed via props */}
            <div style={{ display: 'none' }}>
                {
                    printData && (
                        printData?.receiptData[0]?.CATAGORYTITLE == "General O.P.D" ? (
                            <OPDCardReceipt
                                ref={printRef}
                                receipt={printData}
                            />
                        ) : (
                            <OPDServiceReceipt
                                ref={printRef}
                                receipt={printData}
                            />
                        )
                    )
                }
            </div>


        </div >
    );
};

export default OPDReceipt;















