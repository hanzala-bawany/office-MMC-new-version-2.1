import React, { forwardRef } from "react";
import mmcLogo from "../../assets/MMC logo.png";
import moment from "moment";

// ============= STATIC DATA (baad me API se same shape me aayega) =============
const receiptData = [
  {
    TOKENNO: 52,
    VDATE: "2026-07-16T13:43:37.000Z",
    CATAGORYTITLE: "General O.P.D",
    REPORTTYPE: "CARD",
    CONSULTANTNAME: "Md. Jawaid",
    MEMBERID: null,
    GENDER: "Female",
    PATIENTNAME: "Mrs.Ambreen Adil",
    AGE: "33 Year",
    NETAMOUNT: 200,
    CONTACTNO: "03323458033",
    PATIENTTYPE: "PUBLIC",
    REFERENCENAME: null,
    REMARKS: null,
    GROSSAMOUNT: 200,
    DISCOUNT: 0,
    NETAMOUNT_1: 200,
    PARTIALAMOUNT: 0,
    NETBALANCE: 0,
    ISPARTIAL: 0,
    CREATEDBY: "ZohraZakaria",
    CREATEDTIME: "2026-07-16T14:16:00.000Z",
    ELECTRICITYCHARGES: 0,
    LABORATORYCONSULTANTNAME: null,
    NOOFPRINT: 0,
  },
];

// Runtime/context data (login se, DB query se nahi -- jaisa humne discuss kiya tha)
const printedBy = "s.m.nawaz";
const terminalId = "MMC-136";

// ============= COMPANY INFO (static filhaal -- baad me get_company_info procedure se) =============
const companyInfo = {
  companyName: "MEMON MEDICAL COMPLEX",
  urCompanyName: "BANTVA TOWN MEMON WELFARE COMMITTEE",
  address: "1503-04/3, Siddiqabad, F.B. Area, Karachi, 79950",
  contactHead: "36339444-555, 36376298",
};

