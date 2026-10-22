import { Input, Select } from "antd";
import { useCallback, useEffect, useState } from "react";
import { base_URL } from "../../utills/baseUrl";
import { toast } from "react-toastify";
import axios from "axios";


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
        key: "bloodPressure", label: "Blood Pressure", emoji: "🩺",
        placeholder: "e.g. 120/80", unit: "mmHg",
        bg: "#FDF2F8", border: "#EC4899", iconBg: "#fce7f3",
        color: "#DB2777", prevColor: "#9D174D", prevDot: "#EC4899",
        prevKey: "LbloodPressure",
    },
    {
        key: "bloodSugar", label: "Blood Sugar", emoji: "🩸",
        placeholder: "e.g. 100", unit: "mg/dL",
        bg: "#ECFDF5", border: "#22C55E", iconBg: "#dcfce7",
        color: "#15803D", prevColor: "#14532D", prevDot: "#22C55E",
        prevKey: "LbloodSugar",
    },
    {
        key: "weight", label: "Weight", emoji: "⚖️",
        placeholder: "e.g. 70", unit: "kg",
        bg: "#DBEAFE", border: "#2563EB", iconBg: "#dbeafe",
        color: "#1D4ED8", prevColor: "#1e3a8a", prevDot: "#2563EB",
        prevKey: "Lweight",
    },
    {
        key: "height", label: "Height", emoji: "📏",
        placeholder: "e.g. 5'8\"", unit: "ft/cm",
        bg: "#F9FAFB", border: "#6B7280", iconBg: "#f3f4f6",
        color: "#374151", prevColor: "#1F2937", prevDot: "#9CA3AF",
        prevKey: "Lheight",
    },
    {
        key: "temperature", label: "Temperature", emoji: "🌡️",
        placeholder: "e.g. 98.6", unit: "°F",
        bg: "#EDE9FE", border: "#7C3AED", iconBg: "#ede9fe",
        color: "#6D28D9", prevColor: "#4C1D95", prevDot: "#7C3AED",
        prevKey: "Ltemperature",
    },
    {
        key: "pulse", label: "Pulse", emoji: "💓",
        placeholder: "e.g. 72", unit: "bpm",
        bg: "#FFFBEB", border: "#D97706", iconBg: "#fef3c7",
        color: "#B45309", prevColor: "#78350F", prevDot: "#D97706",
        prevKey: "Lpulse",
    },
];

// ─── Mock doctors & patients (replace with real API calls) ────────────────────
const MOCK_DOCTORS = [
    { id: 1, name: "Dr. Ahmed Khan" },
    { id: 2, name: "Dr. Sara Malik" },
    { id: 3, name: "Dr. Usman Farooq" },
];

const MOCK_PATIENTS_BY_DOCTOR = {
    1: [
        { RECEIPTNO: "RX-001", TOKENNO: "T-01", PATIENTNAME: "Ali Hassan", AGE: 34, GENDER: "Male" },
        { RECEIPTNO: "RX-002", TOKENNO: "T-02", PATIENTNAME: "Sara Bibi", AGE: 27, GENDER: "Female" },
    ],
    2: [
        { RECEIPTNO: "RX-003", TOKENNO: "T-03", PATIENTNAME: "Imran Qureshi", AGE: 45, GENDER: "Male" },
    ],
    3: [
        { RECEIPTNO: "RX-004", TOKENNO: "T-04", PATIENTNAME: "Fatima Noor", AGE: 31, GENDER: "Female" },
        { RECEIPTNO: "RX-005", TOKENNO: "T-05", PATIENTNAME: "Bilal Ahmed", AGE: 22, GENDER: "Male" },
    ],
};

const MOCK_PREV_VITALS = {
    "RX-001": { LbloodPressure: "118/76 mmHg", LbloodSugar: "94 mg/dL", Lweight: "72 kg", Lheight: "5'8\"", Ltemperature: "98.4 °F", Lpulse: "78 bpm" },
    "RX-003": { LbloodPressure: "130/85 mmHg", LbloodSugar: "110 mg/dL", Lweight: "80 kg", Lheight: "5'10\"", Ltemperature: "99.1 °F", Lpulse: "82 bpm" },
};



