const oracledb = require("oracledb");
const poolPromise = require("../database.js");
const { handleError } = require("../utills/resHanlder.js");

const callCursorProcedure = async (connection, procName, sessionId) => {
  const result = await connection.execute(
    `BEGIN hms.${procName}(:VSessionId, :retval); END;`,
    {
      VSessionId: sessionId,
      retval: { type: oracledb.CURSOR, dir: oracledb.BIND_OUT },
    },
    { outFormat: oracledb.OUT_FORMAT_OBJECT },
  );

  const resultSet = result.outBinds.retval;
  const rows = await resultSet.getRows();
  await resultSet.close();
  return rows;
};

const getDailyClosingSummary = async (req, res) => {

  const { sessionId } = req.params;

  if (!sessionId) {
    return res.status(400).json({
      success: false,
      message: "sessionId is required",
    });
  }

  let connection;

  try {
    const pool = await poolPromise;
    connection = await pool.getConnection();

    // Char 4 procedures parallel me chala do — speed ke liye
    const [
      categorySummary,
      lessUnpaidDetail,
      cancelDetail,
      suspiciousTransactions,
    ] = await Promise.all([
      callCursorProcedure(connection, "rep_closingsummarys_w_new", sessionId),
      callCursorProcedure(connection, "rep_subaddlessdetail", sessionId),
      callCursorProcedure(connection, "rep_subcanceldetail", sessionId),
      callCursorProcedure(connection, "rep_subsupiciostrans", sessionId),
    ]);

    return res.status(200).json({
      success: true,
      sessionId,
      data: {
        categorySummary, // Table: Catagory, TotSlips, GrossAmount, Less, NetAmount
        lessUnpaidDetail, // BMJ / ZAKAT breakdown
        cancelDetail, // Cancelled receipts detail
        suspiciousTransactions, // Suspicious transaction list
      },
    });
  } catch (error) {
    console.error("getDailyClosingSummary error:", error);

    return handleError( res, error, "Failed to fetch daily closing summary", 500,);

  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error("Error closing connection:", err);
      }
    }
  }
};

module.exports = {
  getDailyClosingSummary,
};
