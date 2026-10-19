import { useCallback, useEffect } from "react";
import { Form, InputNumber, Button } from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import useFetch from "../hooks/useFetch";
import { useSelector } from "react-redux";

const CurrentCashPage = () => {

  const [form] = Form.useForm();

  const loginUserData = useSelector((state) => state?.authSlice?.loginUser);
  const { data: currentCashData, loading: currentCashLoading, error: currentCashError, reFetchData: currentCashPatients } =
    useFetch(loginUserData?.username ? `/api/statisticsRoutes/getCurrentCash/${loginUserData?.username}` : null);

  const handleRefresh = useCallback(() => {
    currentCashPatients();
  }, [currentCashPatients]);

  // console.log(currentCashData , "currentCashData ..........");

    useEffect(() => {
    if (currentCashData?.data && currentCashData.data.length > 0) {
      const cashData = currentCashData.data[0];
      form.setFieldsValue({
        advanceReceipt: cashData.ADVAMOUNT || 0,
        refundAmount: cashData.REFUNDAMOUNT || 0,
        totalIPD: cashData.TOTALIPD || 0,
        opd: cashData.OPD || 0,
        // currentCash: cashData.CURRENTCASH || 0,
      });
    }
  }, [currentCashData, form]);
  


  return (
    <div className="flex justify-center">

      <div className="flex h-full flex-col overflow-hidden rounded-md border border-gray-300 shadow-sm w-[65%]! mt-5">

        {/* Module Heading */}
        <div className="shrink-0 bg-[#1677ff] px-6 py-4">
          <h2 className="text-xl font-semibold text-white">
            Current Cash Status
          </h2>
        </div>

        {/* Fields */}
        <Form
          form={form}
          initialValues={{
            advanceReceipt: 0,
            refundAmount: 0,
            totalIPD: 0,
            opd: 0,
          }}
          className="flex-1 min-h-0 overflow-y-auto bg-gray-50 p-5! grid grid-cols-1 lg:grid-cols-2 gap-4"
          layout="vertical"
        >

          <Form.Item label="Advance Receipt" name="advanceReceipt" className="mb-3">
            <InputNumber
              readOnly
              controls
              className="w-full!"
              size="large"
            />
          </Form.Item>


          <Form.Item label="Refund Amount" name="refundAmount" className="mb-3">
            <InputNumber
              readOnly
              controls
              className="w-full!"
              size="large"
            />
          </Form.Item>

          <Form.Item label="Total IPD" name="totalIPD" className="mb-0">
            <InputNumber
              readOnly
              controls
              className="w-full!"
              size="large"
            />
          </Form.Item>

          <Form.Item label="OPD" name="opd" className="mb-0">
            <InputNumber
              readOnly
              controls
              className="w-full!"
              size="large"
            />
          </Form.Item>
        </Form>

        {/* Footer actions */}
        <div className="shrink-0 flex justify-center gap-4 border-t border-gray-300 bg-[#c4cdf37a] px-4 py-3">
          <Button
            icon={<ReloadOutlined />}
            loading={currentCashLoading}
            onClick={handleRefresh}
            className="flex cursor-pointer items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-600! hover:text-blue-700! hover:border-blue-700! text-sm font-medium rounded-lg hover:bg-blue-100 transition-all duration-300 border! border-blue-200!"
          >
            Refresh
          </Button>
        </div>

      </div>

    </div>
  );
};

export default CurrentCashPage;