const FormBody = ({ selectedPatient, setSelectedPatient, username }) => {

    const [selectedDoctorId, setSelectedDoctorId] = useState(null);

    // console.log(selectedPatient, "<<<<< selectedPatient");
    // console.log(selectedDoctorId, "<<<<< selectedDoctorId");

    // Vitals form state
    const [vitals, setVitals] = useState({});
    const [saved, setSaved] = useState(false);
    const [loading, setLoading] = useState(false);
    const [docotorPatients, setDocotorPatients] = useState([]);
    const [docotors, setDocotor] = useState([]);

    // console.log(vitals, "..... vitals");
    // console.log(docotorPatients , "..... docotorPatients");



    // ── Derived data
    const doctorOptions = docotors?.map(d => ({ value: d?.ID, label: d?.NAME }));
    const patientOptions = docotorPatients?.map(p => ({ value: p.RECEIPTNO, label: `${p.PATIENTNAME} -- ${p.TOKENNO} -- ${p.AGE} -- ${p.GENDER}` }));

    const filledCount = Object.values(vitals).filter(Boolean).length;
    const total = VITALS_CONFIG.length;
    const progressPct = Math.round((filledCount / total) * 100);


    const handleDoctorChange = (doctorId) => {
        setSelectedDoctorId(doctorId);
        setSelectedPatient(null);   // reset patient when doctor changes
        setVitals({});
        setSaved(false);
    };

    const handlePatientChange = (receiptNo) => {
        const patient = docotorPatients?.find(p => p.RECEIPTNO === receiptNo) ?? null;
        setSelectedPatient(patient);
        setVitals({});
        setSaved(false);
    };

    const handleVitalChange = (key, value) => {
        setSaved(false);
        setVitals(prev => ({ ...prev, [key]: value }));
    };


    const handleReset = () => { setVitals({}); setSaved(false); };

    const saveHandler = async () => {

        try {
            setLoading(true);
            const res = await axios.post(`${base_URL}/api/opd/doctor/patient-vitals/add`, {
                receiptNo: selectedPatient?.RECEIPTNO || null,
                bloodPressure: vitals?.bloodPressure || null,
                bloodSugar: vitals?.bloodSugar || null,
                weight: vitals?.weight || null,
                height: vitals?.height || null,
                temperature: vitals?.temperature || null,
                pulse: vitals?.pulse || null,
                createdBy: username || "medical Assistant"
            });
            console.log(res, "res of save Handler by id");
            console.log(vitals, " vitals  >......");

            setSelectedDoctorId(null);
            setSelectedPatient(null);
            setSaved(true);
            setVitals({});
            toast.success(`Vitals saved successfully!`);

        }
        catch (err) {
            console.log(err, "error in save Handler");
            toast.error(err?.message);
        }
        finally {
            setLoading(false);
        }

    };

    const fetchPatients = async () => {

        try {
            const res = await axios.get(`${base_URL}/api/opd/doctor-patients/${selectedDoctorId}?status=14`,);
            // const res = await axios.get(`${base_URL}/api/opd/doctor-patients/${selectedDoctorId}`,);
            // console.log(res, "res of fetch Patients by id");
            setDocotorPatients(res?.data?.data?.patients);
        }
        catch (err) {
            // console.log(err, "error in get faculty");
            toast.error(err?.message);
        }

    }

    const fetchDoctors = async () => {

        try {
            const res = await axios.get(`${base_URL}/api/opd/consultants/active`,);
            // console.log(res, "res of fetch Doctors by id");
            setDocotor(res?.data?.data);
        }
        catch (err) {
            // console.log(err, "error in get faculty");
            toast.error(err?.message)
        }

    }

    const fetchSpecifPatientData = async () => {

        try {
            const res = await axios.get(`${base_URL}/api/opd/doctor/patient-vitals/${selectedPatient?.RECEIPTNO}`,);
            // console.log(res, "res of fetch fetch SpecifPatient Data by id");
            const vitals = res?.data?.data?.[0]
            setVitals({
                bloodPressure: vitals?.BLOOD_PRESSURE ?? null,
                bloodSugar: vitals?.BLOOD_SUGAR ?? null,
                height: vitals?.HEIGHT ?? null,
                pulse: vitals?.PULSE ?? null,
                temperature: vitals?.TEMPERATURE ?? null,
                weight: vitals?.WEIGHT ?? null,
            });
        }
        catch (err) {
            // console.log(err, "error in get faculty");
            toast.error(err?.message)
        }

    }


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
                            placeholder={selectedDoctorId ? "Choose a patient..." : "Select doctor first"}
                            value={selectedPatient?.RECEIPTNO ?? null}
                            onChange={handlePatientChange}
                            disabled={!selectedDoctorId}
                            showSearch
                            optionFilterProp="label"
                            allowClear
                            listHeight={400}
                            dropdownStyle={{
                                minWidth: '320px',
                                whiteSpace: 'normal'
                            }}
                            options={docotorPatients?.map(p => ({
                                value: p.RECEIPTNO,
                                label: `${p.PATIENTNAME} (Token: ${p.TOKENNO})`,
                                patient: p
                            }))}
                            optionRender={(option) => (
                                <div className="py-2 px-3 border-b border-gray-100 last:border-0 hover:bg-indigo-50 transition-colors">
                                    <div className="font-semibold text-gray-800 text-sm mb-1">
                                        {option.data.patient?.PATIENTNAME}
                                    </div>
                                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-600">
                                        <div className="flex items-center gap-1">
                                            <span className="text-indigo-500">🎫</span> Token: {option.data.patient?.TOKENNO}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <span className="text-indigo-500">📅</span> Age: {option.data.patient?.AGE}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <span className="text-indigo-500">👤</span> Gender: {option.data.patient?.GENDER}
                                        </div>
                                    </div>
                                    <div className="text-[12px] text-gray-400 mt-1">
                                        Status : {option.data.patient?.PATIENT_STATUS_ID == 1 ? "waiting" : option.data.patient?.PATIENT_STATUS_ID == 3 ? "checked" : "skipped"}
                                    </div>
                                </div>
                            )}
                        />
                    </div>

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

                {/* Vitals Grid */}
                <div className="grid grid-cols-2 max-sm:grid-cols-1 gap-3.5 mb-6">

                    {
                        VITALS_CONFIG.map((v) => {
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
                                        style={{ background: v.border + "20", transform: "translate(14px,-14px)" }}
                                    />

                                    {/* Label row */}
                                    <div className="flex items-center justify-between mb-2.5">
                                        <div className="flex items-center gap-2 text-[13px] font-semibold text-gray-900">
                                            <div className="w-7 h-7 rounded-[9px] flex items-center justify-center text-sm flex-shrink-0"
                                                style={{ background: v.iconBg }}
                                            >
                                                {v.emoji}
                                            </div>
                                            {v.label}
                                        </div>
                                        <span className="text-[10.5px] font-bold px-2 py-0.5 rounded-full"
                                            style={{ background: v.border + "22", color: v.color }}
                                        >
                                            {v.unit}
                                        </span>
                                    </div>


                                    {/* Input */}
                                    <div className="relative">
                                        <Input
                                            type={v.key === "bloodPressure" ? "text" : "number"}
                                            placeholder={v.placeholder}
                                            value={vitals[v.key] || ""}
                                            onChange={(e) => {
                                                const val = e.target.value;

                                                if (v.key === "bloodPressure") {
                                                    if (val === "" || /^[\d/]*$/.test(val)) {
                                                        handleVitalChange(v.key, val);
                                                    }
                                                } else {
                                                    handleVitalChange(v.key, val);
                                                }
                                            }}
                                            style={{ borderColor: filled ? v.border : undefined, paddingRight: filled ? 32 : undefined }}
                                        />
                                        {filled && (
                                            <span className="anim-popIn absolute right-2.5 top-1/2 -translate-y-1/2 text-[13px]"
                                                style={{ color: v.color }}
                                            >✓</span>
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
                            background: "linear-gradient(135deg, #4338ca 0%, #4f46e5 50%, #3b82f6 100%)",
                            boxShadow: loading || filledCount === 0 ? "none" : undefined,
                        }}
                    >
                        {
                            loading ? (
                                <>
                                    <div className=" anim-spin w-4 h-4 rounded-full border-2 border-white/30 border-t-white " /> Saving…
                                </>
                            ) : saved ? (
                                <>✓ Vitals Saved</>
                            ) : (
                                <>Save Vitals →</>
                            )
                        }
                    </button>
                </div>

            </div>

        </>
    )
}

export default FormBody