import { memo } from "react";

/* =========================================================
   Helpers
   ========================================================= */

// "\r\n", trailing spaces, null -> clean string
const clean = (v) => (v ?? "").toString().replace(/\r/g, "").trim();

// "R.B.C...." -> "R.B.C", "Protein.." -> "Protein"
const cleanName = (v) => clean(v).replace(/\.+$/, "");

// "0742" -> "07:42"
const formatTime = (t) => {
  const s = clean(t);
  return s.length === 4 ? `${s.slice(0, 2)}:${s.slice(2)}` : "";
};

/**
 * Auto flag, sirf simple printed ranges pe:
 *   "3.3 - 4.6"  -> L / H
 *   "<1.2"       -> H
 *   ">60 ..."    -> L
 *   "Nil"        -> A (koi bhi non-nil result)
 * Gender/age wali multi-line ranges ki sirf pehli line dekhi jati he; agar wo
 * in patterns se match na kare to flag NAHI lagta (galat flag se behtar he koi flag na ho).
 */
const getFlag = (res, nv) => {
  const r = clean(res);
  const firstLine = clean(nv).split("\n")[0].trim();
  if (!r || !firstLine) return null;

  // qualitative: expected Nil
  if (/^nil$/i.test(firstLine)) return /^nil$/i.test(r) ? null : "A";

  if (!/^\d+(\.\d+)?$/.test(r)) return null;
  const val = parseFloat(r);

  let m = firstLine.match(/^(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)$/);
  if (m) return val < +m[1] ? "L" : val > +m[2] ? "H" : null;

  m = firstLine.match(/^<\s*=?\s*(\d+(?:\.\d+)?)/);
  if (m) return val > +m[1] ? "H" : null;

  m = firstLine.match(/^>\s*=?\s*(\d+(?:\.\d+)?)/);
  if (m) return val < +m[1] ? "L" : null;

  return null;
};

const FLAG_STYLE = {
  H: { cls: "bg-red-100 text-red-700", text: "H", title: "Above reference range" },
  L: { cls: "bg-blue-100 text-blue-700", text: "L", title: "Below reference range" },
  A: { cls: "bg-red-100 text-red-700", text: "!", title: "Abnormal (expected Nil)" },
};

// Desktop grid template: Test | Result | Units | Normal Range
// (full literal string rakhi he taake Tailwind scan kar sake)
const COLS = "sm:grid-cols-[1.6fr_1fr_.7fr_1.7fr]";

/* =========================================================
   Row
   ========================================================= */

const TestRow = ({ test }) => {
  const name = cleanName(test?.TESTNAME);
  const res = clean(test?.RES);
  const units = clean(test?.UNITS);
  const range = clean(test?.NV);

  // RES null => ye result nahi, sub-heading he (LEUCOCYTES, Chemical Examination ...)
  if (!res) {
    return (
      <div className="px-3 py-1.5  text-xs wrap-break-word ">
        {name}
      </div>
    );
  }

  const flag = getFlag(res, range);
  const f = flag ? FLAG_STYLE[flag] : null;

  return (
    <div
      className={`grid grid-cols-[1fr_auto] gap-x-3 gap-y-0.5 px-3 py-2 border-b border-gray-100 last:border-b-0 hover:bg-blue-50/40 transition-colors ${COLS} sm:items-start`}
    >
      {/* Test name */}
      <div className="text-sm text-gray-700 wrap-break-word">{name}</div>

      {/* Result (+ units inline on mobile) */}
      <div
        className={`text-sm text-right sm:text-left font-semibold ${f ? "text-red-600" : "text-gray-900"
          }`}
      >
        {res}
        {units && <span className="sm:hidden font-normal text-gray-400 text-xs ml-1">{units}</span>}
        {f && (
          <span
            title={f.title}
            className={`ml-1.5 inline-flex items-center justify-center min-w-4.5 h-4.5 px-1 rounded text-[10px] font-bold align-middle ${f.cls}`}
          >
            {f.text}
          </span>
        )}
      </div>

      {/* Units (desktop only) */}
      <div className="hidden sm:block text-sm text-gray-500">{units}</div>

      {/* Normal range: mobile pe full width neeche, desktop pe 4th column */}
      <div className="col-span-2 sm:col-span-1 text-[11px] sm:text-xs text-gray-400 whitespace-pre-line leading-snug">
        {range && <span className="sm:hidden font-medium">Ref: </span>}
        {range}
      </div>
    </div>
  );
};

/* =========================================================
   Body  (ye component ReportsLayout ke andar child banta he)
   ========================================================= */

const LabReportBody = ({ reports = [] }) => {
  if (!reports.length) {
    return <p className="text-sm text-gray-400 text-center py-6">No results in this receipt</p>;
  }

  const hasFlags = reports.some((rep) =>
    rep?.TESTS?.some((t) => getFlag(t?.RES, t?.NV)),
  );

  return (
    <div className="flex flex-col gap-4">
      {reports.map((rep, i) => (
        <section
          key={`${rep?.LAB_NO}-${rep?.REPORTHEAD}-${i}`}
          className="rounded-xl border border-gray-200 overflow-hidden bg-white"
        >
          {/* Section header: dashboard wala same gradient */}
          {/* <div className="flex items-center justify-between gap-2 px-3 py-2 bg-linear-to-r from-[#0052cc] to-[#00b0ff]"> */}
          <div className="flex items-center justify-between gap-2 px-3 py-2 bg-sky-100">
            <h3 className="m-0 text-sm font-semibold ">{clean(rep?.REPORTHEAD)}</h3>
            <span className="text-[11px] text-blue-100 whitespace-nowrap">
              {clean(rep?.REPORT_DATE)} {formatTime(rep?.R_TIME)}
            </span>
          </div>

          {/* Column header (desktop only) */}
          <div
            className={`hidden sm:grid ${COLS} gap-x-3 px-3 py-2 bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500`}
          >
            <span>Test Name</span>
            <span>Result</span>
            <span>Units</span>
            <span>Normal Range</span>
          </div>

          {/* Rows */}
          <div>
            {rep?.TESTS?.map((t, idx) => (
              <TestRow key={`${t?.S_NO}-${idx}`} test={t} />
            ))}
          </div>
        </section>
      ))}

      {hasFlags && (
        <p className="m-0 text-[11px] text-gray-400">
          H / L / ! flags are calculated from the printed reference range. Verify against the lab's
          original report before clinical decisions.
        </p>
      )}
    </div>
  );
};

export default memo(LabReportBody);