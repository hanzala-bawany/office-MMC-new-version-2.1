import { Table, Tag } from "antd";
import moment from "moment";
import { formatMoney } from "../../utills/formatters";

const buildColumns = () => [
  {
    title: "Date",
    dataIndex: "DATES",
    key: "date",
    width: 110,
    render: (val) => moment(val).format("DD-MMM-YYYY"),
  },
  {
    title: "Type",
    dataIndex: "RECEIPTTYPE",
    key: "type",
    width: 80,
    render: (val) => <Tag color={val === "OPD" ? "blue" : "purple"}>{val}</Tag>,
  },
  { title: "Patients", dataIndex: "TOTAL_PATIENT", key: "patients", align: "right", width: 90 },
  { title: "Gross", dataIndex: "GROSS", key: "gross", align: "right", render: formatMoney },
  { title: "Charges", dataIndex: "TOTAL_CHARGES", key: "charges", align: "right", render: formatMoney },
  { title: "Net (After Charges)", dataIndex: "NETAMTAFTERCHARGES", key: "net", align: "right", render: formatMoney },
  {
    title: "Doctor Share",
    dataIndex: "CONSULTANTSHARE",
    key: "share",
    align: "right",
    width: 100,
    render: (val) => `${val ?? 0}%`,
  },
  {
    title: "Doctor Earning",
    dataIndex: "COUNSULTANTSHAREAMT",
    key: "earning",
    align: "right",
    render: (val) => <span className="font-semibold text-slate-800">{formatMoney(val)}</span>,
  },
];

// ✅ OPD phle (apni heading ke sath), phir IPD (apni heading ke sath)
const DeepReportTable = ({ opdData = [], ipdData = [] }) => {
  const columns = buildColumns();

  const renderGroup = (label, rows, tone) => (
    <div className="mb-6 last:mb-0">
      <div className={`px-3 py-2 rounded-t-lg text-sm font-bold text-white ${tone === "opd" ? "bg-blue-600" : "bg-purple-600"}`}>
        {label} ({rows.length})
      </div>
      <Table
        columns={columns}
        dataSource={rows}
        rowKey={(row, idx) => `${row.RECEIPTTYPE}-${row.DATES}-${idx}`}
        pagination={false}
        size="small"
        scroll={{ x: 800 }}
      />
    </div>
  );

  return (
    <div className="bg-white rounded-xl shadow p-4 sm:p-6 mt-6">
      <h3 className="text-lg font-bold text-gray-700 mb-4">Deep Report — Date Wise OPD / IPD</h3>
      {renderGroup("OPD", opdData, "opd")}
      {renderGroup("IPD", ipdData, "ipd")}
    </div>
  );
};

export default DeepReportTable;