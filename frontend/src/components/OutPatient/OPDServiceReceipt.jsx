import React, { forwardRef } from "react";
import mmcLogo from "../../assets/MMC logo.png";
import hussainiLogo from "../../assets/husaini.png";
import moment from "moment";

// ============= STATIC DATA -- bilkul waisa hi jaisa API response me aata hai =============
const receiptData = [
  {
    TOKENNO: 0,
    VDATE: "2026-08-24T19:00:00.000Z",
    CATAGORYTITLE: "Laboratory",
    REPORTTYPE: null,
    CONSULTANTNAME: null,
    MEMBERID: null,
    GENDER: "male",
    PATIENTNAME: "Mr.tester 2",
    AGE: "12 Year",
    NETAMOUNT: 11000,
    CONTACTNO: "12345678930",
    PATIENTTYPE: "ZAKAT",
    REFERENCENAME: "Abdul Jabbar Dr. (Anaestehsia)",
    REMARKS: "partiaol payment patinet",
    GROSSAMOUNT: 11000,
    DISCOUNT: 0,
    NETAMOUNT_1: 11000,
    PARTIALAMOUNT: 2000,
    NETBALANCE: 0,
    ISPARTIAL: 1,
    CREATEDBY: "farzana",
    CREATEDTIME: "2026-08-25T05:07:43.000Z",
    ELECTRICITYCHARGES: 0,
    LABORATORYCONSULTANTNAME: "Abdul Sattar Rajput",
    NOOFPRINT: 0,
  },
];

const testData = [
  { TESTNAME: "030 Regenerative/Repair (per MTA)", AMOUNT: 5000 },
  { TESTNAME: "031 RCT- Anterior", AMOUNT: 6000 },
];

// Runtime/context data (login se, DB query se nahi)
const printedBy = "s.m.nawaz";
const terminalId = "MMC-136";
const voucherNo = "OP-03001333";

// ============= COMPANY INFO (static filhaal -- baad me get_company_info procedure se) =============
const companyInfo = {
  companyName: "MEMON MEDICAL COMPLEX",
  urCompanyName: "BANTVA TOWN MEMON WELFARE COMMITTEE",
  address: "1503-04/3, Siddiqabad, F.B. Area, Karachi, 79950",
  contactHead: "36339444-555, 36376298",
};


