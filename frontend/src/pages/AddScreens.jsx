import React, { useState, useEffect } from "react";
import {
    Select,
    Input,
    Button,
    Table,
    Modal,
    Form,
    message,
    Space,
    Tag,
    Tooltip,
    Card,
} from "antd";
import {
    PlusOutlined,
    DeleteOutlined,
    EditOutlined,
    SoundOutlined,
    BulbOutlined,
    SearchOutlined,
} from "@ant-design/icons";
import axios from "axios";
import { toast } from "react-toastify";
import { base_URL } from "../utills/baseUrl";



const AddScreens = () => {

    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [selectedFaculties, setSelectedFaculties] = useState([]);
    const [faculties, setFaculties] = useState([]);
    const [selectedScreen, setSelectedScreen] = useState(null);
    const [pronounceName, setPronounceName] = useState("");
    const [tableData, setTableData] = useState([]);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const idArray = selectedFaculties?.map(item => item?.id);

    // console.log(editingId, "editingId .......");
    // console.log(selectedFaculties, "selectedFaculties .......");
    // console.log(selectedScreen, "selectedScreen .......");

    useEffect(() => {
        fetchFaculty();
        fetchTableData();
    }, []);

    const fetchFaculty = async () => {
        try {
            const res = await axios.get(`${base_URL}/api/admin/hms-faculties`);
            // console.log(res, "............. res fof get faculty");

            const facultyData = (res?.data?.data || [])
                ?.filter((item) => item?.ID)
                ?.map((item) => ({
                    id: item?.ID,
                    name: item?.NAME,
                }));

            // const tableDoctorsData = doctorsData?.filter(
            //     (item) => item?.pronounceName,
            // );

            // console.log("Mapped Doctors: .......... ", doctorsData);

            setFaculties(facultyData);
            // setTableData(tableDoctorsData);
        } catch (error) {
            console.error("Error fetching doctors:", error);
            message.error("Failed to fetch doctors");
        }
    };

    const fetchTableData = async () => {
        try {
            const res = await axios.get(`${base_URL}/api/admin/screen-faculty-map`);
            // console.log(res, "............. res of  fetch Table Data");


            const Data = res?.data?.data || [];
            setTableData(Data);

        } catch (error) {
            console.error("Error fetching doctors:", error);
            message.error("Failed to fetch doctors");
        }
    };

    const handleAdd = async () => {
        
        if (!idArray[0] || !selectedScreen?.id) {
            toast.warning("Please select screen and faculty");
            return;
        }

        setLoading(true);
        try {
            const res = await axios.post(`${base_URL}/api/admin/screen-faculty-map`, {
                createdBy: "Admin",
                facultyIds: idArray,
                screenId: selectedScreen?.id,
            });

            if (res.data.success) {
                toast.success("Faculties add on Screen successfully");
                setPronounceName("");
                setSelectedScreen(null);
                setSelectedFaculties([]);
                setIsEditMode(false);
                setEditingId(null);
            }
            fetchTableData()

        } catch (err) {
            toast.error(err?.message);
        } finally {
            setLoading(false);
        }
    }; 

    // ✅ Updated handleEdit - ONLY sets pronounce name, NOT doctor
    const handleEdit = (record) => {
        // console.log(record, "////////////");

        // Convert FACULTY array to selectedFaculties format (id, name)
        const formattedFaculties = (record?.FACULTY || []).map(faculty => ({
            id: faculty?.FACULTY_ID,
            name: faculty?.FACULTY_NAME,
        }));

        setPronounceName(record.pronounceName || "");
        setSelectedFaculties(formattedFaculties);
        setSelectedScreen({
            id: record?.SCREEN_ID,
            name: record?.SCREEN_NAME,
        });
        setIsEditMode(true);
        setEditingId(record?.SCREEN_ID);  // SCREEN_ID as editingId

        toast.info(`Editing Screen: ${record?.SCREEN_NAME}`);
    };

    // ✅ Cancel edit mode
    const handleCancelEdit = () => {
        setPronounceName("");
        setSelectedFaculties([]);
        setSelectedScreen(null);
        setIsEditMode(false);
        setEditingId(null);
    };


    const columns = [
        {
            title: "Screen ID",
            dataIndex: "SCREEN_ID",
            key: "screenId",
            width: 120,
            render: (text) => <Tag color="blue">{text || "N/A"}</Tag>,
        },
        {
            title: "Screen Name",
            dataIndex: "SCREEN_NAME",
            key: "screenName",
            width: 200,
            render: (text) => (
                <span className="font-medium text-gray-700">{text || "N/A"}</span>
            ),
        },
        {
            title: "Faculties",
            dataIndex: "FACULTY",
            key: "faculties",
            width: 400,
            render: (faculties) => (
                <div className="flex flex-wrap gap-2">
                    {faculties?.map((faculty, index) => (
                        <Tag key={index} color="cyan" className="text-sm">
                            {faculty.FACULTY_NAME}
                        </Tag>
                    ))}
                </div>
            ),
        },
        {
            title: "Actions",
            key: "actions",
            width: 150,
            fixed: "right",
            render: (_, record) => (
                <Space>
                    <Tooltip title="Edit">
                        <Button
                            type="link"
                            icon={<EditOutlined />}
                            onClick={() => handleEdit(record)}
                            className="text-blue-600 hover:text-blue-800"
                        />
                    </Tooltip>
                </Space>
            ),
        },
    ];

    const screenOptions = [
        {
            id: 6,
            name: "Screen 5",
        },
        {
            id: 7,
            name: "Screen 6",
        },
        {
            id: 8,
            name: "Screen 7",
        },
        {
            id: 9,
            name: "Screen 8",
        },
        {
            id: 10,
            name: "Screen 9",
        },
    ];

    return (

        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6">
            <div className="max-w-7xl mx-auto">

                {/* Header */}
                <div className="mb-8 text-center">

                    <h1 className="text-3xl font-bold text-gray-800 mb-2">
                        Screen Display Manager
                    </h1>
                    <p className="text-gray-500">
                        Manage Screen Display bt adding faculty in Screens
                    </p>
                </div>

                {/* Input Section Card */}
                <Card className="mb-8 shadow-md border-0 rounded-2xl overflow-hidden">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Doctor Select - Always enabled */}
                        <div>
                            <label className="block text-gray-700 text-sm font-semibold mb-2">
                                Select Screen <span className="text-red-500">*</span>
                            </label>
                            <Select
                                allowClear
                                showSearch
                                placeholder="Select Screen"
                                className="w-full"
                                size="large"
                                value={selectedScreen?.name}
                                onChange={(value, option) => {
                                    if (!value) {
                                        setSelectedScreen(null);
                                        return;
                                    }

                                    setSelectedScreen({
                                        id: value,
                                        name: option.label,
                                    });
                                }}
                                suffixIcon={<SearchOutlined className="text-gray-400" />}
                                options={screenOptions.map((doc) => ({
                                    value: doc.id,
                                    label: doc.name || "Unknown",
                                }))}
                                optionFilterProp="label"

                            />
                        </div>

                        {/* Pronounce Name Input */}
                        <div>
                            <label className="block text-gray-700 text-sm font-semibold mb-2">
                                Select Faculties <span className="text-red-500">*</span>
                            </label>
                            <Select
                                mode="multiple"
                                allowClear
                                showSearch
                                placeholder="Search and select doctor"
                                className="w-full"
                                size="large"
                                value={selectedFaculties.map(f => f.id)}
                                onChange={(values, options) => {
                                    const formatted = options?.map(opt => ({
                                        id: opt.value,
                                        name: opt.label,
                                    }));

                                    setSelectedFaculties(formatted);
                                }}
                                options={faculties?.map((item) => ({
                                    value: item.id,
                                    label: item.name,
                                }))}
                                optionFilterProp="label"
                            />
                        </div>
                    </div>

                    {/* Buttons Row */}
                    <div className="flex gap-4 mt-6">
                        {isEditMode ? (

                            <>
                                <Button
                                    type="primary"
                                    icon={<EditOutlined />}
                                    size="large"
                                    onClick={handleAdd}
                                    loading={loading}
                                    className="bg-orange-600 hover:bg-orange-700 border-none flex-1 h-12 text-base font-medium rounded-lg"
                                >
                                    Update Faculty
                                </Button>
                            </>
                        ) : (

                            <Button
                                type="primary"
                                icon={<PlusOutlined />}
                                size="large"
                                onClick={handleAdd}
                                loading={loading}
                                className="bg-blue-600 hover:bg-blue-700 border-none flex-1 h-12 text-base font-medium rounded-lg"
                            >
                                Add Faculty
                            </Button>
                        )}

                        <Button
                            size="large"
                            onClick={handleCancelEdit}
                            className="border-gray-300 text-gray-700 flex-1 h-12 text-base font-medium rounded-lg"
                        >
                            Cancel
                        </Button>

                    </div>

                </Card>

                {/* Table Section Card */}
                <Card className="shadow-md border-0 rounded-2xl overflow-hidden">
                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <h2 className="text-xl font-semibold text-gray-800">
                                Screen Display List
                            </h2>
                        </div>
                        <Tag color="blue" className="text-base px-3 py-1 rounded-full">
                            {tableData.length} Records
                        </Tag>
                    </div>

                    <Table
                        columns={columns}
                        dataSource={tableData}
                        rowKey="SCREEN_ID"
                        // loading={loading}
                        pagination={{
                            pageSize: 10,
                            showTotal: (total) => `Total ${total} records`,
                            showSizeChanger: true,
                            pageSizeOptions: ["10", "20", "50"],
                        }}
                        scroll={{ x: 800 }}
                        className="[&_.ant-table-thead>tr>th]:bg-gray-50 
                                 [&_.ant-table-thead>tr>th]:text-gray-800 
                                 [&_.ant-table-thead>tr>th]:font-semibold 
                                 [&_.ant-table-thead>tr>th]:text-sm 
                                 [&_.ant-table-thead>tr>th]:border-b-2 
                                 [&_.ant-table-thead>tr>th]:border-gray-200
                                 [&_.ant-table-tbody>tr>td]:text-gray-700 
                                 [&_.ant-table-tbody>tr>td]:border-b 
                                 [&_.ant-table-tbody>tr>td]:border-gray-100
                                 [&_.ant-table-tbody>tr:hover>td]:bg-gray-50
                                 [&_.ant-pagination-item-active]:bg-blue-600 
                                 [&_.ant-pagination-item-active]:border-blue-600
                                 [&_.ant-pagination-item-active_a]:text-white"
                    />
                </Card>

            </div>
        </div>
    )
}

export default AddScreens