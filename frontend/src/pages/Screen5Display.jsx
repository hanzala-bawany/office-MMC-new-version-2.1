import { useState, useEffect, useCallback, useRef } from "react";
import logo from "../assets/MMC logo.png";
import NubitLogo from "../assets/nubit logo png.png";
import hospitraxLogo from "../assets/productLogoBgRemove.png";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { toast } from "react-toastify";
import { base_URL } from "../utills/baseUrl";
import { logoutUser } from "../reduxToolKit/authSlice";
import { updatePatinetnDocotrsData } from "../reduxToolKit/doctorSlice";
import { useScreenSocket } from "../utills/useScreenSocket";
import LeftPanel from "../components/screen5/LeftPanel";
import RightPanel from "../components/screen5/RightPanel";

// Live clock
const LiveClock = () => {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  const p = (n) => n.toString().padStart(2, "0");
  const date = time.toLocaleDateString("en-PK", { weekday: "short", day: "2-digit", month: "short", year: "numeric" });
  return (
    <div className="flex flex-col items-end select-none">
      <span className="text-white font-black tracking-wider text-3xl min-[2000px]:text-4xl [@media(min-width:3200px)]:text-5xl [@media(min-width:4400px)]:text-7xl tabular-nums leading-none">
        {p(time.getHours())}<span className="animate-pulse">:</span>{p(time.getMinutes())}
        <span className="text-sky-300/70 text-2xl min-[2000px]:text-3xl">:{p(time.getSeconds())}</span>
      </span>
      <span className="text-sky-200 text-sm min-[2000px]:text-base [@media(min-width:3200px)]:text-xl font-medium tracking-wider uppercase mt-0.5">
        {date}
      </span>
    </div>
  );
};

