import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Card, Input, Empty, Skeleton, Tag, Button } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { FaMicroscope, FaChevronDown } from "react-icons/fa";
import { toast } from "react-toastify";
import { base_URL } from "../../utills/baseUrl";
import ReportsLayout from "../../Layouts/ReportsLayout";
import LabReportBody from "./LabReportBody";

// TODO: backend endpoint ka asli path yahan daalo.
// Zaroori: ye endpoint SIRF is patient (MRNO) ki reports return kare, sab patients ki nahi.
const LAB_REPORTS_URL = `${base_URL}/api/opd/patient-Lab-Reports`;
const PAGE_SIZE = 10;

const card =
  "rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 themeBoxShadow";

const LabReportsSection = ({ mrNo }) => {

  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState(null);
  const [visible, setVisible] = useState(PAGE_SIZE);

  /* ---------- fetch (patient change hone pe) ---------- */
  useEffect(() => {
    setQuery("");
    setVisible(PAGE_SIZE);

    if (!mrNo) {
      setReceipts([]);
      setOpenId(null);
      return;
    }

    let cancelled = false; // purani request ka response naye patient pe na gire

    (async () => {
      try {
        setLoading(true);
        const res = await axios.get(LAB_REPORTS_URL, { params: { mrNum: mrNo } });
        if (cancelled) return;
        const list = res?.data?.data || [];
        setReceipts(list);
        setOpenId(list[0]?.LAB_RECEIPTNO ?? null); // latest receipt khula rahe
      } catch (err) {
        if (!cancelled) toast.error(err?.message || "Failed to load lab reports");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [mrNo]);

  /* ---------- search ---------- */
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return receipts;
    return receipts.filter(
      (r) =>
        r.LAB_RECEIPTNO?.toLowerCase().includes(q) ||
        r.LAB_DATE?.toLowerCase().includes(q) ||
        r.ORDERED_BY_NAME?.toLowerCase().includes(q) ||
        r.REPORTS?.some((rep) => rep.REPORTHEAD?.toLowerCase().includes(q)),
    );
  }, [receipts, query]);

  const shown = filtered.slice(0, visible);

  console.log(receipts , "receipts ........");
  

  return (
    <Card
      title={
        <div className="flex items-center justify-between gap-3 w-full">
          <div className="flex items-center gap-2 text-md sm:text-lg font-bold text-slate-700">
            <FaMicroscope className="text-purple-600" />
            Lab Reports
          </div>

          {receipts.length > 0 && (
            <span className="text-xs sm:text-sm text-black">
              Total <span className="font-semibold text-blue-600">{receipts.length}</span>
            </span>
          )}
        </div>
      }
      className={`${card} mt-6`}
      styles={{
        header: {
          borderBottom: "2px solid #E5E7EB",
          padding: "15px 16px",
          background: "#F9FAFB",
        },
        body: { padding: "15px" },
      }}
    >
      {/* No patient */}
      {!mrNo && (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="Call a patient to see their lab reports"
        />
      )}

      {/* Loading */}
      {mrNo && loading && <Skeleton active paragraph={{ rows: 4 }} />}

      {/* Empty result */}
      {mrNo && !loading && receipts.length === 0 && (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No lab reports for this patient" />
      )}

      {/* List */}
      {mrNo && !loading && receipts.length > 0 && (
        <>
          <Input
            allowClear
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setVisible(PAGE_SIZE);
            }}
            prefix={<SearchOutlined className="text-gray-400" />}
            placeholder="Search test, date, receipt no or doctor"
            className="mb-4 sm:max-w-sm"
          />

          {filtered.length === 0 && (
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No matching reports" />
          )}

          <div className="flex flex-col gap-3">
            {shown.map((r) => {
              const isOpen = openId === r.LAB_RECEIPTNO;
              const heads = [...new Set((r.REPORTS || []).map((x) => x.REPORTHEAD?.trim()))];

              return (
                <div
                  key={r.LAB_RECEIPTNO}
                  className={`rounded-xl border overflow-hidden transition-colors ${isOpen ? "border-blue-300" : "border-gray-200"
                    }`}
                >
                  {/* Receipt header (accordion toggle) */}
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => setOpenId(isOpen ? null : r.LAB_RECEIPTNO)}
                    className="w-full text-left flex items-start justify-between gap-3 p-3 sm:p-4 bg-white hover:bg-blue-50/50 cursor-pointer focus-visible:outline-2 focus-visible:outline-blue-500"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
                        <span className="font-semibold text-slate-700 text-sm sm:text-base">
                          {r.LAB_DATE}
                        </span>
                        <span className="text-xs text-gray-500">Receipt # {r.LAB_RECEIPTNO}</span>
                        <span className="text-xs text-gray-500">Ordered by {r.ORDERED_BY_NAME}</span>
                      </div>

                      <div className="mt-2 flex flex-wrap gap-1">
                        {heads.map((h) => (
                          <Tag key={h} color="blue" className="!m-0 !text-[11px] !whitespace-normal">
                            {h}
                          </Tag>
                        ))}
                      </div>
                    </div>

                    <FaChevronDown
                      className={`shrink-0 mt-1 text-gray-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""
                        }`}
                    />
                  </button>

                  {/* Body: sirf open hone pe render hota he (performance) */}
                  {isOpen && (
                    <div className="border-t border-gray-200 bg-gray-50 p-2 sm:p-4 flex justify-center overflow-x-auto">
                      <ReportsLayout type="labReport" Title="Lab Report" reportData={r}>
                        <LabReportBody reports={r.REPORTS} />
                      </ReportsLayout>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {filtered.length > visible && (
            <div className="mt-4 text-center">
              <Button onClick={() => setVisible((v) => v + PAGE_SIZE)}>
                Show more ({filtered.length - visible} remaining)
              </Button>
            </div>
          )}
        </>
      )}
    </Card>
  );
};

export default LabReportsSection;