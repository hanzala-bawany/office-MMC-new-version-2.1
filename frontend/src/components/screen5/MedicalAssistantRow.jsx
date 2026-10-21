import { memo } from "react";
import { FaUser } from "react-icons/fa";

const AVATARS = ["#2563eb", "#7c3aed", "#0d9488"];

const Field = ({ label, value, big }) => (
  <div className="min-w-0">
    <p className="text-sky-300 font-medium" style={{ fontSize: "clamp(0.6rem, 0.85vw, 1.2rem)" }}>{label}</p>
    <p className="text-white font-bold truncate" style={{ fontSize: big ? "clamp(1rem, 1.7vw, 2.4rem)" : "clamp(0.8rem, 1.3vw, 1.8rem)" }}>{value}</p>
  </div>
);

const MedicalAssistantRow = ({ item, index }) => (
  <div
    className="flex-1 min-h-0 grid items-center gap-3 px-3 rounded-xl"
    style={{
      gridTemplateColumns: "auto 1.6fr 0.9fr 1.5fr",
      background: "rgba(14,80,140,0.28)",
      border: "1px solid rgba(56,189,248,0.2)",
    }}
  >
    <div
      className="flex items-center justify-center rounded-full text-white"
      style={{
        background: AVATARS[index % AVATARS.length],
        width: "clamp(36px, 3.2vw, 90px)",
        height: "clamp(36px, 3.2vw, 90px)",
        fontSize: "clamp(1rem, 1.5vw, 2.2rem)",
      }}
    >
      <FaUser />
    </div>
    <Field label="Patient Name" value={item.patient} big />
    <Field label="Token No" value={item.token} big />
    <Field label="Medical Assistant" value={item.assistant} />
  </div>
);

export default memo(MedicalAssistantRow);