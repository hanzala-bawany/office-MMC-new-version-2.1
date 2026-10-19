import moment from "moment";

export const formatForOracle = (dateStr) => {
  if (!dateStr) return null;

  const possibleFormats = [
    "YYYY-MM-DD", // 2026-08-03 (HTML date input, ISO)
    "DD-MMM-YYYY", // 03-Aug-2026
    "DD-MM-YYYY", // 03-08-2026
    "MM-DD-YYYY", // 08-03-2026
    "YYYY/MM/DD",
    "DD/MM/YYYY",
    moment.ISO_8601, // 2026-08-03T00:00:00.000Z jaisi full ISO strings
  ];

  const momentDate = moment(dateStr, possibleFormats, true);

  if (!momentDate.isValid()) return null;

  // Oracle format: 28-JUL-2026
  return momentDate.format("DD-MMM-YYYY").toUpperCase();
};
