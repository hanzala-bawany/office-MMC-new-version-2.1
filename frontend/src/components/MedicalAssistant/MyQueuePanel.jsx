import { useState } from "react";
import { Select, Tag } from "antd";
import { TeamOutlined } from "@ant-design/icons";
import CallActions from "./CallActions";

const MyQueuePanel = ({
  queue = [],               // MA ki apni queue
  currentPatient = null,    // abhi jis ko call kiya
  loading = false,
  onCallNext,
  onCallSpecific,           // (patientId)
  onRepeat,
  onSkip,
}) => {
    
  const [patientId, setPatientId] = useState(null);

  return (
    <section className="w-full bg-white/95 rounded-3xl border border-indigo-200/70 p-4 sm:p-6 shadow-lg shadow-indigo-500/10">
      <div className="flex items-center justify-between mb-4">
        <h2 className="flex items-center gap-2 text-base sm:text-lg font-bold text-indigo-950">
          <TeamOutlined className="text-indigo-600" />
          My Queue
        </h2>
        <Tag color="blue">{queue.length} waiting</Tag>
      </div>

      <div className="mb-4 rounded-xl bg-indigo-50 border border-indigo-100 px-4 py-3 text-sm">
        <span className="text-gray-500">Current: </span>
        <span className="font-semibold text-indigo-900">
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

      <CallActions
        loading={loading}
        canCall={queue.length > 0}
        canSpecific={!!patientId}
        canRepeat={!!currentPatient}
        canSkip={!!currentPatient}
        onCall={onCallNext}
        onSpecific={() => {
          onCallSpecific?.(patientId);
          setPatientId(null);
        }}
        onRepeat={onRepeat}
        onSkip={onSkip}
      />
    </section>
  );
};

export default MyQueuePanel;