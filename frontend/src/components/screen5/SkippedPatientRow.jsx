import { memo } from "react";
import { FaUserSlash } from "react-icons/fa";

const SkippedPatientRow = ({ item }) => (
  <div
    className="flex-1 min-h-0 grid items-center gap-2 px-3"
    style={{ gridTemplateColumns: "1.8fr 0.8fr 2fr", borderTop: "1px solid rgba(251,146,60,0.18)" }}
  >
    <div className="flex items-center gap-2 min-w-0">
      <FaUserSlash className="text-orange-400 shrink-0" style={{ fontSize: "clamp(0.8rem, 1.2vw, 1.6rem)" }} />
      <span className="text-white font-semibold truncate" style={{ fontSize: "clamp(0.8rem, 1.3vw, 1.8rem)" }}>{item.patient}</span>
    </div>
    <span className="text-sky-300 font-bold text-center tabular-nums" style={{ fontSize: "clamp(0.8rem, 1.3vw, 1.8rem)" }}>{item.token}</span>
    <span className="text-white font-medium truncate" style={{ fontSize: "clamp(0.75rem, 1.2vw, 1.7rem)" }}>
      {item.doctor}{" "}
      <span className="text-slate-400" style={{ fontSize: "0.75em" }}>(Room {item.room})</span>
    </span>
  </div>
);

export default memo(SkippedPatientRow);