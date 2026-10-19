import { memo } from "react";
import { Badge } from "antd";
import { FaUserMd, FaHashtag } from "react-icons/fa";

const PatientCard = ({ doc, isTwo, highlight }) => {

  const isMessageCard = doc?.GENDER === "message";
  const messageText = isMessageCard ? doc?.PATIENTNAME : null;

  /* ── shared accent colours ── */
  const accentFrom = highlight
    ? "#d97706" : isMessageCard
    ? "#f97316" : "#0ea5e9";
  const accentTo = highlight
    ? "#92400e" : isMessageCard
    ? "#dc2626" : "#0284c7";

  return (

    <div
      className={`relative flex flex-col overflow-hidden h-full patientCardFont transition-all duration-500`}
      style={{
        background: highlight
          ? "linear-gradient(135deg, rgba(120,53,15,0.55) 0%, rgba(5,18,32,0.92) 60%)"
          : isMessageCard
          ? "linear-gradient(135deg, rgba(124,45,18,0.4) 0%, rgba(5,18,32,0.92) 60%)"
          : "linear-gradient(135deg, rgba(7,89,133,0.35) 0%, rgba(5,18,32,0.92) 60%)",
        border: highlight
          ? "1px solid rgba(217,119,6,0.55)"
          : isMessageCard
          ? "1px solid rgba(249,115,22,0.3)"
          : "1px solid rgba(14,165,233,0.22)",
        borderRadius: "20px",
        boxShadow: highlight
          ? "0 0 0 2px rgba(217,119,6,0.35), 0 16px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)"
          : "0 8px 32px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.04)",
      }}
    >
      {/* Pulse ring for highlighted card */}
      {highlight && (
        <>
          <style>{`
            @keyframes s5PulseRing {
              0%   { transform: scale(1);    opacity: 0.7; }
              70%  { transform: scale(1.04); opacity: 0; }
              100% { transform: scale(1);    opacity: 0; }
            }
            .s5-pulse-ring {
              position: absolute; inset: -3px; border-radius: 22px;
              border: 2px solid rgba(217,119,6,0.6);
              animation: s5PulseRing 1.8s ease-out infinite;
              pointer-events: none; z-index: 20;
            }
          `}</style>
          <div className="s5-pulse-ring" />
        </>
      )}

      {/* Left accent strip */}
      <div
        className="absolute left-0 top-0 h-full w-1.5 z-10"
        style={{
          background: `linear-gradient(to bottom, ${accentFrom}, ${accentTo})`,
          borderRadius: "20px 0 0 20px",
        }}
      />

      {/* Subtle inner glow top */}
      <div
        className="absolute inset-x-0 top-0 h-24 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at 50% 0%, ${accentFrom}22 0%, transparent 70%)`,
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex items-center justify-between h-full px-7 py-5 min-[2000px]:px-10 min-[2000px]:py-7 [@media(min-width:4400px)]:px-14 [@media(min-width:4400px)]:py-10 pl-9 min-[2000px]:pl-12">

        {isMessageCard ? (
          /* ── ANNOUNCEMENT CARD ── */
          <>
            <div className="flex flex-col gap-4 min-[2000px]:gap-6 min-w-0 flex-1 pr-4">
              <div className="flex items-center gap-3">
                <FaUserMd style={{ color: "#fb923c", fontSize: "clamp(1.4rem, 2.5vw, 3rem)", flexShrink: 0 }} />
                <p className="text-white font-semibold leading-tight truncate" style={{ fontSize: "clamp(1.1rem, 2vw, 2.2rem)" }}>
                  {doc?.NAME?.split(" ")[0]?.length > 13
                    ? `${doc?.NAME?.split(" ")[0]?.slice(0, 14)}... ${doc?.NAME?.split(" ").slice(1).join(" ")}`
                    : doc?.NAME}
                </p>
              </div>
              <div
                className="inline-flex items-center w-fit px-4 py-1.5 rounded-full font-bold tracking-wide"
                style={{ background: "rgba(251,146,60,0.12)", border: "1px solid rgba(251,146,60,0.35)", color: "#fed7aa", fontSize: "clamp(0.75rem, 1.2vw, 1.2rem)" }}
              >
                {messageText?.length > 32 ? `${messageText.slice(0, 32)}…` : messageText || "No message"}
              </div>
            </div>

            <div className="flex flex-col items-center gap-3 shrink-0">
              <Badge.Ribbon text="ANNOUNCEMENT" color="orange">
                <div
                  className="flex items-center justify-center rounded-full font-black text-white shadow-xl"
                  style={{
                    background: "linear-gradient(135deg, #f97316, #dc2626)",
                    width: "clamp(80px, 3vw, 140px)", height: "clamp(80px, 7vw, 140px)",
                    fontSize: "clamp(0.9rem, 1.5vw, 1.5rem)",
                    border: "3px solid rgba(255,255,255,0.12)",
                  }}
                >
                  INFO
                </div>
              </Badge.Ribbon>
              {doc?.ROOM_NO && (
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full" style={{ background: "rgba(168,85,247,0.15)", border: "1px solid rgba(168,85,247,0.3)" }}>
                  <span className="text-purple-300 font-bold" style={{ fontSize: "clamp(0.7rem, 1vw, 1rem)" }}>ROOM</span>
                  <span className="text-purple-100 font-black" style={{ fontSize: "clamp(0.7rem, 1vw, 1rem)" }}>{doc.ROOM_NO}</span>
                </div>
              )}
            </div>
          </>
        ) : (
          /* ── NORMAL DOCTOR CARD ── */
          <>
            {/* Left info */}
            <div className="flex flex-col gap-4 min-[2000px]:gap-5 min-w-0 flex-1 pr-4">

              {/* Doctor name */}
              <div className="flex items-center gap-3">
                <FaUserMd
                  style={{
                    color: highlight ? "#fbbf24" : "#38bdf8",
                    fontSize: "clamp(1.2rem, 2.2vw, 2.8rem)",
                    flexShrink: 0,
                  }}
                />
                <p
                  className="font-semibold leading-tight truncate"
                  style={{
                    color: highlight ? "#fde68a" : "#e2e8f0",
                    fontSize: "clamp(1rem, 1.8vw, 2rem)",
                  }}
                >
                  {doc?.NAME?.split(" ")[0]?.length > 13
                    ? `${doc?.NAME?.split(" ")[0]?.slice(0, 14)}... ${doc?.NAME?.split(" ").slice(1).join(" ")}`
                    : doc?.NAME}
                </p>
              </div>

              {/* Department pill */}
              <div
                className="inline-flex items-center w-fit px-3 py-1 rounded-full font-bold tracking-wide"
                style={{
                  background: highlight ? "rgba(217,119,6,0.15)" : "rgba(14,165,233,0.1)",
                  border: `1px solid ${highlight ? "rgba(217,119,6,0.4)" : "rgba(14,165,233,0.3)"}`,
                  color: highlight ? "#fde68a" : "#7dd3fc",
                  fontSize: "clamp(0.65rem, 1vw, 1rem)",
                  maxWidth: "90%",
                }}
              >
                <span className="truncate">
                  {doc?.FACULTY_NAME?.length > 28
                    ? `${doc?.FACULTY_NAME.slice(0, 28)}…`
                    : doc?.FACULTY_NAME || "General"}
                </span>
              </div>
            </div>

            {/* Right token + room */}
            <div className="flex flex-col items-center gap-3 shrink-0">
              {doc?.TOKENNO ? (
                <Badge.Ribbon
                  text="TOKEN"
                  color={highlight ? "#92400e" : "#0369a1"}
                >
                  <div
                    className="relative flex items-center justify-center rounded-full font-black text-white shadow-2xl"
                    style={{
                      background: highlight
                        ? "linear-gradient(135deg, #d97706, #92400e)"
                        : "linear-gradient(135deg, #0ea5e9, #0369a1)",
                      width: "clamp(72px, 3.5vw, 130px)",
                      height: "clamp(72px, 6.5vw, 130px)",
                      fontSize: "clamp(1.6rem, 3.5vw, 3.8rem)",
                      border: "3px solid rgba(255,255,255,0.1)",
                      boxShadow: highlight
                        ? "0 0 30px rgba(217,119,6,0.4), 0 8px 24px rgba(0,0,0,0.4)"
                        : "0 0 30px rgba(14,165,233,0.25), 0 8px 24px rgba(0,0,0,0.4)",
                    }}
                  >
                    <FaHashtag
                      style={{ position: "absolute", top: "14%", left: "14%", opacity: 0.2, fontSize: "clamp(0.8rem, 1.5vw, 1.5rem)" }}
                    />
                    {doc.TOKENNO}
                  </div>
                </Badge.Ribbon>
              ) : (
                <div
                  className="flex items-center justify-center rounded-2xl"
                  style={{
                    background: "rgba(255,255,255,0.04)", border: "1px dashed rgba(255,255,255,0.12)",
                    padding: "clamp(8px, 1.2vw, 20px) clamp(12px, 2vw, 28px)",
                  }}
                >
                  <p style={{ color: "#64748b", fontSize: "clamp(0.65rem, 0.9vw, 0.95rem)", fontWeight: 500 }}>No Patient Yet</p>
                </div>
              )}

              {doc?.ROOM_NO ? (
                <div
                  className="flex items-center gap-1.5 px-3 py-1 rounded-full"
                  style={{ background: "rgba(168,85,247,0.15)", border: "1px solid rgba(168,85,247,0.3)" }}
                >
                  <span className="text-purple-300 font-bold" style={{ fontSize: "clamp(0.65rem, 0.9vw, 1rem)" }}>ROOM</span>
                  <span className="text-purple-100 font-black" style={{ fontSize: "clamp(0.65rem, 0.9vw, 1rem)" }}>{doc.ROOM_NO}</span>
                </div>
              ) : (
                <div
                  className="flex items-center justify-center rounded-xl px-3 py-1"
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px dashed rgba(255,255,255,0.1)" }}
                >
                  <p style={{ color: "#475569", fontSize: "clamp(0.6rem, 0.85vw, 0.9rem)", fontWeight: 500 }}>No Room</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>

    </div>
  );
};

export default memo(PatientCard);























//                  ---------------     light theme card      -------------------


// import { memo } from "react";
// import { Tag, Badge } from "antd";
// import { FaUserInjured, FaUserMd, FaHashtag, FaInfoCircle, FaDoorOpen } from "react-icons/fa";
// import { motion } from "framer-motion";

// const PatientCard = ({ doc, isTwo, highlight }) => {

//   const isMessageCard = doc?.GENDER === "message";
//   const messageText = isMessageCard ? doc?.PATIENTNAME : null;
//   // console.log(doc , "doc......")0;


//   return (

//     <div className={` relative bg-white rounded-3xl shadow-xl border border-cyan-200 overflow-hidden hover:shadow-2xl transition-all duration-300 patientCardFont  ${highlight ? "bg-yellow-50 animate-pulse ring-2 ring-yellow-400 shadow-md shadow-yellow-400/40 scale-100 border-yellow-400" : ""}`}>

//       {/* Left Gradient Strip */}
//       {
//         isMessageCard ? <div className="absolute left-0 top-0 h-full w-2 bg-linear-to-b from-orange-400 to-red-500" />
//           : <div className={`absolute left-0 top-0 h-full w-2 bg-linear-to-b ${highlight ? "from-yellow-800 to-yellow-500" : "from-cyan-500 to-blue-500"} `} />
//       }

//       <div className="p-6 4xl:p-12 flex justify-between items-center h-full">

//         {
//           isMessageCard ? (

//             // MESSAGE CARD VIEW - When GENDER is "message"
//             <>
//               {/* left view */}
//               <div className="space-y-6 3xl:space-y-10 4xl:space-y-14 5xl:space-y-16">

//                 {/* Doctor Name */}
//                 <div className="flex items-center gap-3 4xl:gap-5">
//                   <FaUserMd className="text-orange-500 text-3xl 4xl:text-5xl 5xl:text-6xl" />
//                   <p className="text-3xl xl:text-4xl 4xl:text-5xl 5xl:text-6xl font-semibold text-gray-500">
//                     {doc?.NAME?.split(" ")[0]?.length > 13 ? `${doc?.NAME?.split(" ")[0]?.slice(0, 14)} ... ${doc?.NAME.split(" ").slice(1).join(" ")}` : doc?.NAME}
//                   </p>
//                 </div>

//                 <div className="flex gap-10">
//                   <div className="inline-flex items-center justify-center px-4 py-1 bg-orange-50 border border-orange-300 rounded-full text-orange-700 font-extrabold text-md 2xl:text-lg 4xl:text-xl tracking-wide shadow-sm">
//                     {messageText?.length > 30 ? `${messageText.slice(0, 30)}...` : messageText || "No message available"}
//                   </div>
//                 </div>

//               </div>

//               {/* RIGHT SIDE - Message Badge instead of Token */}
//               <div className="flex flex-col items-center justify-center gap-4 4xl:gap-8">

//                 <Badge.Ribbon
//                   text="ANNOUNCEMENT"
//                   color="orange"
//                   className="text-lg 4xl:text-xl font-semibold"
//                 >
//                   <div className="relative bg-linear-to-br from-orange-500 to-red-600 text-white rounded-full px-6 py-6 4xl:px-8 4xl:py-10 flex items-center justify-center shadow-2xl border-4 border-white min-w-[140px] 4xl:min-w-[180px]">
//                     <span className="text-2xl 4xl:text-3xl font-black text-center">
//                       INFO
//                     </span>
//                   </div>
//                 </Badge.Ribbon>

//                 {/* Status changed to MESSAGE */}
//                 {/* <div className="inline-flex items-center justify-center px-3 py-1 text-sm 2xl:text-md 4xl:text-lg 5xl:text-xl font-extrabold tracking-widest text-[#ad8b00] bg-[#fff7d6] border border-[#ffe58f] rounded-full shadow-md animate-pulse">
//                   NOT SERVING
//                 </div> */}

//                 {doc?.ROOM_NO &&
//                   <div className="inline-flex items-center gap-2 px-4 py-1 bg-purple-50 border border-purple-300 rounded-full w-fit">

//                     <span className=" text-md 2xl:text-lg 4xl:text-xl font-bold text-purple-700 tracking-wide">ROOM</span>
//                     <span className=" text-purple-900 font-extrabold text-md 2xl:text-lg 4xl:text-xl">{doc?.ROOM_NO}</span>

//                   </div>
//                 }

//               </div>

//             </>
//           ) : (
//             // NORMAL CARD VIEW - Original design
//             <>
//               {/* LEFT INFO */}
//               <div className="space-y-6 3xl:space-y-10 4xl:space-y-14 5xl:space-y-16">

//                 {/* Doctor Name */}
//                 <div className="flex items-center gap-3 4xl:gap-5">
//                   <FaUserMd className={`${highlight ? "text-yellow-500" : "text-blue-500"} text-3xl 4xl:text-5xl 5xl:text-6xl`} />
//                   <p className=" text-3xl xl:text-4xl 4xl:text-5xl 5xl:text-6xl font-semibold text-gray-500">
//                     {doc?.NAME?.split(" ")[0]?.length > 13 ? `${doc?.NAME?.split(" ")[0]?.slice(0, 14)} ... ${doc?.NAME.split(" ").slice(1).join(" ")}` : doc?.NAME}
//                   </p>
//                 </div>

//                 {/* Faculty/Department */}
//                 <div className="flex gap-10">
//                   <div className={`tracking-wide inline-flex items-center justify-center px-4 py-1 border  rounded-full  ${highlight ? " bg-[#fff9e6]  border-[#a37615]  text-yellow-700" : "bg-[#e6fffb]  border-[#87e8de]  text-cyan-700"}    font-extrabold  text-sm 2xl:text-md 4xl:text-lg tracking-wide shadow-sm`}>
//                     {doc?.FACULTY_NAME?.length > 25 ? `${doc?.FACULTY_NAME.slice(0, 30)} ...` : doc?.FACULTY_NAME || "No Faculty Yet"}
//                   </div>
//                 </div>

//               </div>

//               {/* RIGHT TOKEN */}
//               <div className="flex flex-col items-center justify-center gap-4 4xl:gap-8 5xl:gap-12">

//                 {/* Token Circle */}
//                 {
//                   doc?.TOKENNO ? <Badge.Ribbon
//                     text="TOKEN"
//                     color={highlight ? "#854d0e" : "blue"}
//                     className="text-lg 4xl:text-xl font-semibold"
//                   >
//                     <div className={`relative bg-linear-to-br  ${highlight ? "from-yellow-800 to-yellow-500" : "from-cyan-500 to-blue-600"}  text-white rounded-full px-4 py-6 4xl:px-6 4xl:py-8 flex items-center justify-center shadow-2xl border-4 border-white`}>
//                       <FaHashtag className="absolute top-3 left-3 opacity-30 text-xl" />
//                       <span className="text-5xl 4xl:text-6xl font-black">
//                         {doc?.TOKENNO}
//                       </span>
//                     </div>
//                   </Badge.Ribbon> :

//                     // <div className="flex flex-col items-center justify-center bg-gray-50 border border-dashed border-gray-300 rounded-2xl px-6 py-8 4xl:px-10 4xl:py-12 5xl:px-14 5xl:py-16 shadow-inner w-[90%] max-w-xs 4xl:max-w-sm">
//                     <div className="flex flex-col items-center justify-center bg-gray-50 border border-dashed border-gray-300 rounded-2xl px-4 py-3 4xl:px-6 4xl:py-3 5xl:px-8 5xl:py-3 shadow-inner w-[80%] max-w-xs 4xl:max-w-sm">

//                       <p className="text-gray-500 text-sm 4xl:text-lg font-medium text-center">
//                         No Patient Yet
//                       </p>

//                     </div>
//                 }

//                 {
//                   doc?.ROOM_NO ?
//                     <div className="inline-flex items-center gap-2 px-4 py-1 bg-purple-50 border border-purple-300 rounded-full w-fit">

//                       <span className=" text-md 2xl:text-lg 4xl:text-xl font-bold text-purple-700 tracking-wide">ROOM</span>
//                       <span className=" text-purple-900 font-extrabold text-md 2xl:text-lg 4xl:text-xl">{doc?.ROOM_NO}</span>

//                     </div>
//                     :
//                     // <div className="flex flex-col items-center justify-center bg-gray-50 border border-dashed border-gray-300 rounded-2xl px-4 py-1 shadow-inner w-fit ">
//                     <div className="inline-flex items-center gap-2 px-4 py-1 bg-gray-50 border border-dashed border-gray-300 rounded-2xl w-fit">

//                       <p className="text-gray-500 text-sm 4xl:text-lg font-medium text-center">
//                         No Room
//                       </p>

//                     </div>
//                 }

//               </div>
//             </>
//           )
//         }

//       </div>

//     </div >

//   );
// };

// export default memo(PatientCard);




