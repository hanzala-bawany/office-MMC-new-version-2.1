import { Input, Select } from "antd";
import { useCallback, useEffect, useState } from "react";
import { base_URL, STATION_URL } from "../../utills/baseUrl";
import { toast } from "react-toastify";
import axios from "axios";
import StationModal from "./StationModal";
import useStationOnline from "./useStationOnline";
import useFetch from "../../hooks/useFetch";

// ─── Minimal CSS — only what Tailwind can't do (animations + AntD overrides) ──
const animationStyles = `
  @keyframes slideDown {
    from { opacity: 0; transform: translateY(-18px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes breathe {
    0%, 100% { transform: scale(1); opacity: 1; }
    50%       { transform: scale(1.12); opacity: 0.8; }
  }
  @keyframes popIn {
    from { transform: translateY(-50%) scale(0.5); opacity: 0; }
    to   { transform: translateY(-50%) scale(1); opacity: 1; }
  }
  @keyframes shimmer {
    0%, 100% { opacity: 0.3; }
    50%       { opacity: 0.8; }
  }
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  @keyframes pulseDot {
    0%, 100% { transform: scale(1); opacity: 1; }
    50%       { transform: scale(1.15); opacity: 0.75; }
  }

  .anim-slideDown  { animation: slideDown 0.55s cubic-bezier(.22,1,.36,1) both; }
  .anim-fadeUp     { animation: fadeUp 0.6s cubic-bezier(.22,1,.36,1) 0.08s both; }
  .anim-fadeUpFast { animation: fadeUp 0.35s cubic-bezier(.22,1,.36,1) both; }
  .anim-breathe    { animation: breathe 2.5s ease-in-out infinite; }
  .anim-popIn      { animation: popIn 0.25s cubic-bezier(.34,1.56,.64,1) both; }
  .anim-spin       { animation: spin 0.65s linear infinite; }

  /* Progress bar shimmer tip */
  .progress-fill::after {
    content: '';
    position: absolute; right: 0; top: 0;
    width: 8px; height: 100%;
    background: rgba(255,255,255,0.5);
    border-radius: 99px;
    animation: shimmer 1.5s ease-in-out infinite;
  }

  /* AntD Select override */
  .ma-select .ant-select-selector {
    border-radius: 12px !important;
    height: 42px !important;
    display: flex !important;
    align-items: center !important;
    border-color: #c7d2fe !important;
    font-size: 14px !important;
  }
  .ma-select .ant-select-selector:hover,
  .ma-select .ant-select-selector:focus-within {
    border-color: #6366f1 !important;
    box-shadow: 0 0 0 2px rgba(99,102,241,0.12) !important;
  }

  /* AntD Input override inside vital cards */
  .vital-input .ant-input {
    border-radius: 10px !important;
    font-size: 14px !important;
    font-weight: 500 !important;
    background: #fff !important;
  }

  /* Save button shimmer on hover */
  .save-btn::after {
    content: '';
    position: absolute; top: 0; left: -100%;
    width: 60%; height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent);
    transition: left 0.55s ease;
  }
  .save-btn:not(:disabled):hover::after { left: 150%; }
`;

