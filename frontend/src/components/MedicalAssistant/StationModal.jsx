import { useEffect, useRef, useState } from "react";
import { Modal } from "antd";
import { stationFetch, previewUrl, resultImage, STATION_URL } from "./stationApi";

// Capture weight / height from the vitals station and hand the values to the form.
// Nothing is saved here: values only go into the form, the MA still presses "Save Vitals".

const EP = {
    combined: "/measure/combined",
    manual: "/measure/combined-manual",
    weight: "/weight/measure",
    heightAuto: "/height/auto-capture",
    height: "/height",
};
const END = ["done", "timeout", "error", "cancelled"];
const POLL_MS = 1000;
const POLL_MAX_MS = 20 * 60 * 1000; // QR scan + weight + camera can take a while
const CAMERAS = [["rtsp", "RTSP camera"], ["mobile", "Mobile camera"], ["webcam", "Webcam"]];
const TITLES = { combined: "Capture weight + height", weight: "Capture weight", height: "Capture height" };
const STEP_OF = { connecting: 0, qr_required: 0, waiting_weight: 1, awaiting_photo: 2, capturing_height: 2, measuring_height: 2 };

const MSG = {
    connecting: "Connecting to the scale…",
    qr_required: "Waiting for Smart Life login…",
    waiting_weight: "Step on the scale and stay on it",
    awaiting_photo: "Weight captured. Stand straight, look at the camera and tap Take photo",
    capturing_height: "Stay on the scale, stand straight, look ahead. The picture is taken automatically after the countdown (the camera window is on the station PC)",
    measuring_height: "Measuring height…",
};

const num1 = (n) => (n == null || Number.isNaN(Number(n)) ? "" : String(Math.round(Number(n) * 10) / 10));

const btnGo = "w-full mt-3 h-11 rounded-xl text-white text-sm font-semibold bg-gradient-to-r from-indigo-600 to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed";
const btnGhost = "w-full mt-2 h-10 rounded-xl border border-gray-300 bg-white text-gray-700 text-sm font-medium hover:bg-gray-50 disabled:opacity-50";

const Seg = ({ value, onChange, options }) => (
    <div className="flex gap-1 p-1 rounded-xl bg-indigo-50 mb-3">
        {options.map(([v, l]) => (
            <button
                type="button" key={v} onClick={() => onChange(v)}
                className={`flex-1 h-9 rounded-lg text-xs font-semibold ${value === v ? "bg-white text-indigo-700 shadow" : "text-gray-500"}`}
            >{l}</button>
        ))}
    </div>
);

const Spin = ({ text }) => (
    <div className="flex items-center gap-2 text-sm text-gray-700 my-2">
        <div className="anim-spin w-4 h-4 shrink-0 rounded-full border-2 border-indigo-200 border-t-indigo-600" />
        <span>{text}</span>
    </div>
);