const Screen5Display = () => {

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const patinetnDocotrsData = useSelector((state) => state?.doctorSlice?.patinetnDocotrData);
  const [isLoading, setIsLoading] = useState(true);
  const voiceQueueRef = useRef([]);
  const isSpeakingRef = useRef(false);
  const alertAudioRef = useRef(null);
  const currentSpeakingTokenRef = useRef(null);
  const [highlightToken, setHighlightToken] = useState(null);
  const { screenNum } = useParams();
  const SCREEN_ID = parseInt(screenNum) + 1;

  const logoutHandler = () => {
    dispatch(logoutUser());
    toast.success("Logout Successful");
    navigate("/login");
  };

  const getPatientnDoctorInfo = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(`${base_URL}/api/opd/patients-by-screen?patientStatus=2&screenId=${SCREEN_ID}`);
      dispatch(updatePatinetnDocotrsData(res?.data?.data));
    } catch (err) {
      console.log(err, "error in get Doctor info");
    } finally {
      setIsLoading(false);
    }
  };

  const playAlert = () =>
    new Promise((resolve) => {
      if (!alertAudioRef.current) return resolve();
      alertAudioRef.current.currentTime = 0;
      alertAudioRef.current.play();
      alertAudioRef.current.onended = () => resolve();
    });

  const cleanDoctorName = (name) => {
    if (!name) return "";
    return name
      .replace(/\(.*?\)/g, "").replace(/\bDR\.?\b/gi, "")
      .replace(/-/g, " ").replace(/\./g, " ").replace(/,/g, " ")
      .replace(/\s+/g, " ").trim().toLowerCase();
  };

  const loadVoices = () =>
    new Promise((resolve) => {
      let voices = speechSynthesis.getVoices();
      if (voices.length) resolve(voices);
      speechSynthesis.onvoiceschanged = () => resolve(speechSynthesis.getVoices());
    });

  const speakToken = async ({ token, doctor, room }) => {
    const voices = await loadVoices();
    const msg = new SpeechSynthesisUtterance(
      token === "System"
        ? "Voice service is ready."
        : `Token ${token} , Aap doctor ${doctor} ke paas, ${room ? `room number ${room} me` : ""} tashreef le jaen`,
    );
    msg.voice =
      voices.find((v) => v?.lang?.includes("hi")) ||
      voices?.find((v) => v?.lang?.includes("en")) ||
      voices[0];
    msg.rate = 0.9;
    const done = () => {
      isSpeakingRef.current = false;
      currentSpeakingTokenRef.current = null;
      setHighlightToken(null);
      playNextVoice();
    };
    msg.onend = done;
    msg.onerror = (e) => { console.log("Speech error:", e); done(); };
    window.speechSynthesis.resume();
    window.speechSynthesis.speak(msg);
  };

  const playNextVoice = async () => {
    if (isSpeakingRef.current || voiceQueueRef.current.length === 0) return;
    isSpeakingRef.current = true;
    const data = voiceQueueRef.current.shift();
    try { await playAlert(); } catch (err) { console.log(err); }
    setHighlightToken(data);
    speakToken(data);
  };

  const handleQueueUpdate = useCallback(
    (payload) => {
      console.log(`Screen ${SCREEN_ID} received:`, payload);
      if (payload?.screenId && payload.screenId !== SCREEN_ID) return;
      getPatientnDoctorInfo();
      if (!payload?.patientToken) return;
      const cleanName = payload?.pronounceName
        ? cleanDoctorName(payload?.pronounceName)
        : cleanDoctorName(payload?.doctorName?.replace("DR", ""));
      const item = { token: payload?.patientToken, doctor: cleanName, doctorId: payload?.doctorId, room: payload?.roomNo };
      voiceQueueRef.current.push(item);
      voiceQueueRef.current.push({ ...item });
      playNextVoice();
    },
    [SCREEN_ID],
  );

  const { isConnected } = useScreenSocket(SCREEN_ID, handleQueueUpdate);

  useEffect(() => { getPatientnDoctorInfo(); }, [SCREEN_ID]);
  useEffect(() => { alertAudioRef.current = new Audio("/buffer3.mp3.wav"); }, []);

  useEffect(() => {
    let unlocked = false;
    const unlock = () => {
      if (unlocked) return;
      const msg = new SpeechSynthesisUtterance(" ");
      msg.volume = 0;
      window.speechSynthesis.speak(msg);
      unlocked = true;
    };
    setTimeout(unlock, 1000);
    document.addEventListener("keydown", unlock);
    document.addEventListener("click", unlock);
    return () => {
      document.removeEventListener("keydown", unlock);
      document.removeEventListener("click", unlock);
    };
  }, []);

  return (
    <div
      className="relative h-screen w-full flex flex-col overflow-hidden"
      style={{ background: "linear-gradient(160deg, #061a33 0%, #05152b 55%, #04111f 100%)" }}
    >
      <style>{`
        @keyframes s5Tick { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        .s5-ticker-inner { display: flex; animation: s5Tick 28s linear infinite; }
        .s5-ticker-inner:hover { animation-play-state: paused; }
        .patientCardFont { font-family: inherit; }
      `}</style>

      {/* HEADER */}
      <header className="s5-header relative z-20 flex items-center justify-between px-8 py-3 min-[2000px]:py-4 [@media(min-width:4400px)]:py-7 gap-6 shrink-0">
             
        <div className="flex items-center gap-3 min-w-[160px]">

           <div className="relative ">
             <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full blur-md opacity-75 group-hover:opacity-100 transition duration-300"></div>
            <img
              src={hospitraxLogo}
              alt="Hospitrax Logo"
              className="bg-amber-50 relative w-16 object-contain rounded-full p-2 border border-blue-400 shadow-xl"
            />
          </div>

          <div className="flex items-center  bg-white/5 border border-white/10 rounded-full px-3 py-1">
            <span className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"}`} />
            <span
              className={`w-2 h-2 rounded-full ${isConnected ? "s5-dot-live" : "s5-dot-off"}`}
            />
            <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 min-[2000px]:text-xs">
              {isConnected ? "Live" : "Off"}
            </span>
          </div>
        </div>

        <div
          onClick={() => {
            voiceQueueRef.current.push({ token: "System", doctor: "system" });
            playNextVoice();
          }}
          className="flex items-center gap-4 cursor-pointer group"
        >
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-cyan-400/20 blur-lg scale-125 group-hover:bg-cyan-400/35 transition-all duration-500" />
            <div className="relative  rounded-full p-1.5 shadow-xl border border-cyan-300/30">
              <img
                src={logo}
                alt="MMC"
                className="h-11 w-11 min-[2000px]:h-15 min-[2000px]:w-15 [@media(min-width:3200px)]:h-18 [@media(min-width:3200px)]:w-18 [@media(min-width:4400px)]:h-28 [@media(min-width:4400px)]:w-28 object-contain"
              />
            </div>
          </div>

          <div>
            <h1
              className="text-white font-black text-2xl min-[2000px]:text-4xl [@media(min-width:3200px)]:text-5xl [@media(min-width:4400px)]:text-7xl tracking-wide leading-none"
              style={{ textShadow: "0 0 40px rgba(56,189,248,0.3)" }}
            >
              Memon Medical Complex
            </h1>
            <p className="text-cyan-300/70 text-xs min-[2000px]:text-xl [@media(min-width:3200px)]:text-2xl [@media(min-width:4400px)]:text-4xl font-light italic tracking-wide mt-0.5">
              "Serving with Excellence & Care"
            </p>
          </div>
        </div>

        <div className="flex items-end gap-8 min-w-[160px]">
          <LiveClock />
          <div className="s5-screen-badge px-5 py-1.5 min-[2000px]:px-7 min-[2000px]:py-2">

            <div className="flex items-center gap-2 border-2 border-blue-400 rounded-2xl px-2">
              <span className="text-cyan-400/80 text-xs font-semibold uppercase tracking-widest min-[2000px]:text-sm">
                Screen
              </span>
              <span className="text-white text-2xl font-black tabular-nums min-[2000px]:text-3xl [@media(min-width:3200px)]:text-4xl [@media(min-width:4400px)]:text-5xl">
                {screenNum}
              </span>

            </div>
          </div>
        </div>

      </header>

      {/* BODY: parent -> Left (60%) + Right (40%) */}
      <main className="relative z-10 flex-1 grid grid-cols-[3fr_2fr] gap-4 min-[2000px]:gap-6 min-h-0 px-5 pt-4 pb-2 min-[2000px]:px-8 [@media(min-width:4400px)]:px-12">
        <LeftPanel
          docs={patinetnDocotrsData || []}
          isLoading={isLoading}
          highlightToken={highlightToken}
        />
        <RightPanel />
      </main>

      {/* TICKER */}
      {/* <div className="relative z-10 overflow-hidden shrink-0" style={{ background: "rgba(14,165,233,0.1)", borderTop: "1px solid rgba(56,189,248,0.2)" }}>
        <div className="s5-ticker-inner py-2">
          {[1, 2].map((_, ri) => (
            <div key={ri} className="flex items-center gap-12 pr-12 shrink-0">
              {[
                "🏥  Please maintain silence in the hospital premises.",
                "📵  Mobile phones on silent mode.",
                "🧼  Wash hands regularly for your safety.",
                "🚫  No smoking inside hospital.",
                "⏰  Please arrive 15 mins before your appointment.",
                "💙  Your health is our priority.",
              ].map((msg, j) => (
                <span key={j} className="text-cyan-100 text-sm min-[2000px]:text-lg font-medium whitespace-nowrap px-6">{msg}</span>
              ))}
            </div>
          ))}
        </div>
      </div> */}

      {/* FOOTER */}
      <footer className="relative z-20 flex items-center justify-center gap-3 py-2 min-[2000px]:py-3 shrink-0" style={{ background: "rgba(6,26,51,0.9)" }}>
        <span className="text-slate-300 text-xl [@media(min-width:3200px)]:text-4xl [@media(min-width:4400px)]:text-5xl font-medium cursor-pointer" onClick={logoutHandler}>
          Powered by
        </span>
        <img src={NubitLogo} alt="Nubit" className="h-5 min-[2000px]:h-7 [@media(min-width:3200px)]:h-9 [@media(min-width:4400px)]:h-14 w-auto object-contain cursor-pointer opacity-90" onClick={logoutHandler} />
      </footer>

    </div>
  );
};

export default Screen5Display;









// ----------------    old screen dark theme --------------------


// import { useState, useEffect, useCallback } from "react";
// import logo from "../assets/MMC logo.png";
// import NubitLogo from "../assets/nubit logo png.png";
// import hospitraxLogo from "../assets/productLogoBgRemove.png";
// import { useNavigate, useParams } from "react-router-dom";
// import { useDispatch, useSelector } from "react-redux";
// import PatientCard from "../components/screen5/PatientCard";
// import { useRef } from "react";
// import { base_URL } from "../utills/baseUrl";
// import axios from "axios";
// import { logoutUser } from "../reduxToolKit/authSlice";
// import { toast } from "react-toastify";
// import { updatePatinetnDocotrsData } from "../reduxToolKit/doctorSlice";
// import ImageLoader from "../utills/ImageLoader";
// import EmptyPatientMessage from "../components/screen5/EmptyPatientMessage";
// import { useScreenSocket } from "../utills/useScreenSocket";

