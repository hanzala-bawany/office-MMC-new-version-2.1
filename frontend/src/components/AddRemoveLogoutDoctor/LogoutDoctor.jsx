import axios from "axios";
import { useEffect, useState } from "react";
import { base_URL } from "../../utills/baseUrl";
import { Button, Card, Select, Typography } from "antd";
import { toast } from "react-toastify";

const LogoutDoctor = () => {


    const [logoutDoctor, setLogoutDoctor] = useState([]);
    const [selectedDoctorId, setSelectedDoctorId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(false);

    const { Option } = Select;
    const { Title, Text } = Typography;


    const fetchLogoutDoctors = async () => {

        setFetchLoading(true);
        try {
            const res = await axios.get(`${base_URL}/api/opd/consultants/active1`);
            console.log(res, "res of logout docotr");
            setLogoutDoctor(res?.data?.data || [])
        } catch (err) {
            toast.error("Failed to fetch logout doctors");
        } finally {
            setFetchLoading(false);
        }

    };

    useEffect(() => {
        fetchLogoutDoctors();
    }, []);

    // ✅ logout API Function
    const handleLogoutDoctor = async () => {

        console.log(selectedDoctorId, "selectedDoctorId ,,,,,,,,,,");

        if (!selectedDoctorId) {
            toast.warning("Please select a doctor first");
            return;
        }

        setLoading(true);

        try {
            const res = await axios.post(`${base_URL}/api/auth/admin/force-logout`, {
                consultantId: selectedDoctorId,
            },
            );
            console.log(res, "res of handle Logout Doctor by id");

            await fetchLogoutDoctors();
            toast.success("Doctor logout successfully");
            setSelectedDoctorId(null);

        } catch (err) {
            toast.error(err || "Delete failed");
            console.log(err , "err in handle Logout Doctor by id");
            
        } finally {
            setLoading(false);
        }
    };



    return (
        <Card className="rounded-2xl shadow-md border-0">

            {/* Heading */}
            <Title level={3} className="!mb-2 !text-gray-700">
                Logout Doctor
            </Title>
            <Text className="text-gray-500">
                Select a doctor and Logout him from his dashboard
            </Text>

            {/* Select Dropdown */}
            <div className="flex flex-col mt-6 gap-2">

                <label className="mb-2 font-medium text-xl text-gray-600">
                    Select Doctor
                </label>

                <div className="flex w-full gap-5">

                    <Select
                        allowClear
                        loading={fetchLoading}
                        showSearch
                        placeholder="Search & select doctor"
                        size="large"
                        className="w-full"
                        value={selectedDoctorId}
                        onChange={(value) => setSelectedDoctorId(value)}
                        optionFilterProp="children"
                    >
                        {logoutDoctor?.map((doc) => (
                            <Option key={doc?.ID} value={doc?.ID}>
                                {doc?.NAME}
                            </Option>
                        ))}
                    </Select>

                    {/* Selected Info */}

                    <div className=" flex px-4  items-center bg-gray-50 rounded-lg border text-md text-gray-600 w-full">
                        Selected Doctor ID :
                        <span className="ml-2 font-semibold text-gray-800">
                            {`  ${selectedDoctorId || "Not yet"}`}
                        </span>
                    </div>

                </div>

            </div>

            {/* Button */}
            <div className="mt-6 flex justify-end">
                <Button
                    danger
                    size="large"
                    className="px-6"
                    loading={loading}
                    onClick={handleLogoutDoctor}
                >
                    Logout Doctor
                </Button>
            </div>

        </Card>
    )
}

export default LogoutDoctor