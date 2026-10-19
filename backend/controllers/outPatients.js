const oracledb = require("oracledb");
const poolPromise = require("../database.js");
const { handleError } = require("../utills/resHanlder.js");


const getOpdReceiptnTestPrint = async (req, res) => {

  const vreceipt = req?.params?.vreceipt?.toString();

  if (!vreceipt) {
    return res.status(400).json({
      success: false,
      message: "vreceipt is required",
    });
  }

  let connection;

  try {
    const pool = await poolPromise;
    connection = await pool.getConnection();

    // ============= STEP 1: Master receipt data =============
    const masterResult = await connection.execute(
      `BEGIN 
       get_opd_receipts_print(:vreceipt, :retval); 
      END;`,
      {
        vreceipt: vreceipt,
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

    const masterCursor = masterResult.outBinds.retval;
    const masterRows = await masterCursor.getRows();
    await masterCursor.close();

    if (masterRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No data Found",
      });
    }

    // ============= STEP 2: Test/service line items =============
    const testResult = await connection.execute(
      `BEGIN 
       get_opd_receipts_lab_print(:vreceipt, :retval); 
      END;`,
      {
        vreceipt: vreceipt,
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

    const testCursor = testResult.outBinds.retval;
    const testRows = await testCursor.getRows();
    await testCursor.close();

    // ============= STEP 3: Combined response =============
    res.status(200).json({
      success: true,
      message: "OPD Receipt Print fetched successfully",
      data: {
        receiptNum : vreceipt,
        receiptData: masterRows,  
        testData: testRows,     
      },
    });

  } catch (err) {
    return handleError(res, err, "Error Fetching OPD Receipt Print", 500);
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


const getCompanyDetail = async (req, res) => {
  let connection;

  try {
    const pool = await poolPromise;
    connection = await pool.getConnection();

    const result = await connection.execute(
      `BEGIN 
       get_company_detail(:retval); 
      END;`,
      {
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
      message: rows.length == 0 ? "No data Found" : "Company details fetched successfully",
      data: rows,
    });
  } catch (err) {
    return handleError(res, err, "Error Fetching Company Details", 500);
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
  getOpdReceiptnTestPrint,
  getCompanyDetail
};