// // Live clock component
// const LiveClock = () => {
//   const [time, setTime] = useState(new Date());
//   useEffect(() => {
//     const t = setInterval(() => setTime(new Date()), 1000);
//     return () => clearInterval(t);
//   }, []);
//   const hh = time.getHours().toString().padStart(2, "0");
//   const mm = time.getMinutes().toString().padStart(2, "0");
//   const ss = time.getSeconds().toString().padStart(2, "0");
//   const date = time.toLocaleDateString("en-PK", {
//     weekday: "short",
//     day: "2-digit",
//     month: "short",
//     year: "numeric",
//   });
//   return (
//     <div className="flex flex-col items-end select-none">
//       <span className="text-[#7dd3fc] font-mono font-black tracking-widest text-2xl min-[2000px]:text-3xl [@media(min-width:3200px)]:text-4xl [@media(min-width:4400px)]:text-6xl tabular-nums leading-none">
//         {hh}
//         <span className="animate-pulse">:</span>
//         {mm}
//         <span className="text-[#38bdf8]/60 text-xl min-[2000px]:text-2xl">
//           :{ss}
//         </span>
//       </span>
//       <span className="text-[#94a3b8] text-xs min-[2000px]:text-sm [@media(min-width:3200px)]:text-base font-medium tracking-wider uppercase mt-0.5">
//         {date}
//       </span>
//     </div>
//   );
// };



// const Screen5Display = () => {
//   const navigate = useNavigate();
//   const dispatch = useDispatch();
//   const patinetnDocotrsData = useSelector(
//     (state) => state?.doctorSlice?.patinetnDocotrData,
//   );
//   const [isLoading, setIsLoading] = useState(true);
//   const voiceQueueRef = useRef([]);
//   const isSpeakingRef = useRef(false);
//   const alertAudioRef = useRef(null);
//   const currentSpeakingTokenRef = useRef(null);
//   const [highlightToken, setHighlightToken] = useState(null);
//   const { screenNum } = useParams();
//   const SCREEN_ID = parseInt(screenNum) + 1;

//   const logoutHandler = () => {
//     dispatch(logoutUser());
//     toast.success("Logout Successful");
//     navigate("/login");
//   };

//   const getPatientnDoctorInfo = async () => {
//     setIsLoading(true);
//     try {
//       const res = await axios.get(
//         `${base_URL}/api/opd/patients-by-screen?patientStatus=2&screenId=${SCREEN_ID}`,
//       );
//       dispatch(updatePatinetnDocotrsData(res?.data?.data));
//     } catch (err) {
//       console.log(err, "error in get Doctor info");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const playAlert = () =>
//     new Promise((resolve) => {
//       if (!alertAudioRef.current) {
//         resolve();
//         return;
//       }
//       alertAudioRef.current.currentTime = 0;
//       alertAudioRef.current.play();
//       alertAudioRef.current.onended = () => resolve();
//     });

//   const cleanDoctorName = (name) => {
//     if (!name) return "";
//     return name
//       .replace(/\(.*?\)/g, "")
//       .replace(/\bDR\.?\b/gi, "")
//       .replace(/-/g, " ")
//       .replace(/\./g, " ")
//       .replace(/,/g, " ")
//       .replace(/\s+/g, " ")
//       .trim()
//       .toLowerCase();
//   };

//   const loadVoices = () =>
//     new Promise((resolve) => {
//       let voices = speechSynthesis.getVoices();
//       if (voices.length) resolve(voices);
//       speechSynthesis.onvoiceschanged = () =>
//         resolve(speechSynthesis.getVoices());
//     });

//   const speakToken = async ({ token, doctor, room }) => {
//     const voices = await loadVoices();
//     const msg = new SpeechSynthesisUtterance(
//       token === "System"
//         ? "Voice service is ready."
//         : `Token ${token} , Aap doctor ${doctor} ke paas, ${room ? `room number ${room} me` : ""} tashreef le jaen`,
//     );
//     msg.voice =
//       voices.find((v) => v?.lang?.includes("hi")) ||
//       voices?.find((v) => v?.lang?.includes("en")) ||
//       voices[0];
//     msg.rate = 0.9;
//     msg.onend = () => {
//       isSpeakingRef.current = false;
//       currentSpeakingTokenRef.current = null;
//       setHighlightToken(null);
//       playNextVoice();
//     };
//     msg.onerror = (e) => {
//       console.log("Speech error:", e);
//       isSpeakingRef.current = false;
//       currentSpeakingTokenRef.current = null;
//       setHighlightToken(null);
//       playNextVoice();
//     };
//     window.speechSynthesis.resume();
//     window.speechSynthesis.speak(msg);
//   };

//   const playNextVoice = async () => {
//     if (isSpeakingRef.current || voiceQueueRef.current.length === 0) return;
//     isSpeakingRef.current = true;
//     const data = voiceQueueRef.current.shift();
//     try {
//       await playAlert();
//     } catch (err) {
//       console.log(err);
//     }
//     setHighlightToken(data);
//     speakToken(data);
//   };

//   const handleQueueUpdate = useCallback(
//     (payload) => {
//       console.log(`Screen ${SCREEN_ID} received:`, payload);
//       if (payload?.screenId && payload.screenId !== SCREEN_ID) return;
//       getPatientnDoctorInfo();
//       if (!payload?.patientToken) return;
//       const cleanName = payload?.pronounceName
//         ? cleanDoctorName(payload?.pronounceName)
//         : cleanDoctorName(payload?.doctorName?.replace("DR", ""));
//       voiceQueueRef.current.push({
//         token: payload?.patientToken,
//         doctor: cleanName,
//         doctorId: payload?.doctorId,
//         room: payload?.roomNo,
//       });
//       voiceQueueRef.current.push({
//         token: payload?.patientToken,
//         doctor: cleanName,
//         doctorId: payload?.doctorId,
//         room: payload?.roomNo,
//       });
//       playNextVoice();
//     },
//     [SCREEN_ID],
//   );

//   const { isConnected } = useScreenSocket(SCREEN_ID, handleQueueUpdate);

//   useEffect(() => {
//     getPatientnDoctorInfo();
//   }, [SCREEN_ID]);

