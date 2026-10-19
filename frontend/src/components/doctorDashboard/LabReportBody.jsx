import { memo } from "react";

// "\r\n", trailing spaces, null -> clean string
const clean = (v) => (v ?? "").toString().replace(/\r/g, "").trim();
// "R.B.C...." -> "R.B.C", "Protein.." -> "Protein"
const cleanName = (v) => clean(v).replace(/\.+$/, "");

const ENABLE_FLAGS = false;

const formatTime = (t) => {
  const s = clean(t);
  return s.length === 4 ? `${s.slice(0, 2)}:${s.slice(2)}` : "";
};

//  getFlag result aur range leta hai aur check karta hai ke result range ke andar hai ya bahar:

// L: result range ke minimum se kam
// H: result range ke maximum se zyada
// A (!): range Nil thi aur result Nil nahi (jaise Protein +)
// null: koi flag nahi, ya check nahi ho saka

const getFlag = (res, nv) => {

  const r = clean(res);
  const lines = clean(nv)
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
  if (!r || lines.length !== 1) return null; 
  const firstLine = lines[0];

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
  H: {
    cls: "bg-red-100 text-red-700",
    text: "H",
    title: "Above reference range",
  },
  L: {
    cls: "bg-blue-100 text-blue-700",
    text: "L",
    title: "Below reference range",
  },
  A: {
    cls: "bg-red-100 text-red-700",
    text: "!",
    title: "Abnormal (expected Nil)",
  },
};

const COLS = "grid-cols-[minmax(180px,1.6fr)_minmax(90px,1fr)_minmax(70px,.7fr)_minmax(180px,1.7fr)]";

const TestRow = ({ test }) => {
  const name = cleanName(test?.TESTNAME);
  const res = clean(test?.RES);
  const units = clean(test?.UNITS);
  const range = clean(test?.NV);

  // RES null => ye result nahi, sub-heading he (LEUCOCYTES, Chemical Examination ...)
  if (!res) {
    return <div className="px-3 py-1.5  text-xs wrap-break-word ">{name}</div>;
  }

  const flag = ENABLE_FLAGS ? getFlag(res, range) : null;
  const f = flag ? FLAG_STYLE[flag] : null;

  return (
    <div
      className={`grid ${COLS} gap-x-3 px-3 py-2 border-b border-gray-100 last:border-b-0 hover:bg-blue-50/40 transition-colors items-start`}
    >
      {/* Test name */}
      <div className="text-sm text-gray-700 wrap-break-word">{name}</div>

      {/* Result  */}
      <div
        className={`text-sm font-semibold ${f ? "text-red-600" : "text-gray-900"}`}
      >
        {res}
        {f && (
          <span
            title={f.title}
            className={`ml-1.5 inline-flex items-center justify-center min-w-4.5 h-4.5 px-1 rounded text-[10px] font-bold align-middle ${f.cls}`}
          >
            {f.text}
          </span>
        )}
      </div>

      {/* Units  */}
      <div className="text-sm text-gray-500">{units}</div>

      {/* Normal range: */}
      <div className="text-xs text-gray-400 whitespace-pre-line leading-snug">
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
    return (
      <p className="text-sm text-gray-400 text-center py-6">
        No results in this receipt
      </p>
    );
  }

  const hasFlags =
    ENABLE_FLAGS &&
    reports.some((rep) => rep?.TESTS?.some((t) => getFlag(t?.RES, t?.NV)));

  return (
    <div className="flex flex-col gap-4">
      {reports.map((rep, i) => (
        <section
          key={`${rep?.LAB_NO}-${rep?.REPORTHEAD}-${i}`}
          className="rounded-xl border border-gray-200 overflow-hidden bg-white"
        >
          {/* Section header */}
          <div className="flex items-center justify-between gap-2 px-3 py-2 bg-sky-100">
            <h3 className="m-0 text-sm font-semibold">
              {clean(rep?.REPORTHEAD)}
            </h3>
            <span className="text-[11px] text-gray-500 whitespace-nowrap">
              {clean(rep?.REPORT_DATE)} {formatTime(rep?.R_TIME)}
            </span>
          </div>

          {/* Scroll area */}
          <div className="overflow-x-auto">
            <div className="min-w-160">
              {/* Column header */}
              <div
                className={`grid ${COLS} gap-x-3 px-3 py-2 bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500`}
              >
                <span>Test Name</span>
                <span>Result</span>
                <span>Units</span>
                <span>Normal Range</span>
              </div>

              {/* Rows */}
              {rep?.TESTS?.map((t, idx) => (
                <TestRow key={`${t?.S_NO}-${idx}`} test={t} />
              ))}
            </div>
          </div>
        </section>
      ))}

      {hasFlags && (
        <p className="m-0 text-[11px] text-gray-400">
          H / L / ! flags are calculated from the printed reference range.
          Verify against the lab's original report before clinical decisions.
        </p>
      )}
    </div>
  );
};

export default memo(LabReportBody);
