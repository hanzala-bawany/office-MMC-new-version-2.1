import React, { useEffect, useState } from 'react';
import {
  Card,
  Button,
  Input,
  Table,
  Tag,
  Badge,
  Typography,
  Row,
  Col,
  Statistic,
  Space,
  Avatar,
  Modal,
  Form,
  Select,
  Divider
} from 'antd';
import {
  UserOutlined,
  CalendarOutlined,
  DollarOutlined,
  ClockCircleOutlined,
  PrinterOutlined,
  SearchOutlined,
  PlusOutlined,
  DownloadOutlined,
  EyeOutlined
} from '@ant-design/icons';
import { FaUserMd } from 'react-icons/fa';
import hospitalLogo from '../assets/MMC logo.png'; // Update path as needed
import useFetch from '../hooks/useFetch';
import { useSelector } from 'react-redux';
import SeccionOpenAlertModal from '../components/Receptionist/SeccionOpenAlertModal';

const { Title, Text } = Typography;

const ReceptionistPage = () => {

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const loginUserData = useSelector((state) => state?.authSlice?.loginUser);
  const [showSessionAlertModal, setShowSessionAlertModal] = useState(false);
  const [form] = Form.useForm();

  const { data: currentSessionData, loading: currentSessionDataLoading, error: currentSessionDataError, reFetchData: refetchcurrentSessionData }
    = useFetch(loginUserData?.username ? `/api/receptionist/getCurrentSession/${loginUserData?.username}` : null);
    

  useEffect(() => {
    if (currentSessionData?.data?.[0]?.STATUS == 2) setShowSessionAlertModal(true);
  }, [currentSessionData]);

  // Sample Data
  const patients = [
    { key: '1', id: 'P-1001', name: 'Ahmed Khan', age: 45, gender: 'Male', doctor: 'Dr. Usman Ali', department: 'Cardiology', date: '2026-08-06', time: '10:30 AM', status: 'Waiting', fee: 1500 },
    { key: '2', id: 'P-1002', name: 'Fatima Ahmed', age: 32, gender: 'Female', doctor: 'Dr. Ayesha Khan', department: 'Gynecology', date: '2026-08-06', time: '11:15 AM', status: 'In Progress', fee: 2000 },
    { key: '3', id: 'P-1003', name: 'Muhammad Ali', age: 28, gender: 'Male', doctor: 'Dr. Bilal Ahmed', department: 'Orthopedics', date: '2026-08-05', time: '09:00 AM', status: 'Completed', fee: 1200 },
    { key: '4', id: 'P-1004', name: 'Zainab Bibi', age: 55, gender: 'Female', doctor: 'Dr. Usman Ali', department: 'Cardiology', date: '2026-08-06', time: '02:00 PM', status: 'Scheduled', fee: 1500 },
    { key: '5', id: 'P-1005', name: 'Omar Farooq', age: 12, gender: 'Male', doctor: 'Dr. Ayesha Khan', department: 'Pediatrics', date: '2026-08-06', time: '03:30 PM', status: 'Waiting', fee: 800 },
  ];

  const getStatusColor = (status) => ({
    'Waiting': 'gold',
    'In Progress': 'blue',
    'Completed': 'green',
    'Scheduled': 'cyan'
  }[status] || 'default');


  const columns = [
    {
      title: 'Patient ID',
      dataIndex: 'id',
      key: 'id',
      render: (text) => <Text strong className="text-blue-600">{text}</Text>
    },
    {
      title: 'Patient',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Space>
          <Avatar icon={<UserOutlined />} className="bg-blue-500" />
          <div>
            <Text strong>{text}</Text>
            <br />
            <Text type="secondary" className="text-xs">{record.gender}, {record.age} yrs</Text>
          </div>
        </Space>
      )
    },
    {
      title: 'Doctor',
      dataIndex: 'doctor',
      key: 'doctor',
      render: (text) => (
        <Space>
          <FaUserMd className="text-blue-500" />
          <Text>{text}</Text>
        </Space>
      )
    },
    {
      title: 'Department',
      dataIndex: 'department',
      key: 'department',
      render: (text) => <Tag color="purple">{text}</Tag>
    },
    {
      title: 'Date & Time',
      key: 'datetime',
      render: (_, record) => (
        <div>
          <div><CalendarOutlined className="mr-1" /> {record.date}</div>
          <div className="text-xs text-gray-400"><ClockCircleOutlined className="mr-1" /> {record.time}</div>
        </div>
      )
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => <Badge color={getStatusColor(status)} text={status} />
    },
    {
      title: 'Fee (Rs.)',
      dataIndex: 'fee',
      key: 'fee',
      render: (fee) => <Text strong className="text-green-600">Rs. {fee}</Text>
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            size="small"
            icon={<PrinterOutlined />}
            onClick={() => {
              setSelectedPatient(record);
              setIsModalVisible(true);
            }}
          >
            Receipt
          </Button>
          <Button size="small" icon={<EyeOutlined />}>View</Button>
        </Space>
      )
    }
  ];

  return (
    <div className="h-full bg-gray-50 p-4">

      <SeccionOpenAlertModal currentSessionData={currentSessionData?.data?.[0]} isModalOpen={showSessionAlertModal} setIsModalOpen={setShowSessionAlertModal} loginUserData={loginUserData} />

      {/* Header with Company Logo */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-4 flex justify-between items-center">
        <div>
          <Title level={4} className="!mb-0">OPD Patient Management</Title>
          <Text type="secondary">Manage patients & generate receipts</Text>
        </div>
        <div className="flex items-center gap-4">
          <Button type="primary" icon={<PlusOutlined />}>New Patient</Button>
          <img src={hospitalLogo} alt="Hospital Logo" className="h-12 object-contain" />
        </div>
      </div>

      {/* Stats Cards */}
      <Row gutter={[16, 16]} className="mb-4">
        <Col xs={24} sm={12} md={6}>
          <Card className="shadow-sm hover:shadow-md transition-all">
            <Statistic title="Total Patients" value={145} prefix={<UserOutlined className="text-blue-500" />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="shadow-sm hover:shadow-md transition-all">
            <Statistic title="Today's Appointments" value={23} prefix={<CalendarOutlined className="text-green-500" />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="shadow-sm hover:shadow-md transition-all">
            <Statistic title="Pending" value={8} prefix={<ClockCircleOutlined className="text-orange-500" />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="shadow-sm hover:shadow-md transition-all">
            <Statistic title="Revenue Today" value={45200} prefix={<DollarOutlined className="text-purple-500" />} suffix="Rs." />
          </Card>
        </Col>
      </Row>

      {/* Main Table Card */}
      <Card className="shadow-sm">
        {/* Search Bar */}
        <div className="flex flex-wrap gap-2 mb-4">
          <Input
            placeholder="Search patient by name, ID or doctor"
            prefix={<SearchOutlined />}
            className="flex-1 min-w-[200px]"
            allowClear
          />
          <Button>Reset</Button>
          <Button icon={<DownloadOutlined />}>Export</Button>
        </div>

        {/* Table */}
        <Table
          columns={columns}
          dataSource={patients}
          pagination={{ pageSize: 5, showSizeChanger: true, showTotal: (total) => `Total ${total} patients` }}
          scroll={{ x: 1000 }}
          className="border rounded-lg"
        />
      </Card>

      {/* Receipt Modal */}
      <Modal
        title={
          <div className="text-center">
            <Title level={4} className="!mb-0">OPD RECEIPT</Title>
            <Text type="secondary" className="text-sm">Memon Medical Complex</Text>
          </div>
        }
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={[
          <Button key="download" icon={<DownloadOutlined />}>Download</Button>,
          <Button key="print" type="primary" icon={<PrinterOutlined />}>Print Receipt</Button>
        ]}
        width={550}
      >
        {selectedPatient && (
          <>
            <Divider className="!my-3" />
            <div className="bg-gray-50 p-4 rounded-lg">
              <Row gutter={[8, 8]}>
                <Col span={12}>
                  <Text type="secondary" className="text-xs">Patient Name</Text>
                  <br />
                  <Text strong>{selectedPatient.name}</Text>
                </Col>
                <Col span={12}>
                  <Text type="secondary" className="text-xs">Patient ID</Text>
                  <br />
                  <Text strong>{selectedPatient.id}</Text>
                </Col>
                <Col span={12}>
                  <Text type="secondary" className="text-xs">Doctor</Text>
                  <br />
                  <Text strong>{selectedPatient.doctor}</Text>
                </Col>
                <Col span={12}>
                  <Text type="secondary" className="text-xs">Department</Text>
                  <br />
                  <Text strong>{selectedPatient.department}</Text>
                </Col>
                <Col span={12}>
                  <Text type="secondary" className="text-xs">Date</Text>
                  <br />
                  <Text strong>{selectedPatient.date}</Text>
                </Col>
                <Col span={12}>
                  <Text type="secondary" className="text-xs">Time</Text>
                  <br />
                  <Text strong>{selectedPatient.time}</Text>
                </Col>
              </Row>
            </div>

            <Form form={form} layout="vertical" className="mt-3">
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="Consultation Fee" name="fee">
                    <Input prefix="Rs." defaultValue={selectedPatient.fee} disabled />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Payment Method" name="paymentMethod">
                    <Select defaultValue="Cash">
                      <Select.Option value="Cash">Cash</Select.Option>
                      <Select.Option value="Credit Card">Credit Card</Select.Option>
                      <Select.Option value="Debit Card">Debit Card</Select.Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
            </Form>

            <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-2">
              <div className="flex justify-between items-center">
                <Text strong>Total Amount</Text>
                <Text strong className="text-2xl text-green-600">Rs. {selectedPatient.fee}</Text>
              </div>
            </div>

            <div className="text-center mt-3">
              <Text type="secondary" className="text-xs">Thank you for visiting Memon Medical Complex</Text>
              <br />
              <Text type="secondary" className="text-[10px]">This is a computer generated receipt</Text>
            </div>
          </>
        )}
      </Modal>

    </div>
  );
};

export default ReceptionistPage;