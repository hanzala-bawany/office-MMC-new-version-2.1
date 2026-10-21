import { FaStethoscope, FaUserSlash } from "react-icons/fa";
import MedicalAssistantRow from "./MedicalAssistantRow";
import SkippedPatientRow from "./SkippedPatientRow";
import { MEDICAL_ASSISTANT_STATIC, SKIPPED_STATIC } from "./screen5Config";

// Static data for now. Later: pass real data as props (maList, skippedList).
const RightPanel = ({ maList = MEDICAL_ASSISTANT_STATIC, skippedList = SKIPPED_STATIC }) => {

  return (
    <aside className="flex flex-col gap-3 min-h-0">

      {/* Medical assistant - vitals */}
      <section
        className="flex flex-col min-h-0 rounded-2xl overflow-hidden"
        style={{ flex: "3 1 0%", background: "rgba(7,30,58,0.6)", border: "1px solid rgba(45,212,191,0.35)" }}
      >
        <div className="flex items-center gap-3 px-4 py-2" style={{ background: "rgba(13,148,136,0.25)" }}>
          <FaStethoscope className="text-teal-300" style={{ fontSize: "clamp(1.1rem, 1.8vw, 2.4rem)" }} />
          <h2 className="text-white font-black tracking-wide" style={{ fontSize: "clamp(1rem, 1.7vw, 2.3rem)" }}>
            MEDICAL ASSISTANT – VITALS
          </h2>
        </div>
        <div className="flex-1 min-h-0 flex flex-col gap-2 p-2">
          {maList.map((item, i) => (
            <MedicalAssistantRow key={item.id} item={item} index={i} />
          ))}
        </div>
      </section>

      {/* Skipped patients */}
      <section
        className="flex flex-col min-h-0 rounded-2xl overflow-hidden"
        style={{ flex: "4 1 0%", background: "rgba(7,30,58,0.6)", border: "1px solid rgba(251,146,60,0.4)" }}
      >
        <div className="flex items-center gap-3 px-4 py-2" style={{ background: "rgba(194,65,12,0.28)" }}>
          <FaUserSlash className="text-orange-300" style={{ fontSize: "clamp(1.1rem, 1.8vw, 2.4rem)" }} />
          <h2 className="text-white font-black tracking-wide" style={{ fontSize: "clamp(1rem, 1.7vw, 2.3rem)" }}>
            SKIPPED PATIENTS
          </h2>
        </div>
        <div className="grid px-3 py-1 text-slate-300 font-semibold" style={{ gridTemplateColumns: "1.8fr 0.8fr 2fr", fontSize: "clamp(0.65rem, 0.95vw, 1.3rem)" }}>
          <span className="pl-7">Patient Name</span>
          <span className="text-center">Token No</span>
          <span>Skipped From</span>
        </div>
        <div className="flex-1 min-h-0 flex flex-col">
          {skippedList.map((item) => (
            <SkippedPatientRow key={item.id} item={item} />
          ))}
        </div>
      </section>
      
    </aside>
  );
};

export default RightPanel;