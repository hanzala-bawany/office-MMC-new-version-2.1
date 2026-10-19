const oracledb = require("oracledb");
const poolPromise = require("../database.js");
const { formatForOracle } = require("../utills/dateFormatCoverter.js");

const getPatientPartialHistoryByReceipt = async (req, res) => {
  const receiptNum = req?.params?.receiptNum?.toString();

  if (!receiptNum) {
    return res.status(400).json({
      success: false,
      message: "receiptNum is required",
    });
  }

  let connection;

  try {
    const pool = await poolPromise;
    connection = await pool.getConnection();

    // get_currsessionid FUNCTION hai (procedure nahi), isliye return value
    // seedha :sessionId bind variable mein assign hogi
    const result = await connection.execute(
      `BEGIN 
       get_partial_payment_history(:receiptNum , :retval); 
      END;`,
      {
        receiptNum: receiptNum,
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
    const historyData = await cursor.getRows();
    await cursor.close();

    const patientResult = await connection.execute(
      `BEGIN 
       get_opd_patient_info(:receiptNum , :retval); 
      END;`,
      {
        receiptNum: receiptNum,
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

    const patientCursor = patientResult.outBinds.retval;
    const patientData = await patientCursor.getRows();
    await patientCursor.close();

    res.status(200).json({
      success: true,
      message: "Patient Partial History fetched successfully",
      data: {
        patientData: patientData.length > 0 ? patientData[0] : null,
        historyData: historyData,
      },
    });
  } catch (error) {
    console.error("Error in getSessionHistory:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error fetching Patient Partial History",
      error: error,
    });
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

const getReceiptInfoByReceiptnId = async (req, res) => {
  const receiptNum = req?.params?.receiptNum?.toString();
  const partialPaymentId = req?.params?.id?.toString();

  if (!receiptNum) {
    return res.status(400).json({
      success: false,
      message: "receiptNum is required",
    });
  }

  if (!partialPaymentId) {
    return res.status(400).json({
      success: false,
      message: "partialPaymentId is required",
    });
  }

  let connection;

  try {
    const pool = await poolPromise;
    connection = await pool.getConnection();

    // get_currsessionid FUNCTION hai (procedure nahi), isliye return value
    // seedha :sessionId bind variable mein assign hogi
    const result = await connection.execute(
      `BEGIN 
       get_partial_payment_by_id(:receiptNum , :partialPaymentId , :retval); 
      END;`,
      {
        receiptNum: receiptNum,
        partialPaymentId: partialPaymentId,
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
    const data = await cursor.getRows();
    await cursor.close();

    res.status(200).json({
      success: true,
      message: "Receipt Info fetched successfully",
      data: data,
    });
  } catch (error) {
    console.error("Error in Receipt Info:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error fetching Receipt Info",
      error: error,
    });
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

const addEditPartialReceipt = async (req, res) => {
  let connection;

  try {
    const pool = await poolPromise;
    connection = await pool.getConnection();

    // Request body se data lo
    const {
      id,
      receiptNo,
      vdate,
      partialAmount,
      balanceAmount,
      receiptMode,
      editBy,
      status,
      terminalId,
    } = req.body || {};

    // Validation - Required fields check
    if (!receiptNo) {
      return res.status(400).json({
        success: false,
        message: "receiptNo is required",
      });
    }

    if (!editBy) {
      return res.status(400).json({
        success: false,
        message: "user is required",
      });
    }

    if (partialAmount === undefined || partialAmount === null) {
      return res.status(400).json({
        success: false,
        message: "partialAmount is required",
      });
    }

    // Stored procedure call
    const result = await connection.execute(
      `BEGIN hms.partialreceiptinfo_add_edit(
        :id,
        :receiptNo,
        :vdate,
        :partialAmount,
        :balanceAmount,
        :receiptMode,
        :editBy,
        :status,
        :terminalId
      ); END;`,
      {
        id: id || null,
        receiptNo: receiptNo,
        vdate: vdate ? formatForOracle(vdate) : null,
        partialAmount: partialAmount,
        balanceAmount: balanceAmount || 0,
        receiptMode: receiptMode || null,
        editBy: editBy,
        status: status !== undefined ? status : 0,
        terminalId: terminalId || null,
      },
      { autoCommit: true },
    );

    res.status(200).json({
      success: true,
      message: id
        ? "Partial Receipt updated successfully"
        : "Partial Receipt created successfully",
      data: {
        id: id || null,
        receiptNo: receiptNo,
        partialAmount: partialAmount,
        balanceAmount: balanceAmount,
      },
    });
  } catch (error) {
    console.error("Error in addEditPartialReceipt:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error processing Partial Receipt",
      error: error,
    });
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

const deletePartialPayment = async (req, res) => {
  let connection;

  try {
    const pool = await poolPromise;
    connection = await pool.getConnection();

    // Request params se data lo
    const { id } = req.params;
    const { editBy, terminalId } = req.body || {};

    // Validation - Required fields check
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "id is required",
      });
    }

    if (!editBy) {
      return res.status(400).json({
        success: false,
        message: "user is required",
      });
    }

    // Stored procedure call
    const result = await connection.execute(
      `BEGIN delete_partial_payment(
        :p_id,
        :p_user,
        :p_terminalid
      ); END;`,
      {
        p_id: id,
        p_user: editBy,
        p_terminalid: terminalId || null,
      },
      { autoCommit: true },
    );

    res.status(200).json({
      success: true,
      message: "Partial Payment deleted successfully",
      data: {
        id: id,
        deletedBy: editBy,
        deletedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Error in deletePartialPayment:", error);

    // Check if it's a custom application error
    let errorMessage = error.message || "Error deleting Partial Payment";

    // Check for custom error from procedure (ORA-20001)
    if (error.errorNum === 20001) {
      errorMessage = "Partial payment record not found";
    }

    res.status(500).json({
      success: false,
      message: errorMessage,
      error: error,
    });
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
  getPatientPartialHistoryByReceipt,
  addEditPartialReceipt,
  deletePartialPayment,
  getReceiptInfoByReceiptnId,
};
