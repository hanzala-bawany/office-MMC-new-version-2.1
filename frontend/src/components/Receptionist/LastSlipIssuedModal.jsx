import React from 'react';
import { Modal, Table, Button, Tag } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import moment from 'moment';

const LastSlipIssuedModal = ({ open, onCancel, last10PatientsData: lastPatientData, handleEdit }) => {

    const patients = lastPatientData?.data || [];

    const columns = [
        {
            title: 'Patient Name',
            dataIndex: 'PATIENTNAME',
            key: 'PATIENTNAME',
            render: (text, record) => (
                <span className="font-medium text-gray-800">
                    {record.PATIENTTITLE} {text}
                </span>
            ),
        },
        {
            title: 'Receipt #',
            dataIndex: 'RECEIPTNO',
            key: 'RECEIPTNO',
            render: (text) => <Tag color="blue">{text}</Tag>,
        },
        {
            title: 'MR No',
            dataIndex: 'MRNO',
            key: 'MRNO',
        },
        {
            title: 'Contact',
            dataIndex: 'CONTACTNO',
            key: 'CONTACTNO',
        },
        {
            title: 'Action',
            key: 'action',
            width: 90,
            render: (_, record) => (
                <Button
                    type="primary"
                    size="small"
                    icon={<EditOutlined />}
                    onClick={() => {
                        handleEdit?.(record);
                        onCancel?.();
                    }}
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 border-0"
                >
                    Edit
                </Button>
            ),
        },
    ];

    return (
        <Modal
            title="Last 10 Slip Issued"
            open={open}
            onCancel={onCancel}
            footer={null}
            width={900}
        >
            <Table
                columns={columns}
                dataSource={patients}
                rowKey={(record) => record.RECEIPTNO}
                pagination={false}
                size="small"
                scroll={{ y: '50vh' }}   
                locale={{ emptyText: 'No recent slips found' }}
                style={{minHeight : "200px"}}
            />
        </Modal>
    );
};

export default LastSlipIssuedModal;