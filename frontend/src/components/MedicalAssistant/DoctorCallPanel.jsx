import { useState } from "react";
import { Select } from "antd";
import { MedicineBoxOutlined } from "@ant-design/icons";
import CallActions from "./CallActions";

const DoctorCallPanel = ({
  doctors = [],
  patients = [],            // selected doctor ke waiting patients
  loading = false,
  onDoctorChange,           // (doctorId) => fetch patients
  onCallNext,               // (doctorId)
  onCallSpecific,           // (doctorId, patientId)
  onRepeat,                 // (doctorId)
  onSkip,                   // (doctorId)
}) => {
  const [doctorId, setDoctorId] = useState(null);
  const [patientId, setPatientId] = useState(null);

  const handleDoctor = (id) => {
    setDoctorId(id);
    setPatientId(null);
    onDoctorChange?.(id);
  };

  return (
    <section className="w-full bg-white/95 rounded-3xl border border-indigo-200/70 p-4 sm:p-6 shadow-lg shadow-indigo-500/10">
      <h2 className="flex items-center gap-2 text-base sm:text-lg font-bold text-indigo-950 mb-4">
        <MedicineBoxOutlined className="text-indigo-600" />
        Doctor Patient Call
      </h2>

      <div className="flex flex-col gap-3 mb-5">
        <Select
          size="large"
          showSearch
          placeholder="Doctor select karein"
          value={doctorId}
          onChange={handleDoctor}
          optionFilterProp="label"
          options={doctors.map((d) => ({ value: d.id, label: d.name }))}
          className="w-full"
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

      <CallActions
        loading={loading}
        canCall={!!doctorId}
        canSpecific={!!doctorId && !!patientId}
        canRepeat={!!doctorId}
        canSkip={!!doctorId}
        onCall={() => onCallNext?.(doctorId)}
        onSpecific={() => onCallSpecific?.(doctorId, patientId)}
        onRepeat={() => onRepeat?.(doctorId)}
        onSkip={() => onSkip?.(doctorId)}
      />
    </section>
  );
};

export default DoctorCallPanel;