const StationModal = ({ mode, onClose, onApply, currentWeight }) => {
    const [phase, setPhase] = useState("setup"); // setup | running | done | partial | failed
    const [capture, setCapture] = useState("manual"); // combined: manual | auto
    const [hSource, setHSource] = useState("auto"); // height only: auto | photo
    const [camera, setCamera] = useState(() => localStorage.getItem("vx_camera") || "rtsp");
    const [camUrl, setCamUrl] = useState("");
    const [onScale, setOnScale] = useState(false);
    const [file, setFile] = useState(null);
    const [view, setView] = useState(null);
    const [result, setResult] = useState(null);
    const [error, setError] = useState("");
    const [jobId, setJobId] = useState(null);
    const [photoSent, setPhotoSent] = useState(false);
    const [photoErr, setPhotoErr] = useState("");

    const job = useRef(null); // { id, path, timer, busy, bad, t0 }
    const lastW = useRef(null);
    const modeRef = useRef(mode);
    const onApplyRef = useRef(onApply);
    modeRef.current = mode;
    onApplyRef.current = onApply;

    // ── job plumbing ─────────────────────────────────────────────────────────
    const stopPolling = () => {
        if (job.current?.timer) clearInterval(job.current.timer);
        if (job.current) job.current.timer = null;
    };

    const cancelJob = () => {
        const j = job.current;
        stopPolling();
        job.current = null;
        if (j?.id) stationFetch(`${j.path}/${j.id}`, { method: "DELETE" }).catch(() => { });
    };

    const fail = (msg) => {
        stopPolling();
        job.current = null;
        setError(msg);
        setPhase("failed");
    };

    const applyDone = (r, v) => {
        const patch = {};
        const w = r?.weight_kg ?? v?.partial?.weight_kg;
        if (modeRef.current !== "height" && w != null) patch.weight = num1(w);
        if (r?.success && r.height_feet != null) patch.height = `${r.height_feet}'${r.height_inches}"`; // same format as the Python tool, e.g. 5'8"
        if (Object.keys(patch).length) onApplyRef.current(patch);
        setResult(r || {});
        setPhase(r?.success === false ? "partial" : "done");
    };

    const handleView = (v) => {
        setView(v);
        const w = v.partial?.weight_kg;
        if (w != null && lastW.current !== w) {
            lastW.current = w;
            onApplyRef.current({ weight: num1(w) }); // show the weight in the form as soon as it exists
        }
        if (v.photo_received) setPhotoSent(true);
        if (END.includes(v.status)) {
            stopPolling();
            job.current = null;
            if (v.status === "done") applyDone(v.result, v);
            else if (v.status === "cancelled") fail("Measurement was cancelled");
            else fail(v.error || v.message || `Measurement ${v.status}`);
        }
    };

    const poll = async () => {
        const j = job.current;
        if (!j || j.busy) return;
        if (Date.now() - j.t0 > POLL_MAX_MS) { cancelJob(); fail("Timed out waiting for the measurement"); return; }
        j.busy = true;
        try {
            const v = await stationFetch(`${j.path}/${j.id}`);
            if (job.current !== j) return;
            j.bad = 0;
            handleView(v);
        } catch (e) {
            if (job.current === j && ++j.bad >= 5) fail(e.message);
        } finally {
            j.busy = false;
        }
    };

    const startJob = async (path, body) => {
        setPhase("running"); setError(""); setView(null); setResult(null);
        setPhotoSent(false); setPhotoErr(""); setJobId(null); lastW.current = null;
        try {
            const s = await stationFetch(path, { method: "POST", json: body });
            const j = { id: s.job_id, path, bad: 0, busy: false, t0: Date.now(), timer: null };
            job.current = j;
            setJobId(s.job_id);
            j.timer = setInterval(poll, POLL_MS);
        } catch (e) {
            fail(e.message);
        }
    };

    // ── actions ──────────────────────────────────────────────────────────────
    const camBody = () => {
        const b = { camera };
        const url = camUrl.trim();
        localStorage.setItem("vx_camera", camera);
        if (camera !== "webcam") {
            if (url) b.url = url;
            localStorage.setItem(`vx_cam_${camera}`, url);
        }
        return b;
    };

    const start = () => {
        if (mode === "weight") return startJob(EP.weight, null);
        if (mode === "combined") {
            return capture === "manual"
                ? startJob(EP.manual, camBody())
                : startJob(EP.combined, { ...camBody(), include_image: true });
        }
        // height only
        if (hSource === "auto") {
            const w = parseFloat(currentWeight);
            return startJob(EP.heightAuto, { ...camBody(), on_scale: onScale, weight_kg: w > 0 ? w : null, include_image: true });
        }
        return uploadHeight();
    };

    const uploadHeight = async () => {
        if (!file) return;
        setPhase("running"); setError(""); setView(null);
        const fd = new FormData();
        fd.append("image", file);
        fd.append("on_scale", String(onScale));
        fd.append("include_image", "true");
        const w = parseFloat(currentWeight);
        if (w > 0) fd.append("weight_kg", String(w));
        try {
            applyDone(await stationFetch(EP.height, { method: "POST", body: fd }), null);
        } catch (e) {
            fail(e.message);
        }
    };

    const takePhoto = async () => {
        if (!job.current) return;
        setPhotoErr(""); setPhotoSent(true);
        try {
            await stationFetch(`${EP.manual}/${job.current.id}/capture?include_image=true`, { method: "POST" });
        } catch (e) {
            setPhotoSent(false);
            setPhotoErr(e.detail || e.message);
        }
    };

    const handleClose = () => { cancelJob(); onClose(); };

    // ── lifecycle ────────────────────────────────────────────────────────────
    useEffect(() => { // fresh state every time the modal opens
        if (!mode) return;
        cancelJob();
        setPhase("setup"); setView(null); setResult(null); setError(""); setFile(null);
        setJobId(null); setPhotoSent(false); setPhotoErr(""); setOnScale(false);
    }, [mode]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => { setCamUrl(localStorage.getItem(`vx_cam_${camera}`) || ""); }, [camera]);

    useEffect(() => () => cancelJob(), []); // eslint-disable-line react-hooks/exhaustive-deps

    // ── render helpers ───────────────────────────────────────────────────────
    const cameraPicker = (
        <>
            <Seg value={camera} onChange={setCamera} options={CAMERAS} />
            {camera !== "webcam" && (
                <div className="mb-2">
                    <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Camera address</label>
                    <input
                        value={camUrl} onChange={(e) => setCamUrl(e.target.value)}
                        placeholder="Leave empty to use the station's default"
                        autoCapitalize="off" autoComplete="off"
                        className="w-full h-9 px-3 rounded-lg border border-gray-300 text-sm"
                    />
                </div>
            )}
        </>
    );

    const scaleCheck = (
        <label className="flex items-center gap-2 text-xs text-gray-600 my-2">
            <input type="checkbox" checked={onScale} onChange={(e) => setOnScale(e.target.checked)} />
            Person is standing on the scale (1 inch is subtracted)
        </label>
    );

    const renderSetup = () => {
        if (mode === "weight") {
            return (
                <>
                    <p className="text-sm text-gray-600">Press Start, then step on the scale and stay on it. The first time, a Smart Life QR code may appear.</p>
                    <button className={btnGo} onClick={start}>Start</button>
                </>
            );
        }
        if (mode === "combined") {
            return (
                <>
                    <Seg value={capture} onChange={setCapture} options={[["manual", "📸 Manual photo"], ["auto", "⚡ Automatic"]]} />
                    {cameraPicker}
                    <p className="text-xs text-gray-500 mt-1">
                        {capture === "manual"
                            ? "A live camera picture appears here. The person stands on the scale; tap Take photo when they stand straight. You do not have to wait for the weight."
                            : "The camera window opens on the station PC (green box, countdown). Use this when you are standing at the station."}
                        {" "}The 1 inch scale platform is subtracted from the height.
                    </p>
                    <button className={btnGo} onClick={start}>Start (scale + camera)</button>
                </>
            );
        }
        return (
            <>
                <Seg value={hSource} onChange={setHSource} options={[["auto", "⚡ Automatic"], ["photo", "📷 Photo upload"]]} />
                {hSource === "auto" ? (
                    <>
                        {cameraPicker}
                        <p className="text-xs text-gray-500">The camera window opens on the station PC (green box, countdown).</p>
                    </>
                ) : (
                    <input type="file" accept="image/*" capture="environment" onChange={(e) => setFile(e.target.files?.[0] || null)} className="text-sm" />
                )}
                {scaleCheck}
                <button className={btnGo} onClick={start} disabled={hSource === "photo" && !file}>
                    {hSource === "auto" ? "Open camera & capture" : "Measure height"}
                </button>
            </>
        );
    };

    const renderRunning = () => {
        const status = view?.status;
        const w = view?.partial?.weight_kg;
        const step = STEP_OF[status] ?? 0;
        const canShoot = mode === "combined" && capture === "manual" && jobId
            && ["waiting_weight", "awaiting_photo"].includes(status) && !photoSent; // server refuses a picture while the scale is still connecting
        let text = MSG[status] || view?.message || "Starting…";
        if (status === "waiting_weight" && mode === "combined" && capture === "manual") {
            text = photoSent
                ? "Photo taken. Stay on the scale, waiting for the weight…"
                : "Step on the scale. Stand straight, look at the camera and tap Take photo";
        }

        return (
            <>
                {status === "qr_required" && (
                    <div className="text-center mb-3">
                        {view?.scale?.qr_image
                            ? <img src={view.scale.qr_image} width={220} alt="Smart Life QR" className="mx-auto" />
                            : <Spin text="Generating QR code…" />}
                        <p className="text-xs text-gray-500 mt-1">Scan with the Smart Life app, then tap Confirm login</p>
                    </div>
                )}

                {mode === "combined" && (
                    <div className="flex gap-1 mb-2">
                        {["1 SCALE", "2 WEIGHT", "3 HEIGHT"].map((t, i) => (
                            <span key={t} className={`flex-1 text-center text-[10px] font-bold py-1 rounded-md ${i < step ? "bg-emerald-100 text-emerald-700" : i === step ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-400"}`}>{t}</span>
                        ))}
                    </div>
                )}

                {w != null && <div className="text-lg font-bold text-blue-700 mb-1">⚖️ {num1(w)} kg</div>}

                {mode === "combined" && capture === "manual" && jobId && (
                    <div className="mb-2">
                        <img
                            key={jobId} src={previewUrl(camera, camera === "webcam" ? "" : camUrl.trim())} alt="Camera preview"
                            className="w-full rounded-xl bg-black min-h-[120px]"
                        />
                        <button className={btnGo} onClick={takePhoto} disabled={!canShoot}>
                            {photoSent ? "✔ Photo sent" : "📸 Take photo"}
                        </button>
                        {photoErr && <div className="mt-2 text-xs text-amber-700 bg-amber-50 rounded-lg p-2">{photoErr}</div>}
                    </div>
                )}

                <Spin text={text} />
                <button className={btnGhost} onClick={handleClose}>Cancel</button>
            </>
        );
    };

    const renderResult = () => {
        const r = result || {};
        const img = resultImage(r);
        const w = r.weight_kg ?? view?.partial?.weight_kg;
        const ok = phase === "done";
        return (
            <>
                {mode !== "height" && w != null && <div className="text-lg font-bold text-emerald-700">⚖️ {num1(w)} kg</div>}
                {mode !== "weight" && ok && (
                    <div className="text-lg font-bold text-emerald-700">
                        📏 {r.height_feet}'{r.height_inches}" <span className="text-sm font-medium text-gray-500">({num1(r.height_cm)} cm)</span>
                    </div>
                )}
                {mode !== "weight" && ok && r.bmi != null && <div className="text-sm text-gray-600">BMI {num1(r.bmi)}</div>}
                {!ok && (
                    <div className="text-sm text-amber-800 bg-amber-50 rounded-lg p-3 mt-2">
                        <b>Height could not be read.</b>{mode === "combined" && " The weight was kept."}
                        <div>{(r.reject_reasons || []).join(" ")}</div>
                    </div>
                )}
                <p className="text-xs text-gray-400 mt-2">Added to the form. It is saved only when you press Save Vitals.</p>
                {img && <img src={img} alt="Annotated measurement" className="w-full rounded-xl mt-2" />}
                <button className={btnGo} onClick={handleClose}>Done</button>
                <button className={btnGhost} onClick={() => setPhase("setup")}>{ok ? "Retake" : "Try again"}</button>
            </>
        );
    };

    const renderFailed = () => (
        <>
            <div className="text-sm text-red-700 bg-red-50 rounded-lg p-3">{error}</div>
            <button className={btnGo} onClick={() => setPhase("setup")}>Try again</button>
            <button className={btnGhost} onClick={handleClose}>Close</button>
        </>
    );

    return (
        <Modal
            open={!!mode}
            onCancel={handleClose}
            footer={null}
            centered
            maskClosable={false}
            destroyOnHidden
            title={<span className="font-semibold">{TITLES[mode] || ""}</span>}
            width={440}
        >
            {mode && (
                <div>
                    {phase === "setup" && renderSetup()}
                    {phase === "running" && renderRunning()}
                    {(phase === "done" || phase === "partial") && renderResult()}
                    {phase === "failed" && renderFailed()}
                    <div className="text-[10px] text-gray-400 mt-3">Station: {STATION_URL}</div>
                </div>
            )}
        </Modal>
    );
};

export default StationModal;