const ReceiptCopy = ({ receipt, tests, variant, copyLabel }) => {

  const visitDateTime = moment(receipt?.VDATE).format("DD-MMM-YYYY hh:mmA");
  const consultantName =
    receipt?.CATAGORYTITLE === "Laboratory"
      ? receipt.LABORATORYCONSULTANTNAME
      : receipt.CONSULTANTNAME;

  if (variant === "compact") {
    return (
      <div
        className="border-2 border-dashed border-black rounded pl-2 pr-2 py-2 h-full flex flex-col"
        style={{ width: "150px", fontFamily: "Arial, sans-serif" }}
      >
        <div className="bg-gray-200 border border-black text-center py-1 mb-2">
          <span className="font-bold text-[11px]">
            {receipt.CATAGORYTITLE === "Laboratory"
              ? "Laboratory Services"
              : "Medical Services (PROC)"}
          </span>
        </div>

        <div className="text-[11px] mb-2">
          <div className="font-semibold">Rcpt #</div>
          <div>{receipt}</div>
        </div>

        <div className="text-[10px] mb-2">{visitDateTime}</div>

        <div className="text-[11px] mb-2">
          <div className="font-semibold">Patient</div>
          <div>{receipt.PATIENTNAME}</div>
        </div>

        <div className="text-[11px] font-semibold mb-2">
          Consultant: {consultantName || "-"}
        </div>

        <div className="text-[10px] flex-1">
          {tests.map((t, i) => (
            <div key={i} className="flex justify-between mb-1">
              <span className="pr-1">{t.TESTNAME}</span>
              <span>{t.AMOUNT.toFixed(2)}</span>
            </div>
          ))}
        </div>

        <div className="border-t border-black pt-1 text-[11px]">
          <div className="flex justify-between">
            <span>Gross :</span>
            <span>{receipt.GROSSAMOUNT.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-semibold">
            <span>Rec Amt :</span>
            <span>{receipt.NETAMOUNT.toFixed(2)}</span>
          </div>
        </div>

        <div className="text-[9px] mt-2 leading-tight">
          <div>User:{receipt.CREATEDBY}</div>
          <div>Printed by :{printedBy}</div>
        </div>
      </div>
    );
  }

  // ============= FULL VARIANT (Patient copy / Office copy) =============
  return (
    <div
      className="border-2 border-dashed border-black rounded pl-2 pr-2 py-2 h-full"
      style={{ width: "300px", fontFamily: "Arial, sans-serif" }}
    >
      {/* ============= HEADER: Hussaini logo (left) - Company name (center) - MMC logo (right) ============= */}
      <div className="flex items-start justify-between">
        <img
          src={hussainiLogo}
          alt="Hussaini Blood Bank"
          className="h-10 w-auto shrink-0"
        />

        <div className="text-center flex-1 px-1">
          <h1 className="text-xl font-bold leading-tight">
            {companyInfo.companyName}
          </h1>
          <p className="text-[10px] italic underline">
            Under the Management of
          </p>
          <p className="text-[11px] font-bold">{companyInfo.urCompanyName}</p>
          <p className="text-[9px] leading-tight mt-0.5">
            Tel: {companyInfo.contactHead}
            <br />
            {companyInfo.address}
          </p>
        </div>

        <img
          src={mmcLogo}
          alt="MMC Logo"
          className="h-10 w-auto shrink-0"
        />
      </div>

      <div className="bg-gray-200 border-t border-b border-black text-center py-1 my-1">
        <span className="font-bold text-[13px]">
          {receipt?.CATAGORYTITLE === "Laboratory"
            ? "Laboratory Services"
            : "Medical Services (PROC)"}
        </span>
      </div>

      <table className="w-full text-[11px] border-collapse">
        <tbody>
          <tr>
            <td className="font-semibold w-[55px] py-0.5">Rcpt #</td>
            <td className="py-0.5">{voucherNo}</td>
            <td className="py-0.5 text-right">{visitDateTime}</td>
          </tr>
          <tr>
            <td className="font-semibold py-0.5">Patient</td>
            <td className="py-0.5" colSpan={2}>
              {receipt?.PATIENTNAME}
            </td>
          </tr>
          <tr>
            <td className="font-semibold py-0.5">Gender</td>
            <td className="py-0.5">{receipt?.GENDER}</td>
            <td className="py-0.5 text-right">Age {receipt?.AGE}</td>
          </tr>
          <tr>
            <td className="font-semibold py-0.5">Contact</td>
            <td className="py-0.5" colSpan={2}>
              {receipt?.CONTACTNO}
            </td>
          </tr>
        </tbody>
      </table>

      <div className="text-[11px] font-semibold border-t border-black pt-1 mt-1">
        Consultant: {consultantName || "-"}
      </div>

      {/* Test lines */}
      <div className="text-[11px] mt-1 min-h-[40px]">
        {tests.map((t, i) => (
          <div key={i} className="flex justify-between">
            <span>{t.TESTNAME}</span>
            <span>{t.AMOUNT.toFixed(2)}</span>
          </div>
        ))}
      </div>

      <div className="mt-2 text-[12px]">
        <div className="flex justify-between border-b border-black pb-1">
          <span className="font-semibold">Gross Amount</span>
          <span className="font-semibold">
            {receipt.GROSSAMOUNT.toFixed(2)}
          </span>
        </div>

        {receipt.ISPARTIAL === 1 && (
          <div className="flex justify-between border-b border-black py-1 text-[11px]">
            <span>Partial Received</span>
            <span>{receipt.PARTIALAMOUNT.toFixed(2)}</span>
          </div>
        )}

        <div className="flex justify-between border-b-2 border-black py-1 font-bold">
          <span>Received Amount</span>
          <span>{receipt.NETAMOUNT.toFixed(2)}</span>
        </div>
      </div>

      <div className="flex justify-between text-[9px] mt-2">
        <div>
          <div>Printed On : {moment().format("DD-MM-YYYY hh:mmA")}</div>
          <div>Printed by :{printedBy}</div>
        </div>
        <div className="text-right">
          <div>User:{receipt.CREATEDBY}</div>
          <div>{terminalId}</div>
        </div>
      </div>
    </div>
  );

};

const OPDServiceReceipt = forwardRef(( { receipt : printData } , ref ) => {

  console.log(printData , "printData in opd Service ................");
  
  const receipt = printData?.receiptData?.[0];
  const testData = printData?.testData;

  return (
    <div
      className="bg-white text-black flex gap-3"
      style={{ width: "800px" }}
      ref={ref}
    >
      <ReceiptCopy
        receipt={receipt}
        tests={testData}
        variant="full"
        copyLabel="Patient Copy"
      />
      <ReceiptCopy
        receipt={receipt}
        tests={testData}
        variant="full"
        copyLabel="Office Copy"
      />
      <ReceiptCopy
        receipt={receipt}
        tests={testData}
        variant="compact"
        copyLabel="Consultant Copy"
      />
    </div>
  );
});

OPDServiceReceipt.displayName = "OPDServiceReceipt";

export default OPDServiceReceipt;































// import React, { forwardRef } from "react";
// import mmcLogo from "../../assets/MMC logo.png";
// import moment from "moment";

// // ============= STATIC DATA -- bilkul waisa hi jaisa API response me aata hai =============
// const receiptData = [
//   {
//     TOKENNO: 0,
//     VDATE: "2026-08-24T19:00:00.000Z",
//     CATAGORYTITLE: "Laboratory",
//     REPORTTYPE: null,
//     CONSULTANTNAME: null,
//     MEMBERID: null,
//     GENDER: "male",
//     PATIENTNAME: "Mr.tester 2",
//     AGE: "12 Year",
//     NETAMOUNT: 11000,
//     CONTACTNO: "12345678930",
//     PATIENTTYPE: "ZAKAT",
//     REFERENCENAME: "Abdul Jabbar Dr. (Anaestehsia)",
//     REMARKS: "partiaol payment patinet",
//     GROSSAMOUNT: 11000,
//     DISCOUNT: 0,
//     NETAMOUNT_1: 11000,
//     PARTIALAMOUNT: 2000,
//     NETBALANCE: 0,
//     ISPARTIAL: 1,
//     CREATEDBY: "farzana",
//     CREATEDTIME: "2026-08-25T05:07:43.000Z",
//     ELECTRICITYCHARGES: 0,
//     LABORATORYCONSULTANTNAME: "Abdul Sattar Rajput",
//     NOOFPRINT: 0,
//   },
// ];

// const testData = [
//   { TESTNAME: "030 Regenerative/Repair (per MTA)", AMOUNT: 5000 },
//   { TESTNAME: "031 RCT- Anterior", AMOUNT: 6000 },
// ];

// // Runtime/context data (login se, DB query se nahi)
// const printedBy = "s.m.nawaz";
// const terminalId = "MMC-136";
// const voucherNo = "OP-03001333";

// // ============= COMPANY INFO (static filhaal -- baad me get_company_info procedure se) =============
// const companyInfo = {
//   companyName: "MEMON MEDICAL COMPLEX",
//   urCompanyName: "BANTVA TOWN MEMON WELFARE COMMITTEE",
//   address: "1503-04/3, Siddiqabad, F.B. Area, Karachi, 79950",
//   contactHead: "36339444-555, 36376298",
// };

// /**
//  * Ek copy ka poora content -- 3 baar reuse hoga (Patient / Office / Consultant copy)
//  * variant: "full" -> poora header + table layout (Image 2 ki 1st/2nd copy jaisa)
//  *          "compact" -> chhoti strip layout (Image 2 ki 3rd copy jaisa)
//  */
// const ReceiptCopy = ({ receipt, tests, variant, copyLabel }) => {

//   const visitDateTime = moment(receipt.VDATE).format("DD-MMM-YYYY hh:mmA");
//   const consultantName =
//     receipt.CATAGORYTITLE === "Laboratory"
//       ? receipt.LABORATORYCONSULTANTNAME
//       : receipt.CONSULTANTNAME;

//   if (variant === "compact") {
//     return (
//       <div
//         className="border-l-2 border-dashed border-black pl-2 h-full flex flex-col"
//         style={{ width: "150px", fontFamily: "Arial, sans-serif" }}
//       >
//         <div className="bg-gray-200 border border-black text-center py-1 mb-2">
//           <span className="font-bold text-[11px]">
//             {receipt.CATAGORYTITLE === "Laboratory"
//               ? "Laboratory Services"
//               : "Medical Services (PROC)"}
//           </span>
//         </div>

//         <div className="text-[11px] mb-2">
//           <div className="font-semibold">Rcpt #</div>
//           <div>{voucherNo}</div>
//         </div>

//         <div className="text-[10px] mb-2">{visitDateTime}</div>

//         <div className="text-[11px] mb-2">
//           <div className="font-semibold">Patient</div>
//           <div>{receipt.PATIENTNAME}</div>
//         </div>

//         <div className="text-[11px] font-semibold mb-2">
//           Consultant: {consultantName || "-"}
//         </div>

//         <div className="text-[10px] flex-1">
//           {tests.map((t, i) => (
//             <div key={i} className="flex justify-between mb-1">
//               <span className="pr-1">{t.TESTNAME}</span>
//               <span>{t.AMOUNT.toFixed(2)}</span>
//             </div>
//           ))}
//         </div>

//         <div className="border-t border-black pt-1 text-[11px]">
//           <div className="flex justify-between">
//             <span>Gross :</span>
//             <span>{receipt.GROSSAMOUNT.toFixed(2)}</span>
//           </div>
//           <div className="flex justify-between font-semibold">
//             <span>Rec Amt :</span>
//             <span>{receipt.NETAMOUNT.toFixed(2)}</span>
//           </div>
//         </div>

//         <div className="text-[9px] mt-2 leading-tight">
//           <div>User:{receipt.CREATEDBY}</div>
//           <div>Printed by :{printedBy}</div>
//         </div>
//       </div>
//     );
//   }

//   // ============= FULL VARIANT (Patient copy / Office copy) =============
//   return (
//     <div
//       className="border-l-2 border-dashed border-black pl-2 pr-2 h-full relative"
//       style={{ width: "300px", fontFamily: "Arial, sans-serif" }}
//     >
//       {/* Logo top right */}
//       <img
//         src={mmcLogo}
//         alt="MMC Logo"
//         className="absolute top-0 right-2 h-9 w-auto"
//       />

//       <div className="pr-14">
//         <h1 className="text-xl font-bold leading-tight">
//           {companyInfo.companyName}
//         </h1>
//         <p className="text-[10px] italic underline">Under the Management of</p>
//         <p className="text-[11px] font-bold">{companyInfo.urCompanyName}</p>
//         <p className="text-[9px] leading-tight mt-0.5">
//           Tel: {companyInfo.contactHead}
//           <br />
//           {companyInfo.address}
//         </p>
//       </div>

//       <div className="bg-gray-200 border-t border-b border-black text-center py-1 my-1">
//         <span className="font-bold text-[13px]">
//           {receipt.CATAGORYTITLE === "Laboratory"
//             ? "Laboratory Services"
//             : "Medical Services (PROC)"}
//         </span>
//       </div>

//       <table className="w-full text-[11px] border-collapse">
//         <tbody>
//           <tr>
//             <td className="font-semibold w-[55px] py-0.5">Rcpt #</td>
//             <td className="py-0.5">{voucherNo}</td>
//             <td className="py-0.5 text-right">{visitDateTime}</td>
//           </tr>
//           <tr>
//             <td className="font-semibold py-0.5">Patient</td>
//             <td className="py-0.5" colSpan={2}>
//               {receipt.PATIENTNAME}
//             </td>
//           </tr>
//           <tr>
//             <td className="font-semibold py-0.5">Gender</td>
//             <td className="py-0.5">{receipt.GENDER}</td>
//             <td className="py-0.5 text-right">Age {receipt.AGE}</td>
//           </tr>
//           <tr>
//             <td className="font-semibold py-0.5">Contact</td>
//             <td className="py-0.5" colSpan={2}>
//               {receipt.CONTACTNO}
//             </td>
//           </tr>
//         </tbody>
//       </table>

//       <div className="text-[11px] font-semibold border-t border-black pt-1 mt-1">
//         Consultant: {consultantName || "-"}
//       </div>

//       {/* Test lines */}
//       <div className="text-[11px] mt-1 min-h-[40px]">
//         {tests.map((t, i) => (
//           <div key={i} className="flex justify-between">
//             <span>{t.TESTNAME}</span>
//             <span>{t.AMOUNT.toFixed(2)}</span>
//           </div>
//         ))}
//       </div>

//       <div className="mt-2 text-[12px]">
//         <div className="flex justify-between border-b border-black pb-1">
//           <span className="font-semibold">Gross Amount</span>
//           <span className="font-semibold">
//             {receipt.GROSSAMOUNT.toFixed(2)}
//           </span>
//         </div>

//         {receipt.ISPARTIAL === 1 && (
//           <div className="flex justify-between border-b border-black py-1 text-[11px]">
//             <span>Partial Received</span>
//             <span>{receipt.PARTIALAMOUNT.toFixed(2)}</span>
//           </div>
//         )}

//         <div className="flex justify-between border-b-2 border-black py-1 font-bold">
//           <span>Received Amount</span>
//           <span>{receipt.NETAMOUNT.toFixed(2)}</span>
//         </div>
//       </div>

//       <div className="flex justify-between text-[9px] mt-2">
//         <div>
//           <div>Printed On : {moment().format("DD-MM-YYYY hh:mmA")}</div>
//           <div>Printed by :{printedBy}</div>
//         </div>
//         <div className="text-right">
//           <div>User:{receipt.CREATEDBY}</div>
//           <div>{terminalId}</div>
//         </div>
//       </div>
//     </div>
//   );
  
// };

// const OPDServiceReceipt = forwardRef((props, ref) => {
//   const receipt = receiptData[0];

//   return (
//     <div
//       ref={ref}
//       className="bg-white text-black flex"
//       style={{ width: "780px" }}
//     >
//       <ReceiptCopy
//         receipt={receipt}
//         tests={testData}
//         variant="full"
//         copyLabel="Patient Copy"
//       />
//       <ReceiptCopy
//         receipt={receipt}
//         tests={testData}
//         variant="full"
//         copyLabel="Office Copy"
//       />
//       <ReceiptCopy
//         receipt={receipt}
//         tests={testData}
//         variant="compact"
//         copyLabel="Consultant Copy"
//       />
//     </div>
//   );
// });

// OPDServiceReceipt.displayName = "OPDServiceReceipt";

// export default OPDServiceReceipt;