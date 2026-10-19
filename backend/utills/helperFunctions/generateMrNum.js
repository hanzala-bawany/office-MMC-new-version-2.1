import OracleDB from "oracledb";

export const getOpdDetailsByContactNo = async (connection, contactNo) => {
  const result = await connection.execute(
    `SELECT * FROM hms.OPDReceipt WHERE contactno = :contactNo`,
    { contactNo },
    { outFormat: OracleDB.OUT_FORMAT_OBJECT },
  );
  return result.rows;
};

export const getMaxMrNo = async (connection) => {
  const result = await connection.execute(
    `SELECT    MAX(To_Number(MRNo)) AS MRNO FROM hms.opdreceipt`,
    {},
    { outFormat: OracleDB.OUT_FORMAT_OBJECT },
  );
  return result.rows;
};

export const generateNewMrNumber = async (connection, contactNo) => {
  let mrNo = "";

  // Step 1: agar contact number diya he, us se pehle ka MRNo dhoondo
  if (contactNo) {
    const rows = await getOpdDetailsByContactNo(connection, contactNo);
    if (rows.length > 0 && rows[0].MRNO) {
      mrNo = rows[0].MRNO.toString();
    }
  }

  // Step 2: agar mrNo abhi bhi empty he, naya generate karo
  if (!mrNo) {
    const currentYear = new Date().getFullYear();
    const yearString = currentYear.toString();

    const maxRows = await getMaxMrNo(connection);
    let lastMrNumberForYear = 0;

    if (maxRows.length > 0 && maxRows[0].MRNO) {
      const lastMrNumber = maxRows[0].MRNO.toString();

      if (lastMrNumber.startsWith(yearString)) {
        const numberPart = lastMrNumber.substring(4);
        const number = parseInt(numberPart, 10);
        if (!isNaN(number)) {
          lastMrNumberForYear = number;
        }
      }
    }

    const newMrNumber = lastMrNumberForYear + 1;
    // C# ka "D6" format => 6 digit zero-padded number
    mrNo = yearString + newMrNumber.toString().padStart(6, "0");
  }

  return mrNo;
};



// END