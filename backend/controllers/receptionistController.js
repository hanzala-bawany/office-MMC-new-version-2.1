const oracledb = require("oracledb");
const poolPromise = require("../database.js");
const {
  generateNewMrNumber,
} = require("../utills/helperFunctions/generateMrNum.js");
const { formatForOracle } = require("../utills/dateFormatCoverter.js");

const getOpdCategory = async (req, res) => {
  let connection;
  try {
    // connection = await poolPromise.getConnection();
    const pool = await poolPromise;
    connection = await pool.getConnection();

    // Stored procedure call karo
    const result = await connection.execute(
      `BEGIN get_opdcategory( retval => :retvals); END;`,
      {
        retvals: { type: oracledb.CURSOR, dir: oracledb.BIND_OUT },
      },
      { outFormat: oracledb.OUT_FORMAT_OBJECT },
    );

    // Cursor se data fetch karo
    const cursor = result.outBinds.retvals;
    const data = await cursor.getRows();
    await cursor.close();

    // Response bhejo
    res.status(200).json({
      success: true,
      data: data,
      message: "OPD categories fetched successfully",
    });
  } catch (error) {
    console.error("Error in getOpdCategory:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching OPD categories",
      error: error.message,
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

const getPatientCategory = async (req, res) => {
  let connection;
  try {
    // Database connection establish karo
    const pool = await poolPromise;
    connection = await pool.getConnection();

    // Stored procedure call karo
    const result = await connection.execute(
      `BEGIN get_patientcategory(:retval); END;`,
      {
        retval: { type: oracledb.CURSOR, dir: oracledb.BIND_OUT },
      },
      { outFormat: oracledb.OUT_FORMAT_OBJECT },
    );

    // Cursor se data fetch karo
    const cursor = result.outBinds.retval;
    const data = await cursor.getRows();
    await cursor.close();

    // Response bhejo
    res.status(200).json({
      success: true,
      data: data,
      message: "Patient categories fetched successfully",
    });
  } catch (error) {
    console.error("Error in getPatientCategory:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching patient categories",
      error: error.message,
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

const getAllConsultantByOpdCategory = async (req, res) => {
  const facultyId = req?.query.facultyId;

  let connection;

  try {
    // Database connection establish karo
    const pool = await poolPromise;
    connection = await pool.getConnection();

    // Stored procedure call karo
    const result = await connection.execute(
      `BEGIN get_consultant(:facultyId , :retval); END;`,
      {
        facultyId: facultyId || null,
        retval: { type: oracledb.CURSOR, dir: oracledb.BIND_OUT },
      },
      { outFormat: oracledb.OUT_FORMAT_OBJECT },
    );

    // Cursor se data fetch karo
    const cursor = result.outBinds.retval;
    const data = await cursor.getRows();
    await cursor.close();

    // Response bhejo
    res.status(200).json({
      success: true,
      data: data,
      message: "All Consultant fetched successfully",
    });
  } catch (error) {
    console.error("Error in fetched All Consultant:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching Consultant",
      error: error.message,
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

const getReference = async (req, res) => {
  // const patientTypeId = req?.params.patientid;

  // if (!patientTypeId) {
  //   return res.status(400).json({
  //     success: false,
  //     message: "patientid is required",
  //   });
  // }

  let connection;

  try {
    const pool = await poolPromise;
    connection = await pool.getConnection();

    // Stored procedure call karo
    const result = await connection.execute(
      `BEGIN get_reference( retval => :retval); END;`,
      {
        // patientTypeId: patientTypeId,
        retval: { type: oracledb.CURSOR, dir: oracledb.BIND_OUT },
      },
      { outFormat: oracledb.OUT_FORMAT_OBJECT },
    );

    // Cursor se data fetch karo
    const cursor = result.outBinds.retval;
    const data = await cursor.getRows();
    await cursor.close();

    // Response bhejo
    res.status(200).json({
      success: true,
      data: data,
      message: "Reference fetched successfully",
    });
  } catch (error) {
    console.error("Error in getReference:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching reference",
      error: error.message,
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

const getAllMembers = async (req, res) => {
  let connection;

  try {
    const pool = await poolPromise;
    connection = await pool.getConnection();

    // Stored procedure call karo
    const result = await connection.execute(
      `BEGIN get_members(:retval); END;`,
      {
        retval: { type: oracledb.CURSOR, dir: oracledb.BIND_OUT },
      },
      { outFormat: oracledb.OUT_FORMAT_OBJECT },
    );

    // Cursor se data fetch karo
    const cursor = result.outBinds.retval;
    const data = await cursor.getRows();
    await cursor.close();

    // Response bhejo
    res.status(200).json({
      success: true,
      data: data,
      message: "Members fetched successfully",
    });
  } catch (error) {
    console.error("Error in get Members:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching Members",
      error: error.message,
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

const getMemberDependent = async (req, res) => {
  const memberNewNum = req?.params.newNo?.toString();

  if (!memberNewNum) {
    return res.status(400).json({
      success: false,
      message: "memberNewNum is required",
    });
  }

  let connection;

  try {
    const pool = await poolPromise;
    connection = await pool.getConnection();

    // Stored procedure call karo
    const result = await connection.execute(
      `BEGIN get_members_dependent(:memberNewNum , :retval); END;`,
      {
        memberNewNum,
        retval: { type: oracledb.CURSOR, dir: oracledb.BIND_OUT },
      },
      { outFormat: oracledb.OUT_FORMAT_OBJECT },
    );

    // Cursor se data fetch karo
    const cursor = result.outBinds.retval;
    const data = await cursor.getRows();
    await cursor.close();

    // Response bhejo
    res.status(200).json({
      success: true,
      data: data,
      message: "Member Dependent fetched successfully",
    });
  } catch (error) {
    console.error("Error in get Member Dependent:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching Member Dependent",
      error: error.message,
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

const getLast10Patient = async (req, res) => {
  const userName = req?.params?.userName?.toString();

  let connection;

  try {
    const pool = await poolPromise;
    connection = await pool.getConnection();

    // Stored procedure call karo
    const result = await connection.execute(
      `BEGIN get_last_patient(:vusername , :retval , :retval_labtests); END;`,
      {
        vusername: userName,
        retval: { type: oracledb.CURSOR, dir: oracledb.BIND_OUT },
        retval_labtests: { type: oracledb.CURSOR, dir: oracledb.BIND_OUT },
      },
      { outFormat: oracledb.OUT_FORMAT_OBJECT },
    );

    const cursor = result.outBinds.retval;
    const mainData = await cursor.getRows();
    await cursor.close();

    const labtestsCursor = result.outBinds.retval_labtests;
    const labTestRows = await labtestsCursor.getRows();
    await labtestsCursor.close();

    const dataWithLabTests = mainData.map((record) => ({
      ...record,
      LABTESTS: labTestRows
        .filter((lt) => lt.RECEIPTNO === record.RECEIPTNO)
        .map((lt) => ({
          testId: lt.TESTID,
          rowId: lt.ROWID_STR,
          testName: lt.TESTNAME,
          amount: lt.AMOUNT,
        })),
    }));

    // Response bhejo
    res.status(200).json({
      success: true,
      data: dataWithLabTests,
      message: "Last 10 Patients fetched successfully",
    });
  } catch (error) {
    console.error("Error in get Last 10 Patient:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching Last 10 Patient",
      error: error.message,
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

const getLabTest = async (req, res) => {
  let connection;

  try {
    const pool = await poolPromise;
    connection = await pool.getConnection();

    // Stored procedure call karo
    const result = await connection.execute(
      `BEGIN get_test( :retval ); END;`,
      {
        retval: { type: oracledb.CURSOR, dir: oracledb.BIND_OUT },
      },
      { outFormat: oracledb.OUT_FORMAT_OBJECT },
    );

    // Cursor se data fetch karo
    const cursor = result.outBinds.retval;
    const data = await cursor.getRows();
    await cursor.close();

    // Response bhejo
    res.status(200).json({
      success: true,
      message: "lab Test fetched successfully",
      data: data,
    });
  } catch (error) {
    console.error("Error in get lab Test:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching lab Test",
      error: error.message,
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

const getUsers = async (req, res) => {
  let connection;

  try {
    const pool = await poolPromise;
    connection = await pool.getConnection();

    // Stored procedure call karo
    const result = await connection.execute(
      `BEGIN get_users( :retval ); END;`,
      {
        retval: { type: oracledb.CURSOR, dir: oracledb.BIND_OUT },
      },
      { outFormat: oracledb.OUT_FORMAT_OBJECT },
    );

    // Cursor se data fetch karo
    const cursor = result.outBinds.retval;
    const data = await cursor.getRows();
    await cursor.close();

    // Response bhejo
    res.status(200).json({
      success: true,
      message: "Users fetched successfully",
      data: data,
    });
  } catch (error) {
    console.error("Error in get Users:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching Users",
      error: error.message,
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

const addEditOpdReceipt = async (req, res) => {
  let connection;
  try {
    const pool = await poolPromise;
    connection = await pool.getConnection();

    // Request body se data lo
    const {
      ReceiptNo,
      TokenNo,
      Vdate,
      CatagoryId,
      ConsultantID,
      PatientType,
      MemberID,
      PatientId,
      PatientTitle,
      PatientName,
      Gender,
      ContactNo,
      Age,
      AgeUnit,
      ReferenceId,
      Remarks,
      GrossAmount,
      Discount,
      NetAmount,
      User,
      TerminalId,
      status,
      isPartial,
      partialAmount,
      netbalance,
      electricitycharges,
      laboratoryConsultantid,
      LabTestIds,
      LabTestAmounts,
    } = req.body || {};

    // console.log(req.body, "req.body ...........");

    // Validation - Required fields check karo
    if (
      !CatagoryId ||
      (CatagoryId == 2 ? !laboratoryConsultantid : !ConsultantID) ||
      !PatientName ||
      !User ||
      !ContactNo
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Missing required fields: CatagoryId, ConsultantID, PatientName,ContactNo , User are required",
      });
    }

    const MrNo = await generateNewMrNumber(connection, ContactNo);

    // Stored procedure call karo
    const result = await connection.execute(
      `BEGIN opdreceipt_add_edit_react(
        :ReceiptNo, :TokenNo, :Vdate, :CatagoryId, :ConsultantID, 
        :PatientType, :MemberID, :PatientId, :PatientTitle, :PatientName, 
        :Gender, :ContactNo, :Age, :AgeUnit, :ReferenceId, 
        :Remarks, :GrossAmount, :Discount, :NetAmount, :User, 
        :TerminalId, :status, :isPartial, :partialAmount, :netbalance, 
        :electricitycharges, :laboratoryConsultantid ,:MrNo , :RetVoucherNo
      ); END;`,
      {
        ReceiptNo: ReceiptNo || null,
        TokenNo: TokenNo || null,
        Vdate: Vdate ? new Date(Vdate) : null,
        CatagoryId: CatagoryId,
        ConsultantID: ConsultantID,
        PatientType: PatientType || null,
        MemberID: MemberID || null,
        PatientId: PatientId || null,
        PatientTitle: PatientTitle || null,
        PatientName: PatientName,
        Gender: Gender || null,
        ContactNo: ContactNo || null,
        Age: Age?.toString() || null,
        AgeUnit: AgeUnit || null,
        ReferenceId: ReferenceId || null,
        Remarks: Remarks || null,
        GrossAmount: GrossAmount || 0,
        Discount: Discount || 0,
        NetAmount: NetAmount || 0,
        User: User,
        TerminalId: TerminalId || null,
        status: status !== undefined ? status : 0,
        isPartial: isPartial || 0,
        partialAmount: partialAmount || 0,
        netbalance: netbalance || 0,
        electricitycharges: electricitycharges || 0,
        laboratoryConsultantid: laboratoryConsultantid || null,
        MrNo: MrNo || null,
        RetVoucherNo: {
          type: oracledb.STRING,
          dir: oracledb.BIND_OUT,
          maxSize: 20,
        },
      },
      { autoCommit: true },
    );

    const recieptNo = result.outBinds.RetVoucherNo;

    if (Array.isArray(LabTestIds) && LabTestIds.length > 0) {
      for (const testId of LabTestIds) {
        const testInfo = LabTestAmounts?.find(
          (t) => String(t.id) === String(testId),
        );
        const amount = Number(testInfo?.amount) || 0;
        const rowId = testInfo?.rowId || null;

        await connection.execute(
          `BEGIN 
            opdtestreceipt_add_edit1_new(
             :VReceiptNo, :VfkTestId, :VRowId, :VAmount, :VUser, :Vstatus
            ); 
          END;`,
          {
            VReceiptNo: ReceiptNo || recieptNo,
            VfkTestId: testId,
            VRowId: rowId,
            VAmount: amount,
            VUser: User,
            Vstatus: 0,
          },
          { autoCommit: false }, // sab tests ke baad ek sath commit karo
        );
      }

      await connection.commit(); // sab inserts ek sath commit
    }

    res.status(200).json({
      success: true,
      data: {
        receiptNo: recieptNo,
        mrNo: MrNo,
      },
      message: ReceiptNo
        ? "OPD Receipt updated successfully"
        : "OPD Receipt created successfully",
    });
  } catch (error) {
    console.error("Error in addEditOpdReceipt:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error processing OPD Receipt",
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

const getPatientsbyFilter = async (req, res) => {
  const {
    fromDate = null,
    toDate = null,
    userId = null,
    receiptNo = null,
    contactNo = null,
    categoryId = null,
    pageNo = null,
    pageSize = null,
    mrNo = null,
  } = req?.query || {};

  let connection;

  try {
    const pool = await poolPromise;
    connection = await pool.getConnection();

    const formattedFromDate = formatForOracle(fromDate);
    const formattedToDate = formatForOracle(toDate);

    const finalPageNo = pageNo ? Number(pageNo) : 1;
    const finalPageSize = pageSize ? Number(pageSize) : 5;

    const skipDataCount = (finalPageNo - 1) * finalPageSize;

    // Stored procedure call karo
    const result = await connection.execute(
      `BEGIN 
      get_opdreceipt_list(     
        :fromDate,
        :toDate,
        :userId,
        :receiptNo,
        :contactNo,
        :categoryId,
        :skipDataCount,
        :pageSize,
        :mrNo,
        :totalCount, 
        :retval,
        :retval_labtests
      ); 
      END;`,
      {
        fromDate: formattedFromDate,
        toDate: formattedToDate,
        userId,
        receiptNo,
        contactNo,
        categoryId,
        skipDataCount: skipDataCount,
        pageSize: finalPageSize,
        mrNo: mrNo,
        totalCount: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT },
        retval: { type: oracledb.CURSOR, dir: oracledb.BIND_OUT },
        retval_labtests: { type: oracledb.CURSOR, dir: oracledb.BIND_OUT },
      },
      { outFormat: oracledb.OUT_FORMAT_OBJECT },
    );

    // Cursor se data fetch karo
    const totalCountData = result.outBinds.totalCount;
    const cursor = result.outBinds.retval;
    const mainData = await cursor.getRows();
    await cursor.close();

    const labtestsCursor = result.outBinds.retval_labtests;
    const labTestRows = await labtestsCursor.getRows();
    await labtestsCursor.close();

    const dataWithLabTests = mainData.map((record) => ({
      ...record,
      LABTESTS: labTestRows
        .filter((lt) => lt.RECEIPTNO === record.RECEIPTNO)
        .map((lt) => ({
          testId: lt.TESTID,
          rowId: lt.ROWID_STR,
          testName: lt.TESTNAME,
          amount: lt.AMOUNT,
        })),
    }));

    // Response bhejo
    res.status(200).json({
      success: true,
      message: "Patients fetched successfully",
      total: totalCountData,
      data: dataWithLabTests,
    });
  } catch (error) {
    console.error("Error in get Patients:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching Patients",
      error: error.message,
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

const deleteRefundOpdReceipt = async (req, res) => {
  let connection;
  try {
    const pool = await poolPromise;
    connection = await pool.getConnection();

    // Request body se data lo
    const {
      ReceiptNo,
      status,
      User,
      TerminalId,
      Remarks,
      refundBy,
      refundDate,
    } = req.body || {};

    console.log(req.body, "req.body in  deleteRefundOpdReceipt ...........");

    // Validation - Sirf required fields check karo
    if (!ReceiptNo) {
      return res.status(400).json({
        success: false,
        message: "ReceiptNo is required",
      });
    }

    if (!User) {
      return res.status(400).json({
        success: false,
        message: "User is required",
      });
    }

    if (status === undefined || status === null) {
      return res.status(400).json({
        success: false,
        message: "Status is required (1 for delete, 0 for restore)",
      });
    }

    // Stored procedure call karo - SAHI PROCEDURE CALL
    const result = await connection.execute(
      `BEGIN hms.change_opdreceipt_status(
        :VReceiptNo,
        :VStatus,
        :VUser,
        :VTerminalId,
        :VRemarks,
        :VRefundBy,
        :VRefunddate
      ); END;`,
      {
        VReceiptNo: ReceiptNo,
        VStatus: status,
        VUser: User,
        VTerminalId: TerminalId || null,
        VRemarks: Remarks || null,
        VRefundBy: refundBy || null,
        VRefunddate: refundDate ? new Date(refundDate) : null,
      },
      { autoCommit: true },
    );

    // Success response
    const message =
      status === 1
        ? `OPD Receipt ${ReceiptNo} deleted successfully`
        : `OPD Receipt ${ReceiptNo} restored successfully`;

    res.status(200).json({
      success: true,
      data: {
        receiptNo: ReceiptNo,
        status: status,
        action: status === 1 ? "deleted" : "restored",
      },
      message: message,
    });
  } catch (error) {
    console.error("Error in deleteRefundOpdReceipt:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error processing OPD Receipt status change",
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

const ClosedUserSesseion = async (req, res) => {
  let connection;
  try {
    const pool = await poolPromise;
    connection = await pool.getConnection();

    // Request body se data lo
    const { sessionId } = req.params || {};

    // Validation - Sirf required fields check karo
    if (!sessionId) {
      return res.status(400).json({
        success: false,
        message: "Session Id is required",
      });
    }

    console.log(sessionId, "sessionId .......");

    // Stored procedure call karo - SAHI PROCEDURE CALL
    const result = await connection.execute(
      `BEGIN hms.usersession_closed(
        :VsessionId
      ); END;`,
      {
        VsessionId: sessionId,
      },
      { autoCommit: true },
    );

    res.status(200).json({
      success: true,
      message: "Session Closed Successfully",
      data: {
        sessionId: sessionId,
      },
    });
  } catch (error) {
    console.error("Error in clossed Session Id:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error processing clossed Session Id",
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

const getCurrentSession = async (req, res) => {

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

    // get_currsessionid FUNCTION hai (procedure nahi), isliye return value
    // seedha :sessionId bind variable mein assign hogi
    const result = await connection.execute(
      `BEGIN 
       get_open_sessionid(:userId , :p_cur); 
      END;`,
      {
        userId: userId,
        p_cur: {
          type: oracledb.CURSOR,
          dir: oracledb.BIND_OUT,
          maxSize: 50,
        },
      },
      { autoCommit: true , outFormat: oracledb.OUT_FORMAT_OBJECT }, // agar naya session banta hai to insert commit hona chahiye
    );

    const cursor = result.outBinds.p_cur;
    const data = await cursor.getRows();
    await cursor.close();


    res.status(200).json({
      success: true,
      message: "Current session fetched successfully",
      data: data,
    });
  } catch (error) {
    console.error("Error in getCurrentSession:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error fetching current session",
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

const getCurrentCash = async (req, res) => {
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

    // get_currsessionid FUNCTION hai (procedure nahi), isliye return value
    // seedha :sessionId bind variable mein assign hogi
    const result = await connection.execute(
      `BEGIN 
       get_current_cash(:userId , :retval); 
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
    const data = await cursor.getRows();
    await cursor.close();

    res.status(200).json({
      success: true,
      message: "Current Cash fetched successfully",
      data: data
    });
  } catch (error) {
    console.error("Error in getCurrentCash:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error fetching current session",
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

const getSessionHistory = async (req, res) => {

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

    // get_currsessionid FUNCTION hai (procedure nahi), isliye return value
    // seedha :sessionId bind variable mein assign hogi
    const result = await connection.execute(
      `BEGIN 
       get_user_sessions(:userId , :retval); 
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
    const data = await cursor.getRows();
    await cursor.close();

    res.status(200).json({
      success: true,
      message: "Session History fetched successfully",
      data: data
    });
  } catch (error) {
    console.error("Error in getSessionHistory:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error fetching session History",
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
  getOpdCategory,
  getPatientCategory,
  getAllConsultantByOpdCategory,
  getReference,
  getAllMembers,
  addEditOpdReceipt,
  getLast10Patient,
  getLabTest,
  getMemberDependent,
  getUsers,
  getPatientsbyFilter,
  deleteRefundOpdReceipt,
  ClosedUserSesseion,
  getCurrentSession,
  getCurrentCash,
  getSessionHistory
};
