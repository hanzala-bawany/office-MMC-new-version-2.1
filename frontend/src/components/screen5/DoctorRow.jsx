import { memo } from "react";
import {
  FaUserMd,
  FaPhoneAlt,
  FaClock,
  FaUserInjured,
  FaInfoCircle,
} from "react-icons/fa";
import {
  GRID_COLS,
  ROOM_COLORS,
  NO_ROOM_COLORS,
  STATUS,
} from "./screen5Config";

const shortName = (name = "") =>
  name?.split(" ")[0]?.length > 13
    ? `${name.split(" ")[0].slice(0, 14)}... ${name.split(" ").slice(1).join(" ")}`
    : name;

const roomLabel = (r) =>
  /^\d+$/.test(String(r)) ? String(r).padStart(2, "0") : r;

const DoctorRow = ({ doc, highlight }) => {
  const isMessage = doc?.GENDER === "message";
  const hasToken = !!doc?.TOKENNO;
  const roomNo = doc?.ROOM_NO;

  console.log(doc, "doc .........");

//   const [rc1, rc2] = roomNo ? ROOM_COLORS[(parseInt(roomNo, 10) || 0) % ROOM_COLORS.length] : NO_ROOM_COLORS;
  const [rc1, rc2] = roomNo ? ROOM_COLORS[highlight ? 0 : isMessage ? 2 : 1] : NO_ROOM_COLORS;

  // row state -> colors (same idea as old card: highlight / message / normal)
  const theme = highlight
    ? {
        bg: "linear-gradient(90deg, rgba(22,163,74,0.30), rgba(6,26,51,0.9))",
        border: "rgba(34,197,94,0.7)",
        name: "#bbf7d0",
        sub: "#86efac",
      }
    : isMessage
      ? {
          bg: "linear-gradient(90deg, rgba(194,65,12,0.28), rgba(6,26,51,0.9))",
          border: "rgba(249,115,22,0.45)",
          name: "#ffedd5",
          sub: "#fdba74",
        }
      : {
          bg: "linear-gradient(90deg, rgba(14,80,140,0.35), rgba(6,26,51,0.9))",
          border: "rgba(56,189,248,0.18)",
          name: "#f1f5f9",
          sub: "#7dd3fc",
        };

  let status;
  if (isMessage)
    status = {
      text: STATUS.info,
      icon: <FaInfoCircle />,
      bg: "linear-gradient(135deg,#f97316,#c2410c)",
      color: "#fff",
    };
  else if (highlight)
    status = {
      text: STATUS.calling,
      icon: <FaPhoneAlt />,
      bg: "linear-gradient(135deg,#22c55e,#15803d)",
      color: "#fff",
    };
  else if (hasToken)
    status = {
      text: STATUS.called,
      icon: <FaClock />,
      bg: "linear-gradient(135deg,#f59e0b,#b45309)",
      color: "#fff",
    };
  else
    status = {
      text: STATUS.empty,
      icon: <FaUserInjured />,
      bg: "rgba(56,189,248,0.12)",
      color: "#bae6fd",
    };

  return (
    <div
      className="relative flex-1 min-h-0 grid items-center px-3 patientCardFont transition-all duration-500"
      style={{
        gridTemplateColumns: GRID_COLS,
        background: theme.bg,
        border: `1px solid ${theme.border}`,
        borderRadius: "14px",
        boxShadow: highlight ? "0 0 0 2px rgba(34,197,94,0.35)" : "none",
      }}
    >
      {highlight && <div className="s5-pulse-ring" />}

      {/* ROOM - only the big number */}
      <div className="flex items-center">

        <div
          className="flex items-center justify-center font-black text-white rounded-xl tabular-nums"
          style={{
            background: `linear-gradient(135deg, ${rc1} , ${rc2})`,
            width: "clamp(52px, 4.4vw, 150px)",
            height: "clamp(40px, 3.6vw, 120px)",
            fontSize: "clamp(1.4rem, 2.6vw, 3.6rem)",
          }}
        >
          {roomNo ? roomLabel(roomNo) : "—"}
        </div>

      </div>

      {/* DOCTOR NAME + department */}
      <div className="min-w-0 pr-3">
        <div className="flex items-center gap-2">
          <FaUserMd
            style={{
              color: theme.sub,
              fontSize: "clamp(1rem, 1.6vw, 2.2rem)",
              flexShrink: 0,
            }}
          />
          <p
            className="font-bold truncate leading-tight"
            style={{
              color: theme.name,
              fontSize: "clamp(1.1rem, 2vw, 2.6rem)",
            }}
          >
            {shortName(doc?.NAME)}
          </p>
        </div>
        <p
          className="truncate font-medium"
          style={{ color: theme.sub, fontSize: "clamp(0.7rem, 1.1vw, 1.5rem)" }}
        >
          {doc?.FACULTY_NAME || "General"}
        </p>
      </div>

      {/* TOKEN (or announcement text) */}
      <div className="text-center min-w-0">
        {isMessage ? (
          <p
            className="font-bold truncate"
            style={{
              color: "#fed7aa",
              fontSize: "clamp(0.8rem, 1.2vw, 1.6rem)",
            }}
          >
            {doc?.PATIENTNAME || "No message"}
          </p>
        ) : (
          <p
            className="font-black tabular-nums"
            style={{
              color: hasToken ? "#fff" : "#64748b",
              fontSize: "clamp(1.4rem, 2.7vw, 3.8rem)",
            }}
          >
            {hasToken ? doc.TOKENNO : "-"}
          </p>
        )}
      </div>

      {/* STATUS - narrow pill */}
      <div className="flex justify-end">
        <div
          className="flex items-center gap-1.5 rounded-full font-bold whitespace-nowrap"
          style={{
            background: status.bg,
            color: status.color,
            padding: "clamp(3px, 0.35vw, 10px) clamp(8px, 0.9vw, 22px)",
            fontSize: "clamp(0.6rem, 0.9vw, 1.3rem)",
          }}
        >
          {status.icon}
          {status.text}
        </div>
      </div>
      
    </div>
  );
};

export default memo(DoctorRow);
