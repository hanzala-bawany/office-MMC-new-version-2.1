// frontend/src/pages/OpdReceiptPage.jsx
import React, { useEffect, useState } from 'react';
import { Tabs } from 'antd';
import { UserOutlined, SearchOutlined } from '@ant-design/icons';
import hospitraxLogo from '../assets/productLogoBgRemove.png';
import mmcLogo from '../assets/MMC logo.png';
import OPDSearch from '../components/Receptionist/OPDSearch';
import OPDReceipt from '../components/Receptionist/OPDReceipt';
import LastSlipIssuedModal from '../components/Receptionist/LastSlipIssuedModal';
import LogoutModal from '../utills/LogoutModal';
import { useSelector } from 'react-redux';
import SeccionOpenAlertModal from '../components/Receptionist/SeccionOpenAlertModal';
import { MedicineBoxOutlined, ExperimentOutlined, HeartOutlined, TeamOutlined } from '@ant-design/icons';


// OpdReceiptPage.jsx — trimmed version
const OpdReceiptPage = () => {

    const [activeTab, setActiveTab] = useState('1');
    const [editRecord, setEditRecord] = useState(null);
    const loginUserData = useSelector((state) => state?.authSlice?.loginUser);

    const handleEdit = (record) => {
        setEditRecord(record);
        setActiveTab('1');
    };

    const items = [
        { key: '1', label: <span className="flex items-center gap-2"><UserOutlined />Add Patient</span>,
          children: <OPDReceipt editRecord={editRecord} handleEdit={handleEdit} clearEditRecord={() => setEditRecord(null)} /> },
        { key: '2', label: <span className="flex items-center gap-2"><SearchOutlined />Search Patient</span>,
          children: <OPDSearch handleEdit={handleEdit} /> },
    ];



    return (
        <>

            <div className="h-full flex flex-col">
                <Tabs activeKey={activeTab} onChange={setActiveTab} items={items} className="receptionist-tabs" size="large" />
            </div>
        </>
    );
};

export default OpdReceiptPage;




