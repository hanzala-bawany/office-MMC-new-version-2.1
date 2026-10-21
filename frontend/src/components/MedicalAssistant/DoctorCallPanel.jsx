import { useEffect, useState } from "react";
import { Button, Popconfirm, Select } from "antd";
import { toast } from "react-toastify";
import {
  PhoneOutlined,
  UserSwitchOutlined,
  SoundOutlined,
  StepForwardOutlined,
  MedicineBoxOutlined,
} from "@ant-design/icons";
import axiosInstance from "../../utills/axiosInstance";
import useFetch from "../../hooks/useFetch";


// TODO: apne real backend routes yahan daalo
const ENDPOINTS = {
  doctors: "/doctors",
  waitingPatients: (doctorId) => `/patients/waiting/${doctorId}`,
  callNext: "/call/next",
  callSpecific: "/call/specific",
  repeat: "/call/repeat",
  skip: "/call/skip",
};

const DoctorCallPanel = () => {

  const [selectedDoctorId, setSelectedDoctorId] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctorId, setDoctorId] = useState(null);
  const [patientId, setPatientId] = useState(null);
  const [loading, setLoading] = useState(false);

  // Button enable/disable rules
  const canCall = !!doctorId;
  const canSpecific = !!doctorId && !!patientId;
  const canRepeat = !!doctorId;
  const canSkip = !!doctorId;


const { data: doctorsData, loading: doctorsDataLoading, error: doctorsDataError  , reFetchData : reFetchDoctors} =
        useFetch(`/api/opd/consultants/active`);
const { data: patientsData, loading: patientsDataLoading, error: patientsDataError, reFetchData: refetchPatientsData } =
        useFetch(selectedDoctorId ? `/api/opd/doctor-patients/${selectedDoctorId}?status=14` : null);
// const { data: consultantsData, loading: consultantsLoading, error: consultantsError } =
//         useFetch('/api/receptionist/allConsultant', { facultyId: opdCategoryId || null });

// console.log(doctorsData , "doctorsData /...............");




  const fetchPatients = async (id) => {
    try {
      const res = await axiosInstance.get(ENDPOINTS.waitingPatients(id));
      setPatients(res.data?.data ?? res.data ?? []);
    } catch {
      toast.error("Patients load nahi hue");
    }
  };


  const handleDoctor = (id) => {
    setDoctorId(id);
    setPatientId(null);
    setPatients([]);
    fetchPatients(id);
  };

  // Common helper: API call + loading + toast + list refresh
  const runAction = async (url, payload, successMsg) => {
    try {
      setLoading(true);
      await axiosInstance.post(url, payload);
      toast.success(successMsg);
      fetchPatients(doctorId);
      return true;
    } catch (err) {
      toast.error(err?.response?.data?.message || "Kuch masla aa gaya");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleCall = () =>
    runAction(ENDPOINTS.callNext, { doctorId }, "Patient call ho gaya");

  const handleSpecific = async () => {

  };

  const handleRepeat = () =>
    runAction(ENDPOINTS.repeat, { doctorId }, "Dobara call kiya gaya");

  const handleSkip = () =>
    runAction(ENDPOINTS.skip, { doctorId }, "Patient skip ho gaya");

  return (
    <section className="w-full rounded-3xl overflow-hidden border border-emerald-200 bg-gradient-to-br from-emerald-50 to-green-50 shadow-lg shadow-emerald-500/10">
    
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-green-500 px-4 sm:px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-2 rounded-full">
            <MedicineBoxOutlined className="text-white text-xl" />
          </div>
          <div>
            <h3 className="text-white font-bold text-base sm:text-lg m-0">
              Doctor Patient Call
            </h3>
            <p className="text-white/80 text-xs m-0">
              Doctor select karke patient call karein
            </p>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-4 sm:p-5">
        <div className="flex flex-col gap-3 mb-5 p-4 bg-white rounded-2xl border border-emerald-200 shadow-sm">
          <Select
            size="large"
            showSearch
            placeholder="Doctor select karein"
            value={doctorId}
            onChange={handleDoctor}
            optionFilterProp="label"
            options={doctorsData?.data?.map((d) => ({ value: d.ID, label: d.NAME }))}
            className="w-full"
            loading={doctorsDataLoading}
          />
          <Select
            size="large"
            showSearch
            allowClear
            placeholder="Patient select karein"
            value={patientId}
            onChange={setPatientId}
            disabled={!doctorId}
            optionFilterProp="label"
            options={patients.map((p) => ({
              value: p.id,
              label: `${p.tokenNo ?? ""} ${p.name}`.trim(),
            }))}
            className="w-full"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Button
            type="primary"
            size="large"
            icon={<PhoneOutlined />}
            disabled={!canCall}
            loading={loading}
            onClick={handleCall}
            className="col-span-2 !h-12 !rounded-xl !font-semibold !bg-emerald-600 hover:!bg-emerald-700 disabled:!bg-gray-200"
          >
            Call Next Patient
          </Button>

          <Button
            size="large"
            icon={<UserSwitchOutlined />}
            disabled={!canSpecific}
            onClick={handleSpecific}
            className="col-span-2 !h-12 !rounded-xl !font-medium !border-emerald-500 !text-emerald-700 hover:!bg-emerald-50 disabled:!border-gray-200 disabled:!text-gray-400"
          >
            Call Specific Patient
          </Button>

          <Button
            size="large"
            icon={<SoundOutlined />}
            disabled={!canRepeat}
            onClick={handleRepeat}
            className="!h-12 !rounded-xl !border-amber-400 !text-amber-700 hover:!bg-amber-50 disabled:!border-gray-200 disabled:!text-gray-400"
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

export default DoctorCallPanel;