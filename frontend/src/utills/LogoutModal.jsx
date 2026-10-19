import { toast } from "react-toastify";
import { logoutUser } from "../reduxToolKit/authSlice";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { CloseOutlined, ExclamationCircleOutlined, LogoutOutlined, SafetyOutlined, UserOutlined } from "@ant-design/icons";
import { Modal } from "antd";

const LogoutModal = ({ isModalOpen , setIsModalOpen , loginUserData }) => {

    const dispatch = useDispatch()
    const navigate = useNavigate()

    const handleModalLogout = () => {
        dispatch(logoutUser());
        toast.success("Logout Successful");
        navigate("/login");
    };



    return (
        <Modal
            open={isModalOpen}
            onCancel={() => setIsModalOpen(false)}
            footer={null}
            centered
            width={400}
            closable={false}
            maskClosable={true}
            styles={{
                content: {
                    borderRadius: '24px',
                    overflow: 'hidden',
                    padding: 0,
                },
                body: {
                    padding: 0,
                }
            }}
        >
            <div className="bg-gradient-to-br from-indigo-50 to-blue-50">

                {/* Modal Header */}
                <div className="relative bg-gradient-to-r from-indigo-600 to-blue-600 px-6 py-4">
                    <button
                        onClick={() => setIsModalOpen(false)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white transition-colors"
                    >
                        <CloseOutlined className="text-lg cursor-pointer" />
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="bg-white/20 p-2 rounded-full">
                            <SafetyOutlined className="text-white text-xl" />
                        </div>
                        <div>
                            <h3 className="text-white font-bold text-lg m-0">Memon Medical Complex</h3>
                            <p className="text-white/80 text-sm m-0">Hospital Management System</p>
                        </div>
                    </div>
                </div>

                {/* Modal Body */}
                <div className="p-6">

                    {/* Warning Message */}
                    <div className="mb-6 p-5 bg-amber-50 rounded-2xl border border-amber-200 shadow-sm">

                        {/* Top Warning */}
                        <div className="flex items-center justify-center gap-2 text-amber-700 text-sm font-medium">
                            <ExclamationCircleOutlined className="text-lg" />
                            <span>Are you sure you want to logout?</span>
                        </div>

                        {/* User Info */}
                        <div className="mt-4 flex items-center justify-center gap-3 bg-white border border-gray-200 rounded-xl px-4 py-2 shadow-sm">
                            <div className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-100 text-blue-600">
                                <UserOutlined />
                            </div>
                            <span className="text-gray-800 font-semibold text-sm tracking-wide">
                                {loginUserData?.username} ||  {loginUserData?.role} 
                            </span>
                        </div>

                        {/* Footer Text */}
                        <p className="text-xs text-gray-500 mt-3 text-center">
                            You will be redirected to the login page.
                        </p>

                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="flex-1 px-4 py-2.5 cursor-pointer rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleModalLogout}
                            className="flex-1 px-4 py-2.5 rounded-xl cursor-pointer bg-red-600 text-white font-medium hover:bg-red-700 transition-all flex items-center justify-center gap-2"
                        >
                            <LogoutOutlined />
                            Logout
                        </button>
                    </div>

                </div>

            </div>

        </Modal>
    )
}

export default LogoutModal