//   useEffect(() => {
//     alertAudioRef.current = new Audio("/buffer3.mp3.wav");
//   }, []);

//   useEffect(() => {
//     let unlocked = false;
//     const unlock = () => {
//       if (unlocked) return;
//       const msg = new SpeechSynthesisUtterance(" ");
//       msg.volume = 0;
//       window.speechSynthesis.speak(msg);
//       unlocked = true;
//     };
//     setTimeout(unlock, 1000);
//     document.addEventListener("keydown", unlock);
//     document.addEventListener("click", unlock);
//     return () => {
//       document.removeEventListener("keydown", unlock);
//       document.removeEventListener("click", unlock);
//     };
//   }, []);

//   return (
//     <div
//       className="relative h-screen w-full flex flex-col overflow-hidden"
//       style={{ background: "#050f1c" }}
//     >
//       {/* ── CSS ── */}
//       <style>{`
//         /* Radial blobs */
//         .s5-blob-tl {
//           position: absolute; pointer-events: none;
//           width: 520px; height: 520px; border-radius: 50%;
//           background: radial-gradient(circle, rgba(14,165,233,0.13) 0%, transparent 70%);
//           top: -140px; left: -100px;
//         }
//         .s5-blob-br {
//           position: absolute; pointer-events: none;
//           width: 480px; height: 480px; border-radius: 50%;
//           background: radial-gradient(circle, rgba(45,212,191,0.09) 0%, transparent 70%);
//           bottom: -120px; right: -80px;
//         }
//         /* Subtle grid */
//         .s5-grid {
//           position: absolute; inset: 0; pointer-events: none;
//           background-image:
//             linear-gradient(rgba(148,163,184,0.04) 1px, transparent 1px),
//             linear-gradient(90deg, rgba(148,163,184,0.04) 1px, transparent 1px);
//           background-size: 60px 60px;
//         }
//         /* Header glass bar */
//         .s5-header {
//           background: rgba(5, 18, 32, 0.82);
//           backdrop-filter: blur(18px);
//           border-bottom: 1px solid rgba(56,189,248,0.12);
//           box-shadow: 0 4px 32px rgba(0,0,0,0.4);
//         }
//         /* Footer glass bar */
//         .s5-footer {
//           background: rgba(5, 18, 32, 0.85);
//           backdrop-filter: blur(18px);
//           border-top: 1px solid rgba(56,189,248,0.10);
//         }
//         /* Screen badge */
//         .s5-screen-badge {
//           background: linear-gradient(135deg, rgba(14,165,233,0.18), rgba(45,212,191,0.12));
//           border: 1px solid rgba(56,189,248,0.3);
//           border-radius: 12px;
//         }
//         /* Connection dot */
//         .s5-dot-live { background: #22c55e; box-shadow: 0 0 8px rgba(34,197,94,0.7); }
//         .s5-dot-off  { background: #ef4444; box-shadow: 0 0 8px rgba(239,68,68,0.5); }
//         /* Floating particles */
//         @keyframes s5Float {
//           0%   { transform: translateY(0) rotate(0deg); opacity: 0; }
//           8%   { opacity: 0.65; }
//           90%  { opacity: 0.3; }
//           100% { transform: translateY(-100vh) rotate(360deg); opacity: 0; }
//         }
//         .s5-particle { position: absolute; animation: s5Float linear infinite; pointer-events: none; }
//         .s5-cross::before, .s5-cross::after {
//           content: ''; position: absolute; background: rgba(125,211,252,0.5); border-radius: 2px;
//         }
//         .s5-cross::before { width: 100%; height: 34%; top: 33%; left: 0; }
//         .s5-cross::after  { width: 34%; height: 100%; left: 33%; top: 0; }
//         .s5-dot-p { border-radius: 50%; background: rgba(34,211,238,0.6); }
//         .s5-ring-p { border-radius: 50%; border: 1.5px solid rgba(186,230,253,0.4); background: transparent; }
//         /* Ticker marquee */
//         @keyframes s5Tick {
//           0%   { transform: translateX(0); }
//           100% { transform: translateX(-50%); }
//         }
//         .s5-ticker-inner { display: flex; animation: s5Tick 28s linear infinite; }
//         .s5-ticker-inner:hover { animation-play-state: paused; }
//         /* patientCardFont must remain if referenced in PatientCard */
//         .patientCardFont { font-family: inherit; }
//       `}</style>

//       {/* BG layers */}
//       <div className="absolute inset-0 z-0">
//         <div className="s5-grid" />
//         <div className="s5-blob-tl" />
//         <div className="s5-blob-br" />
//       </div>

//       {/* Particles */}
//       <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
//         {[
//           { l: "5%", dur: "20s", del: "0s", t: "cross", sz: 14 },
//           { l: "13%", dur: "25s", del: "3s", t: "dot", sz: 6 },
//           { l: "22%", dur: "18s", del: "7s", t: "ring", sz: 12 },
//           { l: "31%", dur: "28s", del: "1s", t: "cross", sz: 10 },
//           { l: "40%", dur: "22s", del: "9s", t: "dot", sz: 5 },
//           { l: "49%", dur: "19s", del: "4s", t: "ring", sz: 14 },
//           { l: "57%", dur: "24s", del: "12s", t: "cross", sz: 18 },
//           { l: "66%", dur: "21s", del: "2s", t: "dot", sz: 7 },
//           { l: "74%", dur: "17s", del: "8s", t: "ring", sz: 11 },
//           { l: "83%", dur: "26s", del: "6s", t: "cross", sz: 12 },
//           { l: "91%", dur: "23s", del: "14s", t: "dot", sz: 8 },
//         ].map(({ l, dur, del, t, sz }, i) => (
//           <div
//             key={i}
//             className="s5-particle"
//             style={{
//               left: l,
//               bottom: "-20px",
//               animationDuration: dur,
//               animationDelay: del,
//             }}
//           >
//             {t === "cross" && (
//               <div
//                 className="s5-cross relative"
//                 style={{ width: sz, height: sz }}
//               />
//             )}
//             {t === "dot" && (
//               <div className="s5-dot-p" style={{ width: sz, height: sz }} />
//             )}
//             {t === "ring" && (
//               <div className="s5-ring-p" style={{ width: sz, height: sz }} />
//             )}
//           </div>
//         ))}
//       </div>

//       {/* ─── HEADER ─── */}
//       <header className="s5-header relative z-20 flex items-center justify-between px-8 py-3 min-[2000px]:py-4 [@media(min-width:4400px)]:py-7 gap-6 shrink-0">
        
