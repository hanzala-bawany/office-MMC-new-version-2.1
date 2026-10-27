import { useEffect, useState } from "react";
import { Button, Popconfirm, Select, Tag } from "antd";
import { toast } from "react-toastify";
import {
  TeamOutlined,
  PhoneOutlined,
  UserSwitchOutlined,
  SoundOutlined,
  StepForwardOutlined,
} from "@ant-design/icons";
import axiosInstance from "../../utills/axiosInstance";

// TODO: apne real backend routes yahan daalo
const ENDPOINTS = {
  myQueue: "/my-queue",
  callNext: "/my-queue/call-next",
  callSpecific: "/my-queue/call-specific",
  repeat: "/my-queue/repeat",
  skip: "/my-queue/skip",
};

const MyQueuePanel = () => {
  const [queue, setQueue] = useState([]);
  const [currentPatient, setCurrentPatient] = useState(null);
  const [patientId, setPatientId] = useState(null);
  const [loading, setLoading] = useState(false);

  // Button enable/disable rules
  const canCall = queue.length > 0;
  const canSpecific = !!patientId;
  const canRepeat = !!currentPatient;
  const canSkip = !!currentPatient;

  const fetchQueue = async () => {
    try {
      const res = await axiosInstance.get(ENDPOINTS.myQueue);
      const data = res.data?.data ?? res.data ?? {};
      setQueue(data.queue ?? []);
      setCurrentPatient(data.current ?? null);
    } catch {
      // toast.error("Queue load nahi hui");
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  // Common helper: API call + loading + toast + queue refresh
  const runAction = async (url, payload, successMsg) => {
    try {
      setLoading(true);
      await axiosInstance.post(url, payload);
      toast.success(successMsg);
      fetchQueue();
      return true;
    } catch (err) {
      toast.error(err?.response?.data?.message || "Kuch masla aa gaya");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleCall = () =>
    runAction(ENDPOINTS.callNext, {}, "Patient call ho gaya");

  const handleSpecific = async () => {
    const ok = await runAction(
      ENDPOINTS.callSpecific,
      { patientId },
      "Specific patient call ho gaya"
    );
    if (ok) setPatientId(null);
  };

  const handleRepeat = () =>
    runAction(
      ENDPOINTS.repeat,
      { patientId: currentPatient?.id },
      "Dobara call kiya gaya"
    );

  const handleSkip = () =>
    runAction(
      ENDPOINTS.skip,
      { patientId: currentPatient?.id },
      "Patient skip ho gaya"
    );

  return (
    <section className="w-full rounded-3xl overflow-hidden border border-amber-200 bg-gradient-to-br from-amber-50 to-yellow-50 shadow-lg shadow-amber-500/10">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-500 to-yellow-500 px-4 sm:px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="bg-white/25 p-2 rounded-full">
            <TeamOutlined className="text-white text-xl" />
          </div>
          <div className="flex-1">
            <h3 className="text-white font-bold text-base sm:text-lg m-0">
              My Queue
            </h3>
            <p className="text-white/90 text-xs m-0">Aap ki apni patient queue</p>
          </div>
          <Tag color="gold" className="!m-0">
            {queue.length} waiting
          </Tag>
        </div>
      </div>

      {/* Body */}
      <div className="p-4 sm:p-5">
        <div className="mb-4 rounded-xl bg-white border border-amber-200 px-4 py-3 text-sm shadow-sm">
          <span className="text-gray-500">Current: </span>
          <span className="font-semibold text-amber-900">
            {currentPatient?.name ?? "Koi patient call nahi hua"}
          </span>
        </div>

        <Select
          size="large"
          showSearch
          allowClear
          placeholder="Specific patient select karein"
          value={patientId}
          onChange={setPatientId}
          optionFilterProp="label"
          options={queue.map((p) => ({
            value: p.id,
            label: `${p.tokenNo ?? ""} ${p.name}`.trim(),
          }))}
          className="w-full mb-5"
        />

        <div className="grid grid-cols-2 gap-3">
          <Button
            type="primary"
            size="large"
            icon={<PhoneOutlined />}
            disabled={!canCall}
            loading={loading}
            onClick={handleCall}
            className="col-span-2 !h-12 !rounded-xl !font-semibold !bg-amber-500 hover:!bg-amber-600 disabled:!bg-gray-200"
          >
            Call Next Patient
          </Button>

          <Button
            size="large"
            icon={<UserSwitchOutlined />}
            disabled={!canSpecific}
            onClick={handleSpecific}
            className="col-span-2 !h-12 !rounded-xl !font-medium !border-amber-500 !text-amber-700 hover:!bg-amber-50 disabled:!border-gray-200 disabled:!text-gray-400"
          >
            Call Specific Patient
          </Button>

          <Button
            size="large"
            icon={<SoundOutlined />}
            disabled={!canRepeat}
            onClick={handleRepeat}
            className="!h-12 !rounded-xl !border-emerald-500 !text-emerald-700 hover:!bg-emerald-50 disabled:!border-gray-200 disabled:!text-gray-400"
          >
            Repeat
          </Button>

          <Popconfirm
            title="Patient ko skip karna hai?"
            okText="Skip"
            cancelText="Cancel"
            disabled={!canSkip}
            onConfirm={handleSkip}
          >
            <Button
              danger
              size="large"
              icon={<StepForwardOutlined />}
              disabled={!canSkip}
              className="!h-12 !rounded-xl w-full"
            >
              Skip
            </Button>
          </Popconfirm>

        </div>
      </div>
      
    </section>
  );
};

export default MyQueuePanel;