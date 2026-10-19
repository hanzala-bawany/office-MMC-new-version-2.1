export const summarizeRows = (rows = []) => {

  const totals = rows.reduce(
    (acc, r) => {
      acc.patients += Number(r.TOTAL_PATIENT || 0);
      acc.gross += Number(r.GROSS || 0);
      acc.discount += Number(r.DISCOUNT || 0);
      acc.tax += Number(r.WITHHOLDINGTAX || 0);
      acc.charges += Number(r.TOTAL_CHARGES || 0);
      acc.netAfterCharges += Number(r.NETAMTAFTERCHARGES || 0);
      acc.doctorEarning += Number(r.NETPAYABLE || 0);
      return acc;
    },
    {
      patients: 0,
      gross: 0,
      discount: 0,
      tax: 0,
      charges: 0,
      netAfterCharges: 0,
      doctorEarning: 0,
    },
  );

  return {
    ...totals,
    doctorSharePercent: rows.length ? Number(rows[0].CONSULTANTSHARE || 0) : 0,
  };
  
};

export const combineSummaries = (opdSummary, ipdSummary) => {
  return {
    patients: (opdSummary.patients || 0) + (ipdSummary.patients || 0),
    gross: (opdSummary.gross || 0) + (ipdSummary.gross || 0),
    discount: (opdSummary.discount || 0) + (ipdSummary.discount || 0),
    tax: (opdSummary.tax || 0) + (ipdSummary.tax || 0),
    charges: (opdSummary.charges || 0) + (ipdSummary.charges || 0),
    netAfterCharges:
      (opdSummary.netAfterCharges || 0) + (ipdSummary.netAfterCharges || 0),
    doctorEarning:
      (opdSummary.doctorEarning || 0) + (ipdSummary.doctorEarning || 0),
  };
};