//         {/* Left: Hospitrax logo + connection pill */}
//         <div className="flex items-center gap-3 min-w-[160px]">
//           {/* <img src={hospitraxLogo} alt="Hospitrax" className="h-10 w-auto min-[2000px]:h-14 [@media(min-width:4400px)]:h-20 object-contain drop-shadow" /> */}

//           <div className="relative ">
//             <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full blur-md opacity-75 group-hover:opacity-100 transition duration-300"></div>
//             <img
//               src={hospitraxLogo}
//               alt="Hospitrax Logo"
//               className="bg-amber-50 relative w-16 object-contain rounded-full p-2 border border-blue-400 shadow-xl"
//             />
//           </div>

//           <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-full px-3 py-1">
//             <span
//               className={`w-2 h-2 rounded-full ${isConnected ? "s5-dot-live" : "s5-dot-off"}`}
//             />
//             <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 min-[2000px]:text-xs">
//               {isConnected ? "Live" : "Off"}
//             </span>
//           </div>
//         </div>

//         {/* Center: Hospital branding */}
//         <div
//           onClick={() => {
//             voiceQueueRef.current.push({ token: "System", doctor: "system" });
//             playNextVoice();
//           }}
//           className="flex items-center gap-4 cursor-pointer group"
//         >
//           <div className="relative">
//             <div className="absolute inset-0 rounded-full bg-cyan-400/20 blur-lg scale-125 group-hover:bg-cyan-400/35 transition-all duration-500" />
//             <div className="relative  rounded-full p-1.5 shadow-xl border border-cyan-300/30">
//               <img
//                 src={logo}
//                 alt="MMC"
//                 className="h-11 w-11 min-[2000px]:h-15 min-[2000px]:w-15 [@media(min-width:3200px)]:h-18 [@media(min-width:3200px)]:w-18 [@media(min-width:4400px)]:h-28 [@media(min-width:4400px)]:w-28 object-contain"
//               />
//             </div>
//           </div>

//           <div>
//             <h1
//               className="text-white font-black text-2xl min-[2000px]:text-4xl [@media(min-width:3200px)]:text-5xl [@media(min-width:4400px)]:text-7xl tracking-wide leading-none"
//               style={{ textShadow: "0 0 40px rgba(56,189,248,0.3)" }}
//             >
//               Memon Medical Complex
//             </h1>
//             <p className="text-cyan-300/70 text-xs min-[2000px]:text-xl [@media(min-width:3200px)]:text-2xl [@media(min-width:4400px)]:text-4xl font-light italic tracking-wide mt-0.5">
//               "Serving with Excellence & Care"
//             </p>
//           </div>
//         </div>

//         {/* Right: screen badge + clock */}
//         <div className="flex items-end gap-8 min-w-[160px]">
//           <LiveClock />
//           <div className="s5-screen-badge px-5 py-1.5 min-[2000px]:px-7 min-[2000px]:py-2">
//             <div className="flex items-center gap-2">
//               <span className="text-cyan-400/80 text-xs font-semibold uppercase tracking-widest min-[2000px]:text-sm">
//                 Screen
//               </span>
//               <span className="text-white text-2xl font-black tabular-nums min-[2000px]:text-3xl [@media(min-width:3200px)]:text-4xl [@media(min-width:4400px)]:text-5xl">
//                 {screenNum}
//               </span>
//             </div>
//           </div>
//         </div>
//       </header>

//       {/* ─── BODY ─── */}
//       <main className="relative z-10 flex-1 flex flex-col min-h-0 pt-4 pb-2 px-5 min-[2000px]:pt-6 min-[2000px]:px-8 [@media(min-width:4400px)]:pt-8 [@media(min-width:4400px)]:px-12">
//         {patinetnDocotrsData?.length > 0 ? (
//           <div
//             className={`flex-1 grid grid-cols-3 ${patinetnDocotrsData.length <= 6 ? "grid-rows-2" : ""} gap-4 min-[2000px]:gap-6 [@media(min-width:4400px)]:gap-8 min-h-0`}
//           >
//             {patinetnDocotrsData?.map((doc, i) => (
//               <PatientCard
//                 key={`${doc?.CONSULTANTID}-${doc?.TOKENNO || i}`}
//                 doc={doc}
//                 isTwo={patinetnDocotrsData.length <= 2}
//                 highlight={
//                   highlightToken?.token === doc?.TOKENNO &&
//                   highlightToken?.doctorId == doc?.CONSULTANTID
//                 }
//               />
//             ))}
//           </div>
//         ) : isLoading ? (
//           <div className="flex-1 flex justify-center items-center">
//             <ImageLoader />
//           </div>
//         ) : (
//           <div className="flex-1 flex items-center justify-center">
//             <EmptyPatientMessage />
//           </div>
//         )}
//       </main>

//       {/* ─── TICKER ─── */}
//       <div
//         className="relative z-10 overflow-hidden shrink-0"
//         style={{
//           background: "rgba(14,165,233,0.08)",
//           borderTop: "1px solid rgba(56,189,248,0.12)",
//           borderBottom: "1px solid rgba(56,189,248,0.08)",
//         }}
//       >
//         <div className="s5-ticker-inner py-2">
//           {[1, 2].map((_, ri) => (
//             <div key={ri} className="flex items-center gap-12 pr-12 shrink-0">
//               {[
//                 "🏥  Please maintain silence in the hospital premises.",
//                 "📵  Mobile phones on silent mode.",
//                 "🧼  Wash hands regularly for your safety.",
//                 "🚫  No smoking inside hospital.",
//                 "⏰  Please arrive 15 mins before your appointment.",
//                 "💙  Your health is our priority.",
//               ].map((msg, j) => (
//                 <span
//                   key={j}
//                   className="text-cyan-200/80 text-sm min-[2000px]:text-lg font-medium whitespace-nowrap px-6"
//                 >
//                   {msg}
//                 </span>
//               ))}
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* ─── FOOTER ─── */}
//       <footer className="s5-footer relative z-20 flex items-center justify-center gap-3 py-2 min-[2000px]:py-3 shrink-0">
//         <span
//           className="text-slate-400 text-md min-[2000px]:lg [@media(min-width:3200px)]:text-xl [@media(min-width:4400px)]:text-3xl font-medium cursor-pointer"
//           onClick={logoutHandler}
//         >
//           Powered by
//         </span>
//         <img
//           src={NubitLogo}
//           alt="Nubit"
//           className="h-5 min-[2000px]:h-7 [@media(min-width:3200px)]:h-9 [@media(min-width:4400px)]:h-14 w-auto object-contain cursor-pointer opacity-80 hover:opacity-100 transition-opacity"
//           onClick={logoutHandler}
//         />
//       </footer>
//     </div>
//   );
// };

