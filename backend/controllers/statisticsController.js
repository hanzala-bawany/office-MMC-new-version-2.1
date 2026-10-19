
const oracledb = require("oracledb");
const poolPromise = require("../database.js");
const { formatForOracle } = require("../utills/dateFormatCoverter.js");
const { handleError } = require("../utills/resHanlder.js");

const getCurrentCashByUserId = async (req, res) => {

// console.log("current ach chala he");


  const userId = req?.params?.userId?.toString();

  if (!userId) {
    return res.status(400).json({
      success: false,
      message: "userId is required",
    });
  }

  let connection;

  try {
    const pool = await poolPromise;
    connection = await pool.getConnection();

    const result = await connection.execute(
      `BEGIN 
       hms.sp_currentcashstatus1(:userId , :retval); 
      END;`,
      {
        userId: userId,
        retval: {
          type: oracledb.CURSOR,
          dir: oracledb.BIND_OUT,
        },
      },
      {
        autoCommit: true,
        outFormat: oracledb.OUT_FORMAT_OBJECT,
      },
    );

    const cursor = result.outBinds.retval;
    const rows = await cursor.getRows();
    await cursor.close();


    res.status(200).json({
      success: true,
      message: rows.length == 0 ? "No data Found" : "Current Cash fetched successfully",
      data: rows,
    });
  } catch (err) {

    return handleError(res, err, "Error Fetching Current Cash", 500);

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
  getCurrentCashByUserId,
};