const OPDCardReceipt = forwardRef(({ receipt : printData } , ref) => {
    
  const receipt = printData?.receiptData?.[0];
  console.log(printData , "printData in opd card ............");

  const printedOn = moment().format("DD-MMM-YYYY hh:mmA");
  const visitDate = moment(receipt?.VDATE).format("DD-MMM-YYYY");
  const visitTime = moment(receipt?.CREATEDTIME).format("hh:mm A");

  

  return (
    <div
      className="bg-white text-black mx-auto"
      style={{ width: "480px", fontFamily: "Arial, sans-serif" }}  ref={ref}
    >
      <div className="border border-black relative">
        {/* ============= LOGO (top right) ============= */}
        <img
          src={mmcLogo}
          alt="MMC Logo"
          className="absolute top-2 right-16 h-10 w-auto"
        />

        {/* ============= TOKEN CIRCLE (top right) ============= */}
        <div className="absolute top-2 right-2 w-11 h-11 rounded-full border-2 border-black flex items-center justify-center">
          <span className="text-lg font-bold">{receipt?.TOKENNO}</span>
        </div>

        {/* ============= HEADER ============= */}
        <div className="text-center pt-3 pb-2 px-4">
          <h1 className="text-2xl font-bold tracking-wide">
            {companyInfo.companyName}
          </h1>
          <p className="text-[11px] italic underline mt-1">
            Under the Management of
          </p>
          <p className="text-sm font-bold mt-0.5">
            {companyInfo.urCompanyName}
          </p>
          <p className="text-[10px] mt-1 leading-tight">
            Tel: {companyInfo.contactHead}
            <br />
            {companyInfo.address}
          </p>
        </div>

        {/* ============= CATEGORY BAR ============= */}
        <div className="bg-gray-200 border-t border-b border-black text-center py-1">
          <span className="font-bold text-sm">{receipt?.CATAGORYTITLE}</span>
        </div>

        {/* ============= TOP DETAILS TABLE ============= */}
        <table className="w-full text-[11px] border-collapse">
          <tbody>
            <tr className="border-b border-black">
              <td className="border-r border-black px-2 py-1 font-semibold w-[70px]">
                Rcpt #
              </td>
              <td className="px-2 py-1">{receipt?.CONSULTANTNAME ? "OP-03001334" : "OP-03001334"}</td>
              <td className="px-2 py-1 text-right pr-2" colSpan={2}>
                {visitDate} {visitTime}
              </td>
            </tr>
            <tr className="border-b border-black">
              <td className="border-r border-black px-2 py-1 font-semibold">
                Patient
              </td>
              <td className="px-2 py-1" colSpan={2}>
                {receipt?.PATIENTNAME}
              </td>
              <td className="px-2 py-1 text-right pr-2">
                Contact: {receipt?.CONTACTNO}
              </td>
            </tr>
            <tr className="border-b border-black">
              <td className="border-r border-black px-2 py-1 font-semibold">
                Gender
              </td>
              <td className="px-2 py-1" colSpan={2}>
                {receipt?.GENDER}
              </td>
              <td className="px-2 py-1 text-right pr-2">Age {receipt?.AGE}</td>
            </tr>
            <tr className="border-b border-black">
              <td className="border-r border-black px-2 py-1 font-semibold">
                Total
              </td>
              <td className="px-2 py-1" colSpan={2}>
                {receipt?.GROSSAMOUNT}
              </td>
              <td className="px-2 py-1 text-right pr-2 font-semibold">
                Net : {receipt?.NETAMOUNT}
              </td>
            </tr>
            <tr className="border-b-2 border-black">
              <td className="px-2 py-1 text-[10px]" colSpan={3}>
                Printed On : {printedOn}
              </td>
              <td className="px-2 py-1 text-[10px] text-right pr-2">
                User : {receipt?.CREATEDBY}
              </td>
            </tr>
          </tbody>
        </table>

        {/* ============= EXAMINATION SECTION ============= */}
        <div className="flex border-b border-black">
          {/* Left labels */}
          <div className="w-[90px] border-r border-black">
            <div className="border-b border-black text-center text-[10px] font-semibold py-1">
              Examination
            </div>
            <div className="px-2 py-6 text-[11px] border-b border-black">
              B/P
            </div>
            <div className="px-2 py-6 text-[11px] border-b border-black">
              PULSE
            </div>
            <div className="px-2 py-6 text-[11px] border-b border-black">
              TEMP.
            </div>
            <div className="px-2 py-6 text-[11px]">WEIGHT</div>
          </div>

          {/* Right Rx area */}
          <div className="flex-1 relative">
            <div className="flex justify-between items-center border-b border-black px-2 py-1">
              <span className="text-[11px] font-semibold">
                Consultant: {receipt?.CONSULTANTNAME}
              </span>
              <span className="bg-gray-200 border border-black text-[10px] font-bold px-2 py-0.5">
                OPD CARD
              </span>
            </div>
            <div className="p-2 text-lg italic" style={{ minHeight: "180px" }}>
              Rx
            </div>
          </div>
        </div>

        {/* ============= PERFORATION LINE ============= */}
        <div className="border-t-2 border-dashed border-black my-2 mx-2" />

        {/* ============= BOTTOM STUB (receptionist copy) ============= */}
        <div className="px-3 pb-3">
          {/* <div className="flex justify-between items-center border-b border-black pb-1 mb-2">
            <span className="text-[11px] font-semibold">
              Consultant: {receipt.CONSULTANTNAME}
            </span>
          </div>
          <div className="bg-gray-200 border border-black text-center py-1 mb-2">
            <span className="font-bold text-sm">{receipt.CATAGORYTITLE}</span>
          </div>

          <table className="w-full text-[11px]">
            <tbody>
              <tr>
                <td className="font-semibold w-[80px] py-0.5">Rcpt #</td>
                <td className="py-0.5">OP-03001334</td>
                <td className="py-0.5 text-right">Date: {visitDate}</td>
              </tr>
              <tr>
                <td className="font-semibold py-0.5">Patient</td>
                <td className="py-0.5" colSpan={1}>
                  {receipt.PATIENTNAME}
                </td>
                <td className="py-0.5 text-right">Token : {receipt.TOKENNO}</td>
              </tr>
              <tr>
                <td className="font-semibold py-0.5">Total</td>
                <td className="py-0.5">{receipt.GROSSAMOUNT}</td>
                <td className="py-0.5 text-right font-semibold">
                  Net : {receipt.NETAMOUNT}
                </td>
              </tr>
            </tbody>
          </table> */}

          <div className="flex justify-between text-[10px] mt-2">
            <div>
              <div>Printed On : {printedOn}</div>
              <div>Printed by :{printedBy}</div>
            </div>
            <div className="text-right">
              <div>User:{receipt?.CREATEDBY}</div>
              <div>{terminalId}</div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
});

OPDCardReceipt.displayName = "OPDCardReceipt";

export default OPDCardReceipt;