// export default Screen5Display;















//                              ---- old code light theme ----


// import { useState, useEffect, useCallback } from "react";
// import logo from "../assets/MMC logo.png"; // ← Apna logo path yahan set kar lo
// import NubitLogo from "../assets/nubit logo png.png"; // ← Apna Nubit logo
// import hospitraxLogo from "../assets/productLogoBgRemove.png"; // ← Apna Product logo
// import { useNavigate, useParams } from "react-router-dom";
// import { useDispatch, useSelector } from "react-redux";
// import PatientCard from "../components/screen5/PatientCard";
// import { useRef } from "react";
// import { base_URL } from "../utills/baseUrl";
// import axios from "axios";
// import { logoutUser } from "../reduxToolKit/authSlice";
// import { toast } from "react-toastify";
// import { updatePatinetnDocotrsData } from "../reduxToolKit/doctorSlice";
// import ImageLoader from "../utills/ImageLoader";
// import { socket } from "../socket/socket";
// import VidioSlideShow from "../components/screen5/VidioSlideShow";
// import EmptyPatientMessage from "../components/screen5/EmptyPatientMessage";
// import { useScreenSocket } from "../utills/useScreenSocket";

// const Screen5Display = () => {

//   const navigate = useNavigate();
//   const dispatch = useDispatch();
//   const patinetnDocotrsData = useSelector((state) => state?.doctorSlice?.patinetnDocotrData,);
//   const [isLoading, setIsLoading] = useState(true);
//   const voiceQueueRef = useRef([]);
//   const isSpeakingRef = useRef(false);
//   const alertAudioRef = useRef(null);
//   const currentSpeakingTokenRef = useRef(null);
//   const [highlightToken, setHighlightToken] = useState(null);
//   const loginUserData = JSON.parse(localStorage.getItem("loginUserData"));
//   const { screenNum } = useParams(); // Get screen number from URL: /screen/6
//   const SCREEN_ID = parseInt(screenNum) + 1;  // make id fron this



//   const logoutHandler = () => {
//     dispatch(logoutUser());
//     toast.success("Logout Scuccessful");
//     navigate("/login");
//   };

//   const getPatientnDoctorInfo = async () => {
//     setIsLoading(true); // Start loading

//     try {
//       // const res = await axios.get( `${base_URL}/api/opd/patients?patientStatus=2`);
//       const res = await axios.get(`${base_URL}/api/opd/patients-by-screen?patientStatus=2&screenId=${SCREEN_ID}`);
//       dispatch(updatePatinetnDocotrsData(res?.data?.data));
//       // console.log(res , " ,,,,,,,,,,,,,");
//     } catch (err) {
//       console.log(err, "error in get Doctor info");
//     } finally {
//       setIsLoading(false); // Stop loading regardless of success/error
//     }
//   };

//   const playAlert = () => {
//     return new Promise((resolve) => {
//       if (!alertAudioRef.current) {
//         resolve();
//         return;
//       }
//       // console.log(alertAudioRef);

//       alertAudioRef.current.currentTime = 0;

//       alertAudioRef.current.play();

//       alertAudioRef.current.onended = () => {
//         resolve();
//       };
//     });
//   };

//   // voice work START

//   const cleanDoctorName = (name) => {
//     if (!name) return "";

//     return name
//       .replace(/\(.*?\)/g, "") // (Anesthetist), (RMO) etc remove
//       .replace(/\bDR\.?\b/gi, "") // DR. ya DR word remove
//       .replace(/-/g, " ") // hyphen → space
//       .replace(/\./g, " ") // dots → space
//       .replace(/,/g, " ") // comma → space
//       .replace(/\s+/g, " ") // multiple spaces → single
//       .trim()
//       .toLowerCase();
//   }; // ye banaya he take name alag alag word me call na kare

//   const loadVoices = () => {
//     return new Promise((resolve) => {
//       let voices = speechSynthesis.getVoices();
//       if (voices.length) resolve(voices);

//       speechSynthesis.onvoiceschanged = () => {
//         resolve(speechSynthesis.getVoices());
//       };
//     });
//   };

//   const speakToken = async ({ token, doctor, room }) => {
//     // console.log("speak tokenc chala" , token , doctor);
//     const voices = await loadVoices();
//     // console.log(voices, " <<<<<<<< voices");

//     const msg = new SpeechSynthesisUtterance(
//       token === "System"
//         ? "Voice service is ready."
//         : `Token ${token} , Aap doctor ${doctor} ke paas,  ${room ? `room number ${room} me` : ""} tashreef le jaen`,
//       // token === "System" ? "Voice service is ready." : `Token ${token} , Aap doctor  ${doctor}  ke pass tashreef le jaen`
//     );

//     msg.voice =
//       voices.find((v) => v?.lang?.includes("hi")) ||
//       voices?.find((v) => v?.lang?.includes("en")) ||
//       voices[0];
//     msg.rate = 0.9;

//     msg.onend = () => {
//       // console.log("oned bhi chala", isSpeakingRef.current);
//       isSpeakingRef.current = false; // stop voice alert
//       currentSpeakingTokenRef.current = null;
//       setHighlightToken(null); // remove highlight
//       playNextVoice();
//     };

//     msg.onerror = (e) => {
//       console.log("Speech error:", e);
//       isSpeakingRef.current = false;
//       currentSpeakingTokenRef.current = null;
//       setHighlightToken(null);
//       playNextVoice();
//     };

//     window.speechSynthesis.resume();
//     window.speechSynthesis.speak(msg);
//   };

//   const playNextVoice = async () => {
//     // console.log("isSpeakingRef.current >>>>> ", isSpeakingRef.current, " voiceQueueRef.current.length === 0 >>>> ", voiceQueueRef.current.length === 0);
//     if (isSpeakingRef.current || voiceQueueRef.current.length === 0) return;

//     isSpeakingRef.current = true;
//     const data = voiceQueueRef.current.shift();

//     try {
//       await playAlert();
//     } catch (err) {
//       console.log(err, "err in buzzer .............");
//     }
//     setHighlightToken(data);
//     // console.log(data, "dtaa .......................");