// ─── Vital fields config ───────────────────────────────────────────────────────
const VITALS_CONFIG = [
  {
    key: "bloodPressure",
    label: "Blood Pressure",
    emoji: "🩺",
    placeholder: "e.g. 120/80",
    unit: "mmHg",
    bg: "#FDF2F8",
    border: "#EC4899",
    iconBg: "#fce7f3",
    color: "#DB2777",
    prevColor: "#9D174D",
    prevDot: "#EC4899",
    prevKey: "LbloodPressure",
  },
  {
    key: "bloodSugar",
    label: "Blood Sugar",
    emoji: "🩸",
    placeholder: "e.g. 100",
    unit: "mg/dL",
    bg: "#ECFDF5",
    border: "#22C55E",
    iconBg: "#dcfce7",
    color: "#15803D",
    prevColor: "#14532D",
    prevDot: "#22C55E",
    prevKey: "LbloodSugar",
  },
  {
    key: "weight",
    label: "Weight",
    emoji: "⚖️",
    placeholder: "e.g. 70",
    unit: "kg",
    bg: "#DBEAFE",
    border: "#2563EB",
    iconBg: "#dbeafe",
    color: "#1D4ED8",
    prevColor: "#1e3a8a",
    prevDot: "#2563EB",
    prevKey: "Lweight",
  },
  {
    key: "height",
    label: "Height",
    emoji: "📏",
    placeholder: "e.g. 5'8\"",
    unit: "ft/cm",
    bg: "#F9FAFB",
    border: "#6B7280",
    iconBg: "#f3f4f6",
    color: "#374151",
    prevColor: "#1F2937",
    prevDot: "#9CA3AF",
    prevKey: "Lheight",
  },
  {
    key: "temperature",
    label: "Temperature",
    emoji: "🌡️",
    placeholder: "e.g. 98.6",
    unit: "°F",
    bg: "#EDE9FE",
    border: "#7C3AED",
    iconBg: "#ede9fe",
    color: "#6D28D9",
    prevColor: "#4C1D95",
    prevDot: "#7C3AED",
    prevKey: "Ltemperature",
  },
  {
    key: "pulse",
    label: "Pulse",
    emoji: "💓",
    placeholder: "e.g. 72",
    unit: "bpm",
    bg: "#FFFBEB",
    border: "#D97706",
    iconBg: "#fef3c7",
    color: "#B45309",
    prevColor: "#78350F",
    prevDot: "#D97706",
    prevKey: "Lpulse",
  },
  {
    key: "spo2",
    label: "SpO₂",
    emoji: "🫁",
    placeholder: "e.g. 98",
    unit: "%",
    bg: "#ECFEFF",
    border: "#06B6D4",
    iconBg: "#cffafe",
    color: "#0E7490",
    prevColor: "#164E63",
    prevDot: "#06B6D4",
    prevKey: "Lspo2",
  },
];

