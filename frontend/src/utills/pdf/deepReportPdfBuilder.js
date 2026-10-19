import moment from "moment";
import { PdfDocument, COLORS } from "./PdfDocument";
import { loadImageAsDataURL } from "./pdfImageLoader";
import { formatMoney } from "../formatters";
import MMCLogo from "../../assets/MMC logo.png";

// jaani — ye placeholder he, apne actual hospital ke address/phone/email se update kar lena
export const HOSPITAL_INFO = {
  name: "Memon Medical Complex",
  tagline: "Hospitrax — Hospital Management System",
  addressLine: "Karachi, Pakistan",
  phone: "0311-5533152",
  email: "",
};

// ✅ har column ka `summaryRender` bhi define he — ye totals row (backend se aayi summary) draw karta he
const TABLE_COLUMNS = [
  {
    key: "DATES",
    label: "Date",
    width: 20,
    render: (r) => moment(r.DATES).format("DD-MMM-YY"),
    summaryRender: () => "TOTAL",
  },
  {
    key: "TOTAL_PATIENT",
    label: "Patients",
    width: 18,
    align: "right",
    summaryRender: (s) => String(s.patients ?? 0),
  },
  {
    key: "GROSS",
    label: "Gross",
    width: 24,
    align: "right",
    render: (r) => formatMoney(r.GROSS),
    summaryRender: (s) => formatMoney(s.gross),
  },
  // {
  //   key: "DISCOUNT",
  //   label: "Discount",
  //   width: 18,
  //   align: "right",
  //   render: (r) => formatMoney(r.DISCOUNT),
  //   summaryRender: (s) => formatMoney(s.discount),
  // },
  {
    key: "TOTAL_CHARGES",
    label: "Less BMJ",
    width: 22,
    align: "right",
    render: (r) => formatMoney(r.TOTAL_CHARGES),
    summaryRender: (s) => formatMoney(s.charges),
  },
  {
    key: "NETAMTAFTERCHARGES",
    label: "Net (After Charges)",
    width: 30,
    align: "right",
    render: (r) => formatMoney(r.NETAMTAFTERCHARGES),
    summaryRender: (s) => formatMoney(s.netAfterCharges),
  },
  {
    key: "WITHHOLDINGTAX",
    label: "WHT (15%)",
    width: 18,
    align: "right",
    render: (r) => formatMoney(r.WITHHOLDINGTAX),
    summaryRender: (s) => formatMoney(s.tax), // ⚠️ summarizeRows mein s.tax banana hoga
  },
  {
    key: "CONSULTANTSHARE",
    label: "Doctor Share",
    width: 22,
    align: "right",
    render: (r) => `${r.CONSULTANTSHARE ?? 0}%`,
    summaryRender: (s) => `${s.doctorSharePercent ?? 0}%`,
  },
  {
    key: "NETPAYABLE",
    label: "Doctor Earning",
    width: 32,
    align: "right",
    render: (r) => formatMoney(r.NETPAYABLE),
    summaryRender: (s) => formatMoney(s.doctorEarning),
  },
];

export const buildDeepReportPdf = async ({
  doctorInfo,
  opdData = [],
  ipdData = [],
  opdSummary = {},
  ipdSummary = {},
  overallSummary = {},
  fromDate,
  toDate,
}) => {

  let logoDataUrl = null;
  try {
    logoDataUrl = await loadImageAsDataURL(MMCLogo);
  } catch (err) {
    logoDataUrl = null; // logo fail ho to bhi report generate ho jaye
  }

  const pdf = new PdfDocument();
  const periodLabel = `${moment(fromDate).format("DD MMM YYYY")} — ${moment(toDate).format("DD MMM YYYY")}`;

  const drawHeader = (doc) => {
    doc.addBrandHeader({
      logoDataUrl,
      titleLines: [
        {
          text: "Consultant Deep Sharing Report",
          bold: true,
          size: 12,
          color: COLORS.primaryDark,
        },
        { text: HOSPITAL_INFO.tagline, size: 7.5, color: COLORS.slate500 },
      ],
      orgLines: [
        { text: HOSPITAL_INFO.name, bold: true, size: 10 },
        { text: HOSPITAL_INFO.addressLine, size: 7.5 },
        {
          text: [HOSPITAL_INFO.phone, HOSPITAL_INFO.email]
            .filter(Boolean)
            .join("  |  "),
          size: 7.5,
        },
      ],
    });
  };

  drawHeader(pdf);
  pdf.setRepeatingHeader(drawHeader);

  pdf.addInfoGrid([
    { label: "Consultant", value: doctorInfo?.name },
    { label: "Degrees", value: doctorInfo?.degrees },
    { label: "Faculty", value: doctorInfo?.faculty },
    { label: "Period", value: periodLabel },
    { label: "Generated On", value: moment().format("DD MMM YYYY, hh:mm A") },
  ]);

  // ---- ✅ naya: OPD Records se pehle Total Summary (OPD+IPD combined) ----
  pdf.addInlineHeading("Total Summary");
  pdf.addStatCards([
    { label: "Total Patients", value: overallSummary.patients ?? 0 },
    { label: "Total Gross", value: formatMoney(overallSummary.gross) },
    // { label: "Total Discount", value: formatMoney(overallSummary.discount) },
    { label: "Less BMJ", value: formatMoney(overallSummary.charges) },
    {
      label: "Net (After Charges)",
      value: formatMoney(overallSummary.netAfterCharges),
    },
    { label: "WHT (15%)", value: formatMoney(overallSummary.tax) },
    {
      label: "Doctor Earning",
      value: formatMoney(overallSummary.doctorEarning),
      valueColor: COLORS.green,
    },
  ]);

  pdf.addSectionHeading(`OPD Records`, { gapAfter: 0 });
  if (opdData.length) {
    pdf.addTable({
      columns: TABLE_COLUMNS,
      rows: opdData,
      bottomGap: 0,
      bottomBorder: false,
    });
    pdf.addSummaryRow(TABLE_COLUMNS, opdSummary, { fill: COLORS.slate300 });
  } else {
    pdf.addSpacer(6);
  }

  // ---- IPD: same treatment ----
  pdf.addSectionHeading(`IPD Records`, { gapAfter: 0 });
  if (ipdData.length) {
    pdf.addTable({
      columns: TABLE_COLUMNS,
      rows: ipdData,
      bottomGap: 0,
      bottomBorder: false,
    });
    pdf.addSummaryRow(TABLE_COLUMNS, ipdSummary, { fill: COLORS.slate300 });
  } else {
    pdf.addSpacer(6);
  }

  pdf.finalizeFooters(`${HOSPITAL_INFO.name} — Hospitrax`);

  const fileName = `${doctorInfo?.name || "Doctor"}_Deep_Report_${moment(fromDate).format("YYYY-MM-DD")}_to_${moment(toDate).format("YYYY-MM-DD")}`;
  pdf.save(fileName);
};
