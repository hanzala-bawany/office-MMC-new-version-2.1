import { Form, Input, Button, message } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import axiosInstance from "../../utills/axiosInstance";
import { toast } from "react-toastify";
import { base_URL } from "../../utills/baseUrl";

const ChangePassword = () => {

    const [form] = Form.useForm();
    const loginUserData = useSelector((state) => state?.authSlice?.loginUser);
    const [saveLoading, setSaveLoading] = useState(false)

    useEffect(() => {
        if (loginUserData.username) {
            form.setFieldsValue({
                userId: loginUserData.username,
            });
        }
    }, [loginUserData])

    // saare inputs yahan console me mil jayenge, API wiring baad me
    const onFinish = async (values) => {

        console.log("ChangePassword form values:", values);

        if (values?.newPassword != values?.confirmPassword) {
            toast.error("New and Confirm passwords are not matched");
            return;
        }

        setSaveLoading(true);
        try {
            const res = await axiosInstance.post(
                `${base_URL}/api/settings/changePassword`,
                {
                    userId: loginUserData.username || null,
                    oldPassword: values?.oldPassword,
                    newPassword: values?.newPassword
                },
            );
            // console.log(res, "res of handle Remove Doctor by id");

            toast.success(res?.data?.message || "Password updated successfully");
            handleReset()

        } catch (err) {
            toast.error(err?.response?.data?.message || "Delete failed");
        } finally {
            setSaveLoading(false);
        }

    };

    const handleReset = () => {

        const userId = form.getFieldValue("userId");
        // Reset all fields
        form.resetFields();
        // Set userId back
        if (userId) {
            form.setFieldsValue({ userId });
        }

    };

    return (
        <div className="flex justify-center">
            <div className="flex h-full flex-col overflow-hidden rounded-md border border-gray-300 shadow-sm w-[65%]! mt-5">

                {/* Module Heading */}
                <div className="shrink-0 bg-[#1677ff] px-6 py-4">
                    <h2 className="text-xl font-semibold text-white">
                        Change Password
                    </h2>
                </div>

                {/* Fields */}
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={onFinish}
                    className="flex-1 min-h-0 overflow-y-auto bg-gray-50 p-5! grid grid-cols-1 lg:grid-cols-2 gap-4"
                >

                    <Form.Item
                        label="User Id"
                        name="userId"
                        rules={[{ required: true, message: "Please enter User Id" }]}
                        className="mb-3"
                    >
                        <Input
                            placeholder="Enter user id"
                            prefix={<UserOutlined className="text-gray-400" />}
                            readOnly
                            size="large"
                        />
                    </Form.Item>

                    <Form.Item
                        label="Old Password"
                        name="oldPassword"
                        rules={[{ required: true, message: "Please enter old password" }]}
                        className="mb-3"
                    >
                        <Input.Password
                            placeholder="Enter old password"
                            prefix={<LockOutlined className="text-gray-400" />}
                            size="large"
                        />
                    </Form.Item>

                    <Form.Item
                        label="New Password"
                        name="newPassword"
                        rules={[
                            { required: true, message: "Please enter new password" },
                        ]}
                        className="mb-3"
                    >
                        <Input.Password
                            placeholder="Enter new password"
                            prefix={<LockOutlined className="text-gray-400" />}
                            size="large"
                        />
                    </Form.Item>

                    <Form.Item
                        label="Confirm Password"
                        name="confirmPassword"
                        dependencies={["newPassword"]}
                        rules={[
                            { required: true, message: "Please enter confirm password" },
                        ]}
                        className="mb-0"
                    >
                        <Input.Password
                            placeholder="Confirm new password"
                            prefix={<LockOutlined className="text-gray-400" />}
                            size="large"
                        />
                    </Form.Item>


                    {/* Footer actions */}
                    <div className="shrink-0 flex justify-center gap-4 border-t border-gray-300 bg-[#c4cdf37a] px-4 py-3">
                        <Button
                            type="primary"
                            htmlType="submit"
                            className="min-w-[90px]"
                            loading={saveLoading}
                        >
                            Save
                        </Button>
                        <Button onClick={handleReset} className="min-w-22.5">
                            Reset
                        </Button>

                    </div>


                </Form>

            </div>
        </div>
    );
};

export default ChangePassword;