//     speakToken(data);
//   };

//   // END


//   // START socket work

//   // useEffect(() => {
//   //   getPatientnDoctorInfo();
//   // }, []);

//   // useEffect(() => {
//   //   const handleQueue = (payload) => {
//   //     console.log(" payload ..........", payload);
//   //     getPatientnDoctorInfo();

//   //     if (!payload?.patientToken) return;

//   //     const cleanName = payload?.pronounceName
//   //       ? cleanDoctorName(payload?.pronounceName)
//   //       : cleanDoctorName(payload?.doctorName?.replace("DR", ""));

//   //     voiceQueueRef?.current?.push({ token: payload?.patientToken, doctor: cleanName, doctorId: payload?.doctorId, room: payload?.roomNo, });
//   //     voiceQueueRef?.current?.push({ token: payload?.patientToken, doctor: cleanName, doctorId: payload?.doctorId, room: payload.roomNo });

//   //     // voiceQueueRef?.current?.push({ token: payload?.patientToken, doctor: payload?.doctorName?.replace("DR", ""), doctorId: payload?.doctorId });
//   //     // voiceQueueRef?.current?.push({ token: payload?.patientToken, doctor: payload?.doctorName?.replace("DR", ""), doctorId: payload?.doctorId });
//   //     playNextVoice();
//   //   };

//   //   socket.on("QUEUE_UPDATED", handleQueue);

//   //   return () => {
//   //     socket.off("QUEUE_UPDATED", handleQueue);
//   //   };
//   // }, []);

  
//   // END


//   // START socket room work

//   const handleQueueUpdate = useCallback((payload) => {


//     console.log(`Screen id ${SCREEN_ID} received update:`, payload);

//     // Double-check if this update is for current screen
//     if (payload?.screenId && payload.screenId !== SCREEN_ID) {
//       console.log(`Ignoring update for screen ${payload.screenId}, current screen is ${SCREEN_ID}`);
//       return;
//     }

//     // Refresh data
//     getPatientnDoctorInfo();

//     if (!payload?.patientToken) return;

//     const cleanName = payload?.pronounceName ? cleanDoctorName(payload?.pronounceName) : cleanDoctorName(payload?.doctorName?.replace("DR", ""));

//     voiceQueueRef.current.push({ token: payload?.patientToken, doctor: cleanName, doctorId: payload?.doctorId, room: payload?.roomNo });
//     voiceQueueRef.current.push({ token: payload?.patientToken, doctor: cleanName, doctorId: payload?.doctorId, room: payload?.roomNo });

//     playNextVoice();
//   }, [SCREEN_ID]);

//   const { isConnected } = useScreenSocket(SCREEN_ID, handleQueueUpdate);

//   useEffect(() => {
//     getPatientnDoctorInfo();
//   }, [SCREEN_ID]);

//   // END


//   useEffect(() => {
//     alertAudioRef.current = new Audio("/buffer3.mp3.wav");
//   }, []);

//   useEffect(() => {
//     let unlocked = false;

//     const unlock = () => {
//       if (unlocked) return;
//       const msg = new SpeechSynthesisUtterance(" ");
//       msg.volume = 0;
//       window.speechSynthesis.speak(msg);
//       unlocked = true;
//     };

//     setTimeout(unlock, 1000);
//     document.addEventListener("keydown", unlock);
//     document.addEventListener("click", unlock);

//     return () => {
//       document.removeEventListener("keydown", unlock);
//       document.removeEventListener("click", unlock);
//     };
//   }, []); // for icon click skip

//   // console.log(patinetnDocotrsData, "<<<<<<< patinetnDocotrsData", highlightToken, "<<<< highlightToken");
//   // console.log(loginUserData, "<<<<<<< loginUserData");



//   return (
//     <div className="relative h-screen w-full flex flex-col bg-gradient-to-br from-[#e0f7fa] to-[#fff]">

//       {/* Animated Background */}
//       <style>{`
//    @keyframes floatUp {
//     0%   { transform: translateY(0) rotate(0deg) scale(0.6); opacity: 0; }
//     10%  { opacity: 1; }
//     85%  { opacity: 0.5; }
//     100% { transform: translateY(-100vh) rotate(360deg) scale(1.1); opacity: 0; }
//    }
//   .particle { position: absolute; opacity: 0; animation: floatUp linear infinite; pointer-events: none; }
//   .cross-shape { width: 16px; height: 16px; position: relative; }
//   .cross-shape::before, .cross-shape::after { content: ''; position: absolute; background: #2196f3; border-radius: 2px; }
//   .cross-shape::before { width: 100%; height: 34%; top: 33%; left: 0; }
//   .cross-shape::after  { height: 100%; width: 34%; left: 33%; top: 0; }
//   .dot-shape { border-radius: 50%; background: #0ea5e9; }
//   .ring-shape { border-radius: 50%; border: 2px solid #38bdf8; background: transparent; }
//       `}</style>

//       <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
//         {[
//           { cl: "p1", l: "5%", dur: "18s", del: "0s", type: "cross", sz: 16 },
//           { cl: "p2", l: "12%", dur: "22s", del: "3s", type: "dot", sz: 7 },
//           { cl: "p3", l: "20%", dur: "16s", del: "6s", type: "ring", sz: 14 },
//           { cl: "p4", l: "28%", dur: "25s", del: "1s", type: "cross", sz: 12 },
//           { cl: "p5", l: "35%", dur: "19s", del: "8s", type: "dot", sz: 6 },
//           { cl: "p6", l: "42%", dur: "21s", del: "4s", type: "ring", sz: 10 },
//           { cl: "p7", l: "50%", dur: "17s", del: "11s", type: "cross", sz: 20 },
//           { cl: "p8", l: "58%", dur: "23s", del: "2s", type: "dot", sz: 8 },
//           { cl: "p9", l: "65%", dur: "20s", del: "7s", type: "ring", sz: 14 },
//           { cl: "p10", l: "72%", dur: "15s", del: "9s", type: "cross", sz: 14 },
//           { cl: "p11", l: "80%", dur: "26s", del: "5s", type: "dot", sz: 5 },
//           { cl: "p12", l: "88%", dur: "18s", del: "13s", type: "ring", sz: 12 },
//           { cl: "p13", l: "8%", dur: "24s", del: "15s", type: "cross", sz: 10 },
//           { cl: "p14", l: "22%", dur: "20s", del: "10s", type: "dot", sz: 9 },
//           { cl: "p15", l: "45%", dur: "22s", del: "12s", type: "ring", sz: 16 },
//           {
//             cl: "p16",
//             l: "62%",
//             dur: "19s",
//             del: "14s",
//             type: "cross",
//             sz: 18,
//           },
//           { cl: "p17", l: "75%", dur: "28s", del: "16s", type: "dot", sz: 7 },
//           { cl: "p18", l: "92%", dur: "17s", del: "18s", type: "ring", sz: 11 },
//         ].map(({ cl, l, dur, del, type, sz }) => (
//           <div
//             key={cl}
//             className="particle"
//             style={{
//               left: l,
//               bottom: "-20px",
//               animationDuration: dur,
//               animationDelay: del,
//             }}
//           >
//             {type === "cross" && (
//               <div className="cross-shape" style={{ width: sz, height: sz }} />
//             )}
//             {type === "dot" && (
//               <div className="dot-shape" style={{ width: sz, height: sz }} />
//             )}
//             {type === "ring" && (
//               <div className="ring-shape" style={{ width: sz, height: sz }} />
//             )}
//           </div>
//         ))}
//       </div>

