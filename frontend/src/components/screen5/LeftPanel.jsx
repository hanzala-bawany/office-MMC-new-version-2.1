import { FaDoorOpen, FaUserMd, FaTicketAlt, FaClock } from "react-icons/fa";
import ImageLoader from "../../utills/ImageLoader";
import EmptyPatientMessage from "./EmptyPatientMessage";
import { GRID_COLS } from "./screen5Config";
import DoctorRow from "./DoctorRow";

const HEAD = [
  { icon: <FaDoorOpen />, label: "Room No" },
  { icon: <FaUserMd />, label: "Doctor Name" },
  { icon: <FaTicketAlt />, label: "Token No", center: true },
  { icon: <FaClock />, label: "Status", end: true },
];

const LeftPanel = ({ docs = [], isLoading, highlightToken }) => {
  return (
    <section
      className="flex flex-col min-h-0 rounded-2xl p-3"
      style={{ background: "rgba(7,30,58,0.6)", border: "1px solid rgba(56,189,248,0.2)" }}
    >
      <style>{`
        @keyframes s5PulseRing {
          0% { transform: scale(1); opacity: .7; }
          70% { transform: scale(1.02); opacity: 0; }
          100% { transform: scale(1); opacity: 0; }
        }
        .s5-pulse-ring {
          position: absolute; inset: -3px; border-radius: 16px;
          border: 2px solid rgba(34,197,94,.7);
          animation: s5PulseRing 1.8s ease-out infinite; pointer-events: none; z-index: 20;
        }
      `}</style>


      {/* Column header */}
      <div className="grid px-3 pb-2 text-sky-200 font-semibold" style={{ gridTemplateColumns: GRID_COLS, fontSize: "clamp(0.75rem, 1.1vw, 1.5rem)" }}>
        {HEAD?.map((h) => (
          <div key={h.label} className={`flex items-center gap-2 ${h.center ? "justify-center" : ""} ${h.end ? "justify-end" : ""}`}>
            <span className="text-cyan-400">{h.icon}</span>
            {h.label}
          </div>
        ))}
      </div>

      {/* Rows */}
      {docs.length > 0 ? (
        <div className="flex-1 min-h-0 flex flex-col gap-2">
          {docs?.map((doc, i) => (
            <DoctorRow
              key={`${doc?.CONSULTANTID}-${doc?.TOKENNO || i}`}
              doc={doc}
              highlight={
                highlightToken?.token === doc?.TOKENNO &&
                highlightToken?.doctorId == doc?.CONSULTANTID
              }
            />
          ))}
        </div>
      ) : isLoading ? (
        <div className="flex-1 flex items-center justify-center"><ImageLoader /></div>
      ) : (
        <div className="flex-1 flex items-center justify-center"><EmptyPatientMessage /></div>
      )}
    </section>
  );
};

export default LeftPanel;