const FormBody = ({ selectedPatient, setSelectedPatient, username }) => {
  const [selectedDoctorId, setSelectedDoctorId] = useState(null);

  // console.log(selectedPatient, "<<<<< selectedPatient");
  // console.log(selectedDoctorId, "<<<<< selectedDoctorId");

  // Vitals form state
  const [vitals, setVitals] = useState({});
  const [stationMode, setStationMode] = useState(null); // null | "combined" | "weight" | "height"
  const station = useStationOnline(); // { online, weight, height } from the station /health
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [docotorPatients, setDocotorPatients] = useState([]);
  const [docotors, setDocotor] = useState([]);
  const [vitalsMachineData, setVitalsMachineData] = useState(null);

  // console.log(vitals, "..... vitals");
  // console.log(docotorPatients , "..... docotorPatients");

  // ── Derived data
  const doctorOptions = docotors?.map((d) => ({
    value: d?.ID,
    label: d?.NAME,
  }));
  const patientOptions = docotorPatients?.map((p) => ({
    value: p.RECEIPTNO,
    label: `${p.PATIENTNAME} -- ${p.TOKENNO} -- ${p.AGE} -- ${p.GENDER}`,
  }));

  const filledCount = Object.values(vitals).filter(Boolean).length;
  const total = VITALS_CONFIG.length;
  const progressPct = Math.round((filledCount / total) * 100);

  const m = vitalsMachineData;
  const nibp = m?.blood_pressure?.nibp;

  const liveBP =
    nibp?.systolic != null && nibp?.diastolic != null
      ? `${nibp.systolic}/${nibp.diastolic}`
      : null;

  const liveValues = {
    bloodPressure: liveBP,
    pulse:  m?.spo2?.pulse_rate_bpm || m?.blood_pressure?.nibp?.pulse_rate_bpm ||  null,
    spo2: m?.spo2?.spo2_pct ?? null,
    temperature: m?.temperature?.fahrenheit ?? null,
  };

  const monitorConnected = !!m?.monitor?.live;

  const handleDoctorChange = (doctorId) => {
    setSelectedDoctorId(doctorId);
    setSelectedPatient(null); // reset patient when doctor changes
    setVitals({});
    setSaved(false);
  };

  const handlePatientChange = (receiptNo) => {
    const patient =
      docotorPatients?.find((p) => p.RECEIPTNO === receiptNo) ?? null;
    setSelectedPatient(patient);
    setVitals({});
    setSaved(false);
  };

  const handleVitalChange = (key, value) => {
    setSaved(false);
    setVitals((prev) => ({ ...prev, [key]: value }));
  };



  // values captured from the vitals station go into the form only; saving stays with "Save Vitals"
  const applyStation = useCallback((patch) => {
    setSaved(false);
    setVitals((prev) => ({ ...prev, ...patch }));
  }, []);

  const useMonitorValue = (key) => {
    const val = liveValues[key];
    if (val == null) {
      toast.warn("Monitor se is waqt value nahi aa rahi");
      return;
    }
    handleVitalChange(key, String(val));
  };

  const useAllMonitorValues = () => {
    const patch = {};
    Object.entries(liveValues).forEach(([k, v]) => {
      if (v != null) patch[k] = String(v);
    });
    if (Object.keys(patch).length === 0) {
      toast.warn("Monitor se koi value nahi aa rahi");
      return;
    }
    applyStation(patch);
  };



  const handleReset = () => {
    setVitals({});
    setSaved(false);
  };

  const saveHandler = async () => {
    try {
      setLoading(true);
      const res = await axios.post(
        `${base_URL}/api/opd/doctor/patient-vitals/add`,
        {
          receiptNo: selectedPatient?.RECEIPTNO || null,
          bloodPressure: vitals?.bloodPressure || null,
          bloodSugar: vitals?.bloodSugar || null,
          weight: vitals?.weight || null,
          height: vitals?.height || null,
          temperature: vitals?.temperature || null,
          pulse: vitals?.pulse || null,
          spo2: vitals?.spo2 || null,               // oxygen
          createdBy: username || "medical Assistant",
        },
      );
      // console.log(res, "res of save Handler by id");
      // console.log(vitals, " vitals  >......");

      setSelectedDoctorId(null);
      setSelectedPatient(null);
      setSaved(true);
      setVitals({});
      toast.success(`Vitals saved successfully!`);
    } catch (err) {
      console.log(err, "error in save Handler");
      toast.error(err?.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchPatients = async () => {
    try {
      const res = await axios.get(
        `${base_URL}/api/opd/doctor-patients/${selectedDoctorId}?status=14`,
      );
      // const res = await axios.get(`${base_URL}/api/opd/doctor-patients/${selectedDoctorId}`,);
      // console.log(res, "res of fetch Patients by id");
      setDocotorPatients(res?.data?.data?.patients);
    } catch (err) {
      // console.log(err, "error in get faculty");
      toast.error(err?.message);
    }
  };

  const fetchDoctors = async () => {
    try {
      const res = await axios.get(`${base_URL}/api/opd/consultants/active`);
      // console.log(res, "res of fetch Doctors by id");
      setDocotor(res?.data?.data);
    } catch (err) {
      // console.log(err, "error in get faculty");
      toast.error(err?.message);
    }
  };

  const fetchSpecifPatientData = async () => {
    try {
      const res = await axios.get(
        `${base_URL}/api/opd/doctor/patient-vitals/${selectedPatient?.RECEIPTNO}`,
      );
      // console.log(res, "res of fetch fetch SpecifPatient Data by id");
      const vitals = res?.data?.data?.[0];
      setVitals({
        bloodPressure: vitals?.BLOOD_PRESSURE ?? null,
        bloodSugar: vitals?.BLOOD_SUGAR ?? null,
        height: vitals?.HEIGHT ?? null,
        pulse: vitals?.PULSE ?? null,
        temperature: vitals?.TEMPERATURE ?? null,
        weight: vitals?.WEIGHT ?? null,
        spo2: vitals?.SPO2 ?? null,
      });
    } catch (err) {
      // console.log(err, "error in get faculty");
      toast.error(err?.message);
    }
  };

  const fetchVitalsMachineData = useCallback(async () => {
    try {
      const res = await axios.get(
        `${STATION_URL}/monitor/vitals?waves=false&wave_seconds=6&step=4`,
      );
      //   console.log(res , "res of fetch Vitals Machine Data")
      setVitalsMachineData(res?.data);
    } catch (err) {
      console.log(err, "error in fetchVitalsMachineData");
    }
  }, []);

  useEffect(() => {
    let stopped = false;
    let timer;

    const poll = async () => {
      await fetchVitalsMachineData();
      if (!stopped) timer = setTimeout(poll, 2000);
    };

    poll();

    return () => {
      stopped = true;
      clearTimeout(timer);
    };
  }, [fetchVitalsMachineData]);


  useEffect(() => {
    if (selectedDoctorId) {
      fetchPatients();
    }
  }, [selectedDoctorId]);

  useEffect(() => {
    fetchDoctors();
  }, []);

  useEffect(() => {
    if (selectedPatient?.RECEIPTNO) {
      fetchSpecifPatientData();
    }
  }, [selectedPatient]);

  console.log(m, "m vitals machine data /.........");

  return (
    <>
      <style>{animationStyles}</style>

      <div className="px-6 py-8">

        {/* Doctor + Patient Dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {/* Doctor select */}
          <div>
            <label className="block text-xs font-semibold text-indigo-600 uppercase tracking-widest mb-2">
              Select Doctor
            </label>
            <Select
              className="ma-select w-full"
              placeholder="Choose a doctor..."
              options={doctorOptions}
              value={selectedDoctorId}
              onChange={handleDoctorChange}
              showSearch
              optionFilterProp="label"
              allowClear
            />
          </div>

          {/* Patient select */}
          <div>
            <label className="block text-xs font-semibold text-indigo-600 uppercase tracking-widest mb-2">
              Select Patient
            </label>
            <Select
              className="ma-select w-full"
              placeholder={
                selectedDoctorId ? "Choose a patient..." : "Select doctor first"
              }
              value={selectedPatient?.RECEIPTNO ?? null}
              onChange={handlePatientChange}
              disabled={!selectedDoctorId}
              showSearch
              optionFilterProp="label"
              allowClear
              listHeight={400}
              dropdownStyle={{
                minWidth: "320px",
                whiteSpace: "normal",
              }}
              options={docotorPatients?.map((p) => ({
                value: p.RECEIPTNO,
                label: `${p.PATIENTNAME} (Token: ${p.TOKENNO})`,
                patient: p,
              }))}
              optionRender={(option) => (
                <div className="py-2 px-3 border-b border-gray-100 last:border-0 hover:bg-indigo-50 transition-colors">
                  <div className="font-semibold text-gray-800 text-sm mb-1">
                    {option.data.patient?.PATIENTNAME}
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-600">
                    <div className="flex items-center gap-1">
                      <span className="text-indigo-500">🎫</span> Token:{" "}
                      {option.data.patient?.TOKENNO}
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-indigo-500">📅</span> Age:{" "}
                      {option.data.patient?.AGE}
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-indigo-500">👤</span> Gender:{" "}
                      {option.data.patient?.GENDER}
                    </div>
                  </div>
                  <div className="text-[12px] text-gray-400 mt-1">
                    Status :{" "}
                    {option.data.patient?.PATIENT_STATUS_ID == 1
                      ? "waiting"
                      : option.data.patient?.PATIENT_STATUS_ID == 3
                        ? "checked"
                        : "skipped"}
                  </div>
                </div>
              )}
            />
          </div>
        </div>

        {/* Live Patient Monitor */}
        <div className="mb-6 rounded-2xl border border-indigo-100 bg-indigo-50/40 p-4">
          <div className="flex items-center gap-2 mb-3">
            <span
              className={`w-2.5 h-2.5 rounded-full ${monitorConnected ? "bg-green-500 anim-breathe" : "bg-gray-400"}`}
            />
            <span className="text-[11px] font-semibold uppercase tracking-widest text-indigo-500">
              Live Patient Monitor
            </span>
            <span className="text-xs text-gray-500">
              {monitorConnected ? "Connected" : "Monitor not connected"}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 mb-3">
            {[
              { label: `pulse (${m?.spo2?.pulse_rate_bpm ? "spo2" : m?.blood_pressure?.nibp?.pulse_rate_bpm ? "BP" : "-"})`, val: m?.spo2?.pulse_rate_bpm || m?.blood_pressure?.nibp?.pulse_rate_bpm },
              { label: "SpO₂ %", val: m?.spo2?.spo2_pct },
              { label: "BP mmHg", val: liveBP },
              { label: "Resp /min", val: m?.respiration?.rr_from_ecg_bpm },
              { label: "Temp °F", val: m?.temperature?.fahrenheit },
            ].map((c) => (
              <div
                key={c.label}
                className="rounded-xl border border-indigo-100 bg-white py-2 text-center"
              >
                <div className="text-xl font-bold text-gray-800">
                  {c.val ?? "--"}
                </div>
                <div className="text-[10px] text-gray-400 uppercase">
                  {c.label}
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={useAllMonitorValues}
            disabled={!selectedPatient}
            className="w-full h-11 rounded-xl border-none text-white text-sm font-semibold cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed"
            style={{ background: "linear-gradient(135deg, #0f766e, #4f46e5)" }}
          >
            ⬇ Use monitor readings in the form
          </button>
        </div>

        {/* Progress bar */}
        <div className="mb-5">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">
              Vitals Completion
            </span>
            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded-full">
              {filledCount} / {total}
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-indigo-100 overflow-hidden">
            <div
              className="progress-fill h-full rounded-full relative transition-all duration-500"
              style={{
                width: `${progressPct}%`,
                background: "linear-gradient(90deg, #6366f1, #3b82f6)",
              }}
            />
          </div>
        </div>

        {/* Section tag */}
        <div className="flex items-center gap-2 mb-4">
          <div className="w-4 h-0.5 rounded bg-gradient-to-r from-indigo-500 to-blue-400" />
          <span className="text-[11px] font-semibold uppercase tracking-widest text-indigo-500">
            Current Readings
          </span>
        </div>

        {/* Vitals station: weight + height in one go */}
        {station.weight && station.height && (
          <button
            type="button"
            onClick={() => setStationMode("combined")}
            disabled={!selectedPatient}
            className="w-full mb-4 h-12 rounded-2xl border-none text-white text-sm font-semibold cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed"
            style={{
              background: "linear-gradient(135deg, #0e7490 0%, #4f46e5 100%)",
            }}
          >
            ⚡ Capture Weight + Height
          </button>
        )}

        {/* Vitals Grid */}
        <div className="grid grid-cols-2 max-sm:grid-cols-1 gap-3.5 mb-6">
          {VITALS_CONFIG.map((v) => {
            const filled = !!vitals[v.key];

            return (
              <div
                key={v.key}
                className="vital-input rounded-2xl border-[1.5px] p-4 relative overflow-hidden transition-all duration-200 hover:-translate-y-0.5"
                style={{
                  backgroundColor: v.bg,
                  borderColor: filled ? v.border : v.border + "55",
                  boxShadow: filled ? `0 4px 18px ${v.border}28` : "none",
                }}
              >
                {/* Decorative corner orb */}
                <div
                  className="absolute top-0 right-0 w-12 h-12 rounded-full pointer-events-none"
                  style={{
                    background: v.border + "20",
                    transform: "translate(14px,-14px)",
                  }}
                />

                {/* Label row */}
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-2 text-[13px] font-semibold text-gray-900">
                    <div
                      className="w-7 h-7 rounded-[9px] flex items-center justify-center text-sm flex-shrink-0"
                      style={{ background: v.iconBg }}
                    >
                      {v.emoji}
                    </div>
                    {v.label}
                  </div>
                  <span
                    className="text-[10.5px] font-bold px-2 py-0.5 rounded-full"
                    style={{ background: v.border + "22", color: v.color }}
                  >
                    {v.unit}
                  </span>
                </div>

                {/* Input */}
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Input
                      type={
                        v.key === "bloodPressure" || v.key === "height"
                          ? "text"
                          : "number"
                      }
                      placeholder={v.placeholder}
                      value={vitals[v.key] || ""}
                      onChange={(e) => {
                        const val = e.target.value;

                        if (v.key === "bloodPressure") {
                          if (val === "" || /^[\d/]*$/.test(val)) {
                            handleVitalChange(v.key, val);
                          }
                        } else if (v.key === "height") {
                          // feet'inches", e.g. 5'8" (also allows plain numbers)
                          if (val === "" || /^[\d'"\s.]*$/.test(val)) {
                            handleVitalChange(v.key, val);
                          }
                        } else {
                          handleVitalChange(v.key, val);
                        }
                      }}
                      style={{
                        borderColor: filled ? v.border : undefined,
                        paddingRight: filled ? 32 : undefined,
                      }}
                    />
                    {filled && (
                      <span
                        className="anim-popIn absolute right-2.5 top-1/2 -translate-y-1/2 text-[13px]"
                        style={{ color: v.color }}
                      >
                        ✓
                      </span>
                    )}
                  </div>

                  {((v.key === "weight" && station.weight) ||
                    (v.key === "height" && station.height)) && (
                    <button
                      type="button"
                      disabled={!selectedPatient}
                      onClick={() => setStationMode(v.key)}
                      className="shrink-0 h-8 px-3 rounded-lg border-none text-white text-xs font-semibold cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed"
                      style={{
                        background: "linear-gradient(135deg, #4338ca, #3b82f6)",
                      }}
                    >
                      ⚡ Capture
                    </button>
                  )}

                  {["bloodPressure", "pulse", "temperature", "spo2"].includes(
                    v.key,
                  ) && (
                    <button
                      type="button"
                      disabled={!selectedPatient || liveValues[v.key] == null}
                      onClick={() => useMonitorValue(v.key)}
                      className="shrink-0 h-8 px-3 rounded-lg border-none text-white text-xs font-semibold cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed"
                      style={{
                        background: "linear-gradient(135deg, #4338ca, #3b82f6)",
                      }}
                    >
                      📟 Monitor
                    </button>
                  )}

                </div>
              </div>
            );
          })}
        </div>

        {/* Action buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleReset}
            className="flex items-center gap-2 p-3 px-6 rounded-[14px] border-[1.5px] border-gray-300 bg-white text-gray-700 text-sm font-medium cursor-pointer transition-all hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            ↺ Reset
          </button>

          <button
            onClick={saveHandler}
            disabled={filledCount === 0 || loading || !selectedPatient}
            className="save-btn flex-1  rounded-[14px] border-none text-white text-[15px] font-semibold cursor-pointer transition-all relative overflow-hidden flex items-center justify-center gap-2 disabled:opacity-45 disabled:cursor-not-allowed hover:enabled:-translate-y-px"
            style={{
              fontFamily: "'DM Sans', sans-serif",
              background:
                "linear-gradient(135deg, #4338ca 0%, #4f46e5 50%, #3b82f6 100%)",
              boxShadow: loading || filledCount === 0 ? "none" : undefined,
            }}
          >
            {loading ? (
              <>
                <div className=" anim-spin w-4 h-4 rounded-full border-2 border-white/30 border-t-white " />{" "}
                Saving…
              </>
            ) : saved ? (
              <>✓ Vitals Saved</>
            ) : (
              <>Save Vitals →</>
            )}
          </button>
        </div>

      </div>

      <StationModal
        mode={stationMode}
        onClose={() => setStationMode(null)}
        onApply={applyStation}
        currentWeight={vitals.weight}
      />
    </>
  );
};

export default FormBody;