//       {/* Header */}
//       <div className="flex justify-between items-center px-8 4xl:px-16 py-4 4xl:py-6">

//         {/* Left Side - Hospitrax Logo & Name */}
//         <div className="flex items-center gap-4 [@media(min-width:3200px)]:gap-8 [@media(min-width:4400px)]:gap-12">
//           <img
//             src={hospitraxLogo}
//             alt="Hospitrax Logo"
//             className="w-22 4xl:w-30"
//           />
//         </div>

//         {/* Center - Memon Medical Complex Info (Clickable for Voice) */}
//         <div
//           onClick={() => {
//             voiceQueueRef.current.push({
//               token: "System",
//               doctor: "hanzala bawany",
//             });
//             playNextVoice();
//           }}
//           className="cursor-pointer  flex  items-center gap-4 [@media(min-width:3200px)]:gap-8 [@media(min-width:4400px)]:gap-12"
//         >
//           <div className="bg-white/10 backdrop-blur-md p-2 rounded-full border border-blue-500 ">
//             <img
//               src={logo}
//               alt="logo"
//               className="h-12 min-[2000px]:h-16 [@media(min-width:3000px)]:h-18  [@media(min-width:4400px)]:h-30 w-12 min-[2000px]:w-16 [@media(min-width:3000px)]:w-18 [@media(min-width:4400px)]:w-30 object-contain"
//             />
//           </div>

//           <div>
//             <h1 className="text-blue-500 text-3xl font-bold min-[2000px]:text-5xl [@media(min-width:3200px)]:text-6xl  [@media(min-width:4400px)]:text-7xl  tracking-wide drop-shadow">
//               Memon Medical Complex
//             </h1>
//             <p className="text-[#7d9ec0] text-sm italic min-[2000px]:text-2xl [@media(min-width:3000px)]:text-3xl [@media(min-width:4400px)]:text-5xl ">
//               “Serving with Excellence & Care”
//             </p>
//           </div>
//         </div>

//         {/* Right Side - Empty for balance (or you can add something here later) */}
//         <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl px-6 py-1.5 shadow-md border border-blue-200 min-[2000px]:px-8 min-[2000px]:py-4 [@media(min-width:3200px)]:px-9 [@media(min-width:3200px)]:py-5 [@media(min-width:4400px)]:px-12 [@media(min-width:4400px)]:py-6">
//           <div className="flex items-center gap-2">
//             <span className="text-blue-600 text-sm font-medium uppercase tracking-wide min-[2000px]:text-base [@media(min-width:3200px)]:text-lg">Screen</span>
//             <span className="text-blue-800 text-xl font-bold min-[2000px]:text-2xl [@media(min-width:3200px)]:text-3xl [@media(min-width:4400px)]:text-4xl">:</span>
//             <span className="text-blue-700 text-2xl font-black min-[2000px]:text-3xl [@media(min-width:3200px)]:text-4xl [@media(min-width:4400px)]:text-5xl">{screenNum}</span>
//           </div>
//         </div>

//       </div>

//       {/* Body */}
//       <div className="flex-13 flex mb-7">

//         {patinetnDocotrsData?.length > 0 ? (
//           <div
//             // className={` ${patinetnDocotrsData.length <= 6 ? "w-[70%]" : "w-full"} h-full grid ${patinetnDocotrsData.length <= 6 ? "grid-cols-2" : "grid-cols-3"}  gap-8 4xl:gap-12 px-6`}
//             className={`w-full h-full grid grid-cols-3 ${patinetnDocotrsData.length <= 6 ? "grid-rows-2" : "grid-cols-3"} gap-6  4xl:gap-12 px-6`}
//           >
//             {patinetnDocotrsData?.map((doc, i) => (
//               <PatientCard
//                 key={`${doc?.CONSULTANTID}-${doc?.TOKENNO || i}`}
//                 doc={doc}
//                 isTwo={patinetnDocotrsData.length <= 2}
//                 highlight={
//                   highlightToken?.token === doc?.TOKENNO &&
//                   highlightToken?.doctorId == doc?.CONSULTANTID
//                 }
//               />
//             ))}
//           </div>
//         ) : isLoading ? (
//           <div className="flex justify-center w-full">
//             <ImageLoader />
//           </div>
//         ) : (
//           <EmptyPatientMessage />
//         )}

//         {
//           // patinetnDocotrsData.length <= 6 && <div className='w-[30%] h-full px-6 overflow-hidden '>
//           //   <VidioSlideShow />
//           // </div>
//         }
//       </div>

//       {/* Footer */}
//       <div className=" text-blue-500 flex-1 flex justify-center items-center z-50 [@media(min-width:4200px)]:right-10 bottom-5 [@media(min-width:4200px)]:bottom-8 [@media(min-width:1520px)]:text-2xl [@media(min-width:2200px)]:text-3xl [@media(min-width:3200px)]:text-4xl  [@media(min-width:4200px)]:text-6xl">
//         <span
//           className="flex justify-center items-center gap-2 cursor-pointer"
//           onClick={logoutHandler}
//         >
//           {" "}
//           Powered by{" "}
//           <img
//             className="w-[50px] [@media(min-width:2200px)]:w-[70px] [@media(min-width:3200px)]:w-[80px]"
//             src={NubitLogo}
//             alt=""
//           />{" "}
//         </span>
//       </div>

//     </div>
//   );
// };

// export default Screen5Display;











