import { useState } from "react";
import { Button, Popconfirm, Select, Tag } from "antd";
import { toast } from "react-toastify";
import {
  PhoneOutlined,
  SoundOutlined,
  StepForwardOutlined,
  MedicineBoxOutlined,
} from "@ant-design/icons";
import axiosInstance from "../../utills/axiosInstance";
import useFetch from "../../hooks/useFetch";
import { base_URL } from "../../utills/baseUrl";

// "3 (waiting)" -> 3
const parseToken = (token) => parseInt(token, 10);

// Patient dropdown option ka card (waiting list aur current dono me use hota hai)
const PatientOption = ({ patient }) => (
  <div className="py-2 px-3 border-b border-gray-100 last:border-0 hover:bg-emerald-50 transition-colors">
    <div className="font-semibold text-gray-800 text-sm mb-1">
      {patient?.PATIENTNAME}
    </div>
    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-600">
      <span>🎫 Token: {patient?.TOKENNO}</span>
      <span>📅 Age: {patient?.AGE}</span>
      <span>👤 Gender: {patient?.GENDER}</span>
    </div>
  </div>
);

const DoctorCallPanel = () => {

  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [isNextLoading, setIsNextLoading] = useState(false);
  const [isSpecificLoading, setIsSpecificLoading] = useState(false);
  const [isSkipLoading, setIsSkipLoading] = useState(false);
  const [isRepeatLoading, setIsRepeatLoading] = useState(false);

  const { data: doctorsData, loading: doctorsLoading } = useFetch(
    `/api/opd/consultants/active`
  );

  const { data: patientsData, reFetchData: refetchPatientsData } = useFetch(
    selectedDoctor?.ID ? `/api/opd/doctor-patients/${selectedDoctor.ID}` : null
  );

  // patients array ka pehla object = jo patient abhi doctor ke pass baitha hai
  const currentPatient = selectedDoctor
    ? patientsData?.data?.patients?.[0] ?? null
    : null;
  const waitingList = selectedDoctor
    ? patientsData?.data?.skippedTokenList ?? []
    : [];

  // Button rules
  const hasDoctor = !!selectedDoctor;
  const isSpecificMode = hasDoctor && !!selectedPatient;
  const canRepeat = hasDoctor && !!currentPatient;
  const canSkip = hasDoctor && !!currentPatient;

  const mainButtonLabel = isSpecificMode
    ? "Call Specific Patient"
    : currentPatient
      ? "Next Patient"
      : "START";

  const handleDoctorChange = (id) => {
    const doctor = doctorsData?.data?.find((d) => d.ID === id) ?? null;
    setSelectedDoctor(doctor);
    setSelectedPatient(null);
  };

  const handlePatientChange = (tokenNo) => {
    const patient = waitingList.find((p) => p.TOKENNO === tokenNo) ?? null;
    setSelectedPatient(patient);
  };

  // NEXT: doctorId + jo patient abhi doctor ke pass hai uska receiptNo
  const nextHandler = async () => {

    try {
      setIsNextLoading(true);
      await axiosInstance.post(`${base_URL}/api/opd/doctor/next-patient`, {
        doctorId: selectedDoctor?.ID,
        receiptNo: currentPatient?.RECEIPTNO || null,
        remarks: null,
        primaryDiagnosis: null,
        medicalTests: null,
        treatment: null,
        medicine: null,
        medicalPlan: null,
      });
      await refetchPatientsData();
      toast.success("Next patient called");
    } catch (err) {
      console.log(err, "error in next Handler");
      toast.error(err?.response?.data?.message || err?.message || "Error");
    } finally {
      setIsNextLoading(false);
    }

  };

  // SPECIFIC: doctorId + selected patient ka token number
  const specificCallingHandler = async () => {
    try {
      setIsSpecificLoading(true);
      await axiosInstance.post(
        `${base_URL}/api/opd/doctor/patient-specific-call`,
        {
          doctorId: selectedDoctor?.ID,
          tokenNo: parseToken(selectedPatient?.TOKENNO),
          remarks: "",
          primaryDiagnosis: "",
          medicalTests: "",
          treatment: "",
          medicalPlan: "",
          medicine: "",
        }
      );
      setSelectedPatient(null);
      await refetchPatientsData();
      toast.success("Specific patient called");
    } catch (err) {
      console.log(err, "error in specific Handler");
      toast.error(err?.response?.data?.message || err?.message || "Error");
    } finally {
      setIsSpecificLoading(false);
    }
  };

  // SKIP: doctorId, receiptNo null
  const skipHandler = async () => {
    try {
      setIsSkipLoading(true);
      await axiosInstance.post(`${base_URL}/api/opd/doctor/patient-skipped`, {
        doctorId: selectedDoctor?.ID,
        receiptNo: null,
      });
      await refetchPatientsData();
      toast.success("Patient skipped");
    } catch (err) {
      console.log(err, "error in skip Handler");
      toast.error(err?.response?.data?.message || err?.message || "Error");
    } finally {
      setIsSkipLoading(false);
    }
  };

  // REPEAT: doctorId + doctorName + current patient ka token
  const repeatCallingHandler = async () => {
    try {
      setIsRepeatLoading(true);
      await axiosInstance.post(
        `${base_URL}/api/opd/doctor/patient-repeat-call`,
        {
          doctorId: selectedDoctor?.ID,
          doctorName: selectedDoctor?.NAME,
          patientToken: currentPatient?.TOKENNO,
        }
      );
      toast.success("Repeat calling");
    } catch (err) {
      console.log(err, "error in repeat Handler");
      toast.error(err?.response?.data?.message || err?.message || "Error");
    } finally {
      setIsRepeatLoading(false);
    }
  };

  return (
    <section className="w-full rounded-3xl overflow-hidden border border-emerald-200 bg-gradient-to-br from-emerald-50 to-green-50 shadow-lg shadow-emerald-500/10">
    
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-green-500 px-4 sm:px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-2 rounded-full">
            <MedicineBoxOutlined className="text-white text-xl" />
          </div>
          <div className="flex-1">
            <h3 className="text-white font-bold text-base sm:text-lg m-0">
              Doctor Patient Call
            </h3>
            <p className="text-white/80 text-xs m-0">
              Doctor select karke patient call karein
            </p>
          </div>
          {hasDoctor && (
            <Tag color="green" className="!m-0">
              {patientsData?.data?.todayAppointments ?? 0} total
            </Tag>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="p-4 sm:p-5">
        <div className="flex flex-col gap-3 mb-5 p-4 bg-white rounded-2xl border border-emerald-200 shadow-sm">
          
          {/* Doctor */}
          <Select
            size="large"
            showSearch
            allowClear
            placeholder="Doctor select karein"
            value={selectedDoctor?.ID}
            onChange={handleDoctorChange}
            optionFilterProp="label"
            options={doctorsData?.data?.map((d) => ({
              value: d.ID,
              label: d.NAME,
            }))}
            loading={doctorsLoading}
            className="w-full"
          />

          {/* Patient (70%) + Current patient (30%) */}
          <div className="flex gap-2">
            <Select
              size="large"
              className="!w-[70%]"
              placeholder={hasDoctor ? "Choose a patient..." : "Select doctor first"}
              value={selectedPatient?.TOKENNO}
              onChange={handlePatientChange}
              disabled={!hasDoctor}
              showSearch
              allowClear
              optionFilterProp="label"
              listHeight={400}
              popupMatchSelectWidth={false}
              OptionType ={{ minWidth: "300px", whiteSpace: "normal" }}
              options={waitingList.map((p) => ({
                value: p.TOKENNO,
                label: `${p.PATIENTNAME} (Token: ${p.TOKENNO})`,
                patient: p,
              }))}
              optionRender={(option) => <PatientOption patient={option.data.patient} />}
            />

            <Select
              size="large"
              className="!w-[30%]"
              placeholder="Current"
              value={currentPatient ? currentPatient.RECEIPTNO : undefined}
              disabled={!currentPatient}
              popupMatchSelectWidth={false}
              OptionType ={{ minWidth: "300px", whiteSpace: "normal" }}
              options={
                currentPatient
                  ? [
                      {
                        value: currentPatient.RECEIPTNO,
                        label: `Token ${currentPatient.TOKENNO}`,
                        patient: currentPatient,
                      },
                    ]
                  : []
              }
              optionRender={(option) => <PatientOption patient={option.data.patient} />}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Button
            type="primary"
            size="large"
            icon={<PhoneOutlined />}
            disabled={!hasDoctor}
            loading={isNextLoading || isSpecificLoading}
            onClick={isSpecificMode ? specificCallingHandler : nextHandler}
            className="col-span-2 !h-12 !rounded-xl !font-semibold !bg-emerald-600 hover:!bg-emerald-700 disabled:!bg-gray-200"
          >
            {mainButtonLabel}
          </Button>

          <Button
            size="large"
            icon={<SoundOutlined />}
            loading={isRepeatLoading}
            disabled={!canRepeat}
            onClick={repeatCallingHandler}
            className="!h-12 !rounded-xl !border-amber-400 !text-amber-700 hover:!bg-amber-50 disabled:!border-gray-200 disabled:!text-gray-400"
          >
            Repeat
          </Button>

          <Popconfirm
            title="Patient ko skip karna hai?"
            okText="Skip"
            cancelText="Cancel"
            disabled={!canSkip}
            onConfirm={skipHandler}
          >
            <Button
              danger
              size="large"
              icon={<StepForwardOutlined />}
              loading={isSkipLoading}
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