const oracledb = require("oracledb");
const poolPromise = require("../database.js");
// const { getScreensForFaculty, getDoctorFacultyId } = require("../utills/helperFunc.js");

//-------HELPER FUNCTIONS START--------------------


 const getScreensForFaculty = async (connection, facultyId) => {
  try {
    const result = await connection.execute(
      `SELECT screen_id FROM screen_faculty_map 
       WHERE faculty_id = :facultyId`,
      { facultyId },
      { outFormat: oracledb.OUT_FORMAT_OBJECT },
    );
    return result.rows.map((r) => r.SCREEN_ID);
  } catch {
    return [];
  }
};

 const getDoctorFacultyId = async (connection, doctorId) => {
  try {
    const result = await connection.execute(
      `SELECT facultyid FROM hms.consultant WHERE id = :id`,
      { id: doctorId },
      { outFormat: oracledb.OUT_FORMAT_OBJECT },
    );
    return result.rows[0]?.FACULTYID || null;
  } catch {
    return null;
  }
};

// ======= REUSABLE SOCKET EMIT HELPER =======
const emitToScreens = async (connection, io, doctorId, payload) => {
  try {
    const facultyId = await getDoctorFacultyId(connection, doctorId);
    const screenIds = await getScreensForFaculty(connection, facultyId);
    screenIds.forEach((sid) => {
      io.to(`screen_${sid}`).emit("QUEUE_UPDATED", {
        ...payload,
        screenId: parseInt(sid),
      });
    });
  } catch (err) {
    console.error("emitToScreens error:", err);
  }
};

// END




const getPronounceNameByDoctorId = async (connection, doctorId) => {
  try {
    const result = await connection.execute(
      `SELECT NVL(cp.pronounce_name, c.name) AS call_name
       FROM hms.consultant c
       LEFT JOIN consultant_pronounce cp
       ON cp.consultant_id = c.id
       WHERE c.id = :id`,
      { id: doctorId },
      { outFormat: oracledb.OUT_FORMAT_OBJECT },
    );

    return result.rows[0]?.CALL_NAME || null;
  } catch {
    return null;
  }
};

const getRoomNoByDoctorId = async (connection, doctorId) => {
  try {
    const result = await connection.execute(
      `SELECT NVL(room_no, 'Room Not Assigned') AS room_no
       FROM consultant_room
       WHERE consultant_id = :id`,
      { id: doctorId },
      { outFormat: oracledb.OUT_FORMAT_OBJECT },
    );
    return result.rows[0]?.ROOM_NO || "Room Not Assigned";
  } catch {
    return "Room Not Assigned";
  }
};

const getTodayDoctorPatients = async (req, res) => {
  let connection;

  try {
    const { patientStatus } = req.query;
    // example: ?patientStatus=2

    const pool = await poolPromise;
    connection = await pool.getConnection();

    const result = await connection.execute(
      `
      BEGIN
        get_today_doctor_patients(
          :VPatientStatus,
          :cursor
        );
      END;
      `,
      {
        VPatientStatus: patientStatus,
        cursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR },
      },
      {
        outFormat: oracledb.OUT_FORMAT_OBJECT,
      },
    );

    const resultSet = result.outBinds.cursor;
    const rows = await resultSet.getRows();
    await resultSet.close();

    res.status(200).json({
      status: 200,
      count: rows.length,
      data: rows,
    });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({
      status: 500,
      message: "Internal Server Error",
      error: err.message,
    });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error(err);
      }
    }
  }
};

const getDoctorPatientsWithStats = async (req, res) => {
  let connection;
  try {
    const { doctorId } = req.params;
    const { status } = req.query;
    const statusFilter = status ? Number(status) : 2;

    const pool = await poolPromise;
    connection = await pool.getConnection();

    const result = await connection.execute(
      `
      BEGIN
        get_doctor_patients_with_stats(
          p_doc_id         => :doc_id,
          p_status_filter  => :status_filter,
          p_today_total    => :today_total,
          p_checked        => :checked,
          p_remaining      => :remaining,
          p_skipped        => :skipped,
          p_cancel         => :canceled,
          p_is_logged_in   => :is_logged_in,
          retval           => :cursor1,
          retval1          => :cursor2,
          retval2          => :cursor3,
          p_skipped_tokens => :cursor4,
          retval3          => :cursor5,
          retval4          => :cursor6
        );
      END;
      `,
      {
        doc_id: doctorId,
        status_filter: statusFilter,
        today_total: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
        checked: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
        remaining: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
        skipped: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
        canceled: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
        is_logged_in: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
        cursor1: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR },
        cursor2: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR },
        cursor3: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR },
        cursor4: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR },
        cursor5: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR },
        cursor6: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR },
      },
      { outFormat: oracledb.OUT_FORMAT_OBJECT },
    );

    const rs1 = result.outBinds.cursor1;
    const rs2 = result.outBinds.cursor2;
    const rs3 = result.outBinds.cursor3;
    const rs4 = result.outBinds.cursor4;
    const rs5 = result.outBinds.cursor5;
    const rs6 = result.outBinds.cursor6;

    const patients = await rs1.getRows();

    //  Sirf status 2 pe
    let diagnosisList, testList, skippedTokens, patientVitals, medicineList;
    if (statusFilter === 2) {
      diagnosisList = await rs2.getRows();
      testList = await rs3.getRows();
      skippedTokens = await rs4.getRows();
      patientVitals = await rs5.getRows();
      medicineList = await rs6.getRows();
    }

    await rs1.close();
    await rs2.close();
    await rs3.close();
    await rs4.close();
    await rs5.close();

    //  Response conditionally build
    const responseData = {
      todayAppointments: result.outBinds.today_total,
      patientsChecked: result.outBinds.checked,
      patientsRemaining: result.outBinds.remaining,
      patientsSkipped: result.outBinds.skipped,
      patientsCanceled: result.outBinds.canceled,
      isLoggedIn: result.outBinds.is_logged_in,
      patients,
    };

    if (statusFilter === 2) {
      responseData.diagnosisList = diagnosisList;
      responseData.testList = testList;
      responseData.medicineList = medicineList;
      responseData.skippedTokenList = skippedTokens;
      responseData.patientVitals = patientVitals;
    }

    res.status(200).json({ status: 200, data: responseData });
  } catch (err) {
    console.error("getDoctorPatientsWithStats error:", err);
    res.status(500).json({
      status: 500,
      message: "Internal Server Error",
      error: err.message,
    });
  } finally {
    if (connection) await connection.close();
  }
};

const getDoctorNextPatient = async (req, res) => {
  let connection;

  try {
    let {
      doctorId,
      receiptNo,
      remarks,
      primaryDiagnosis,
      medicalTests,
      treatment,
      medicalPlan,
      medicine,
    } = req.body;

    // ================= NORMALIZE STRINGS ONLY =================
    const normalizeString = (val) =>
      typeof val === "string" && val.trim() !== "" ? val.trim() : null;

    receiptNo = normalizeString(receiptNo);
    remarks = normalizeString(remarks);
    treatment = normalizeString(treatment);
    medicalPlan = normalizeString(medicalPlan);

    // ================= ENSURE ARRAYS =================
    primaryDiagnosis = Array.isArray(primaryDiagnosis) ? primaryDiagnosis : [];
    medicalTests = Array.isArray(medicalTests) ? medicalTests : [];
    medicine = Array.isArray(medicine) ? medicine : [];

    const pool = await poolPromise;
    connection = await pool.getConnection();

    const result = await connection.execute(
      `
      BEGIN
        get_doctor_next_patient(
          p_doc_id        => :doc_id,
          p_receiptno     => :receiptno,
          p_remarks       => :remarks,
          p_primary_diag  => :primary_diag,
          p_medical_tests => :medical_tests,
          p_treatment     => :treatment,
          p_medical_plan  => :medical_plan,
          p_medicine      => :medicine,
          retval          => :cursor1
        );
      END;
      `,
      {
        doc_id: doctorId,
        receiptno: receiptNo,
        remarks: remarks,

        // ===== ORACLE COLLECTION BIND =====
        primary_diag: {
          dir: oracledb.BIND_IN,
          val: primaryDiagnosis,
          type: "TY_MEDICINE", // ⚠️ Schema type check
        },

        medical_tests: {
          dir: oracledb.BIND_IN,
          val: medicalTests,
          type: "TY_MEDICINE",
        },

        // STRING BIND (Correct)
        treatment: treatment,

        medical_plan: medicalPlan,

        medicine: {
          dir: oracledb.BIND_IN,
          val: medicine,
          type: "TY_MEDICINE",
        },

        cursor1: {
          dir: oracledb.BIND_OUT,
          type: oracledb.CURSOR,
        },
      },
      {
        outFormat: oracledb.OUT_FORMAT_OBJECT,
        autoCommit: true,
      },
    );

    // ================= READ CURSOR =================
    const rs = result.outBinds.cursor1;
    const rows = await rs.getRows(1); // Only 1 patient expected
    await rs.close();

    const currentPatient = rows[0] || null;
    console.log(currentPatient, "<<<<<<<<<<<<<<<<<<<<<<");

    // ================= SOCKET EMIT =================

    // const io = req.app.get("io");
    // io.emit("QUEUE_UPDATED", {
    //   type: "NEXT_PATIENT",
    //   doctorId,
    //   patientToken: currentPatient?.TOKENNO_1,
    //   doctorName: currentPatient?.DOCTOR_NAME,
    //   roomNo: currentPatient?.ROOM_NO,
    //   pronounceName: currentPatient?.PRONOUNCE_NAME,
    // });

    const facultyId = await getDoctorFacultyId(connection, doctorId);
    const screenIds = await getScreensForFaculty(connection, facultyId);

    // if (currentPatient && screenId) {
    const io = req.app.get("io");
    
    const payload = {
      type: "NEXT_PATIENT",
      doctorId,
      patientToken: currentPatient?.TOKENNO_1,
      doctorName: currentPatient?.DOCTOR_NAME,
      roomNo: currentPatient?.ROOM_NO,
      pronounceName: currentPatient?.PRONOUNCE_NAME,
    };

    // ✅ Har screen ko alag emit karo
    screenIds.forEach((sid) => {
      io.to(`screen_${sid}`).emit("QUEUE_UPDATED", { ...payload , screenId: parseInt(sid), });
      console.log(`📡 Emitted to screen_${sid}`);
    });

    console.log(
      `📡 Emitted to screen_${screenIds} for doctor ${doctorId} which has faculty id ${facultyId}`,
    );
    // }

    res.json({
      success: true,
      currentPatient,
    });
  } catch (err) {
    console.error("getDoctorNextPatient error:", err);

    res.status(500).json({
      success: false,
      message: "Failed to fetch next patient",
      error: err.message,
    });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (e) {
        console.error("Connection close error:", e);
      }
    }
  }
};

// ------- NEXT PATIENT SKIP API with SOCKET { Skip Api } ------------------
const getDoctorNextPatientSkip = async (req, res) => {
  let connection;

  try {
    let { doctorId, receiptNo } = req.body;

    // ================= NORMALIZE STRINGS =================
    const normalizeString = (val) =>
      typeof val === "string" && val.trim() !== "" ? val.trim() : null;

    receiptNo = normalizeString(receiptNo);

    const pool = await poolPromise;
    connection = await pool.getConnection();

    const result = await connection.execute(
      `
      BEGIN
        get_doctor_next_patient_skip(
          p_doc_id    => :doc_id,
          p_receiptno => :receiptno,
          retval      => :cursor1
        );
      END;
      `,
      {
        doc_id: doctorId,
        receiptno: receiptNo,

        // OUT cursor
        cursor1: {
          dir: oracledb.BIND_OUT,
          type: oracledb.CURSOR,
        },
      },
      {
        outFormat: oracledb.OUT_FORMAT_OBJECT,
        autoCommit: true,
      },
    );

    // ================= READ CURSOR =================
    const rs = result.outBinds.cursor1;
    const rows = await rs.getRows(1); // Only 1 patient expected
    await rs.close();

    const nextPatient = rows[0] || null;
    // console.log(nextPatient, "<<<<<<<<<<<<<<<< NEXT SKIP PATIENT");

    // ================= SOCKET EMIT =================

    const io = req.app.get("io");
    const payload = {
      type: "NEXT_PATIENT_SKIP",
      doctorId,
      patientToken: nextPatient?.TOKENNO_1,
      doctorName: nextPatient?.DOCTOR_NAME,
      pronounceName: nextPatient?.PRONOUNCE_NAME,
      roomNo: nextPatient?.ROOM_NO,
    };
    await emitToScreens(connection, io, doctorId, payload);

    res.json({
      success: true,
      nextPatient,
    });
  } catch (err) {
    console.error("getDoctorNextPatientSkip error:", err);

    res.status(500).json({
      success: false,
      message: "Failed to fetch next patient (skip)",
      error: err.message,
    });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (e) {
        console.error("Connection close error:", e);
      }
    }
  }
};

// ------- NEXT PATIENT QUEUE API with SOCKET { kaam ki nahi he } ------------------
const getDoctorNextPatientQueue = async (req, res) => {
  let connection;

  try {
    let {
      doctorId,
      receiptNo,
      remarks,
      primaryDiagnosis,
      medicalTests,
      treatment,
    } = req.body;

    // ================= NORMALIZE STRINGS =================
    const normalizeString = (val) =>
      typeof val === "string" && val.trim() !== "" ? val.trim() : null;

    receiptNo = normalizeString(receiptNo);
    remarks = normalizeString(remarks);
    treatment = normalizeString(treatment);

    // ================= ENSURE ARRAYS =================
    primaryDiagnosis = Array.isArray(primaryDiagnosis) ? primaryDiagnosis : [];
    medicalTests = Array.isArray(medicalTests) ? medicalTests : [];

    const pool = await poolPromise;
    connection = await pool.getConnection();

    // ================= CALL PROCEDURE =================
    const result = await connection.execute(
      `
      BEGIN
        get_doctor_next_patient_queue(
          p_doc_id        => :doc_id,
          p_receiptno     => :receiptno,
          p_remarks       => :remarks,
          p_primary_diag  => :primary_diag,
          p_medical_tests => :medical_tests,
          p_treatment     => :treatment,
          retval          => :cursor1
        );
      END;
      `,
      {
        doc_id: doctorId,
        receiptNo: receiptNo,
        remarks: remarks,

        // ===== ORACLE COLLECTION BIND =====
        primary_diag: {
          dir: oracledb.BIND_IN,
          val: primaryDiagnosis,
          type: "TY_MEDICINE",
        },

        medical_tests: {
          dir: oracledb.BIND_IN,
          val: medicalTests,
          type: "TY_MEDICINE",
        },

        // STRING BIND
        treatment: treatment,

        cursor1: {
          dir: oracledb.BIND_OUT,
          type: oracledb.CURSOR,
        },
      },
      {
        outFormat: oracledb.OUT_FORMAT_OBJECT,
        autoCommit: true,
      },
    );

    // ================= READ CURSOR =================
    const rs = result.outBinds.cursor1;
    const rows = await rs.getRows(1); // Only 1 patient expected
    await rs.close();

    const nextPatient = rows[0] || null;
    console.log(
      nextPatient,
      "<<<<<<<<<<<<<<<< NEXT Skip Call Api PATIENT QUEUE",
    );

    // ================= SOCKET EMIT =================

    const io = req.app.get("io");
    const payload = {
      type: "NEXT_PATIENT_QUEUE",
      doctorId,
      patientToken: nextPatient?.TOKENNO_1,
      doctorName: nextPatient?.DOCTOR_NAME,
    };
    await emitToScreens(connection, io, doctorId, payload);

    res.json({
      success: true,
      nextPatient,
    });
  } catch (err) {
    console.error("getDoctorNextPatientQueue error:", err);

    res.status(500).json({
      success: false,
      message: "Failed to fetch next patient from queue",
      error: err.message,
    });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (e) {
        console.error("Connection close error:", e);
      }
    }
  }
};

// ------- CANCEL ALL PATIENTS API ------------------
const cancelAllDoctorPatients = async (req, res) => {
  let connection;

  try {
    let { doctorId, receiptNo } = req.body;
    let { action = "CANCEL" } = req.query;

    const normalizeString = (val) =>
      typeof val === "string" && val.trim() !== "" ? val.trim() : null;

    receiptNo = normalizeString(receiptNo);

    // Validate action
    if (!["CANCEL", "RESTORE"].includes(action.toUpperCase())) {
      return res.status(400).json({
        success: false,
        message: "Invalid action. Use CANCEL or RESTORE",
      });
    }

    const pool = await poolPromise;
    connection = await pool.getConnection();

    await connection.execute(
      `
      BEGIN
        doctor_patient_cancel_all(
          p_doc_id    => :doc_id,
          p_receiptno => :receiptno,
          p_action    => :action
        );
      END;
      `,
      {
        doc_id: doctorId,
        receiptno: receiptNo,
        action: action.toUpperCase(),
      },
      { autoCommit: true },
    );

    const isRestore = action.toUpperCase() === "RESTORE";
    console.log(
      isRestore ? "DOCTOR RESTORED:" : "ALL PATIENTS CANCELLED:",
      doctorId,
    );

    // SOCKET EMIT
    const io = req.app.get("io");

    const payload = {
      type: isRestore ? "DOCTOR_RESTORED" : "CANCEL_ALL_PATIENTS",
      doctorId,
    };
    await emitToScreens(connection, io, doctorId, payload);

    if (!isRestore) {
      io.emit("opdUpdated", {
        message: "New OPD Receipt Added",
        time: new Date(),
      });
    }

    res.json({
      success: true,
      message: isRestore
        ? "Doctor restored successfully"
        : "All patients cancelled successfully",
    });
  } catch (err) {
    console.error("cancelAllDoctorPatients error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to process request",
      error: err.message,
    });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (e) {
        console.error("Connection close error:", e);
      }
    }
  }
};

// ------- MANUAL TOKEN CALL BY TOKENNO API with SOCKET ------------------
const doctorCallTokenByNumber = async (req, res) => {
  let connection;

  try {
    let {
      doctorId,
      tokenNo,
      remarks,
      primaryDiagnosis,
      medicalTests,
      treatment,
      medicalPlan,
      medicine,
    } = req.body;

    if (!doctorId || !tokenNo) {
      return res.status(400).json({
        success: false,
        message: "doctorId and tokenNo required",
      });
    }

    // Normalize
    const normalizeString = (val) =>
      typeof val === "string" && val.trim() !== "" ? val.trim() : null;

    remarks = normalizeString(remarks);
    treatment = normalizeString(treatment);
    medicalPlan = normalizeString(medicalPlan);

    primaryDiagnosis = Array.isArray(primaryDiagnosis) ? primaryDiagnosis : [];
    medicalTests = Array.isArray(medicalTests) ? medicalTests : [];
    medicalPlan = normalizeString(medicalPlan);

    const pool = await poolPromise;
    connection = await pool.getConnection();

    const result = await connection.execute(
      `
      BEGIN
        doctor_call_specific_tokenno(
          p_doc_id        => :doc_id,
          p_tokenno       => :tokenno,
          p_remarks       => :remarks,
          p_primary_diag  => :primary_diag,
          p_medical_tests => :medical_tests,
          p_treatment     => :treatment,
              p_medical_plan  => :medical_plan,
          p_medicine      => :medicine,
          retval          => :cursor1
        );
      END;
      `,
      {
        doc_id: doctorId,
        tokenno: tokenNo,
        remarks: remarks,

        primary_diag: {
          dir: oracledb.BIND_IN,
          val: primaryDiagnosis,
          type: "TY_MEDICINE",
        },

        medical_tests: {
          dir: oracledb.BIND_IN,
          val: medicalTests,
          type: "TY_MEDICINE",
        },

        treatment: treatment,

        medical_plan: medicalPlan,

        medicine: {
          dir: oracledb.BIND_IN,
          val: medicine,
          type: "TY_MEDICINE",
        },

        cursor1: {
          dir: oracledb.BIND_OUT,
          type: oracledb.CURSOR,
        },
      },
      {
        outFormat: oracledb.OUT_FORMAT_OBJECT,
        autoCommit: true,
      },
    );

    const rs = result.outBinds.cursor1;
    const rows = await rs.getRows(1);
    await rs.close();

    const currentPatient = rows[0] || null;

    if (currentPatient) {
      const io = req.app.get("io");
      const payload = {
        type: "MANUAL_CALL_TOKEN",
        doctorId,
        patientToken: currentPatient.TOKENNO_1,
        doctorName: currentPatient.DOCTOR_NAME,
        pronounceName: currentPatient?.PRONOUNCE_NAME,
        roomNo: currentPatient?.ROOM_NO,
      };
      await emitToScreens(connection, io, doctorId, payload);
    }

    res.json({
      success: true,
      currentPatient,
    });
  } catch (err) {
    console.error("doctorCallTokenByNumber error:", err);

    res.status(500).json({
      success: false,
      message: "Failed to call token manually",
      error: err.message,
    });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (e) {
        console.error("Connection close error:", e);
      }
    }
  }
};

// ------- REPEAT CALL  PATIENT BY STATUS API with SOCKET ------------------
const repeatCallPatient = async (req, res) => {
  let connection;
  try {
    const pool = await poolPromise;
    connection = await pool.getConnection();

    const { doctorId, doctorName, patientToken } = req.body;
    // console.log(doctorId, "docotr id");
    // console.log(doctorName, "doctorName");
    // console.log(patientToken, "patient Token");

    const io = req.app.get("io");

    const pronounceName = await getPronounceNameByDoctorId(
      connection,
      doctorId,
    );
    const roomNum = await getRoomNoByDoctorId(connection, doctorId);

    const payload = {
      type: "REPEAT_CALL",
      doctorId,
      patientToken: patientToken,
      doctorName: doctorName,
      pronounceName: pronounceName,
      roomNo: roomNum,
    };
    await emitToScreens(connection, io, doctorId, payload);

    // console.log(`📡 Emitted to screen_${screenIds} for doctor ${doctorId}`);

    res.json({
      success: true,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  } finally {
    if (connection) await connection.close();
  }
};

// ---------  Active Consultants api -------------

const getActiveConsultants = async (req, res) => {
  let connection;

  try {
    const pool = await poolPromise;
    connection = await pool.getConnection();

    const result = await connection.execute(
      `
      BEGIN
        get_active_consultants(
          :cursor
        );
      END;
      `,
      {
        cursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR },
      },
      {
        outFormat: oracledb.OUT_FORMAT_OBJECT,
      },
    );

    // ===== READ CURSOR =====
    const resultSet = result.outBinds.cursor;
    const rows = await resultSet.getRows();
    await resultSet.close();

    res.status(200).json({
      status: 200,
      count: rows.length,
      data: rows,
    });
  } catch (err) {
    console.error("getActiveConsultants error:", err);

    res.status(500).json({
      status: 500,
      message: "Failed to fetch consultants",
      error: err.message,
    });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error("Connection close error:", err);
      }
    }
  }
};

// ------- ADD PATIENT VITALS API --------------------
const addPatientVitals = async (req, res) => {
  let connection;

  try {
    const {
      receiptNo,
      bloodPressure,
      bloodSugar,
      weight,
      height,
      temperature,
      pulse,
      createdBy,
    } = req.body;

    // ================= NORMALIZE STRINGS =================
    const normalize = (val) => (val && val.trim() !== "" ? val.trim() : null);

    const p_receiptno = normalize(receiptNo);
    const p_blood_pressure = normalize(bloodPressure);
    const p_blood_sugar = normalize(bloodSugar);
    const p_weight = normalize(weight);
    const p_height = normalize(height);
    const p_temperature = normalize(temperature);
    const p_pulse = normalize(pulse);
    const p_created_by = normalize(createdBy);

    if (!p_receiptno) {
      return res.status(400).json({
        success: false,
        message: "receiptNo is required",
      });
    }

    const pool = await poolPromise;
    connection = await pool.getConnection();

    // ================= CALL PROCEDURE =================
    const result = await connection.execute(
      `
      BEGIN
        add_edit_patient_vitals(
          p_receiptno      => :receiptNo,
          p_blood_pressure => :bloodPressure,
          p_blood_sugar    => :bloodSugar,
          p_weight         => :weight,
          p_height         => :height,
          p_temperature    => :temperature,
          p_pulse          => :pulse,
          p_created_by     => :createdBy,
          p_action         => :action
        );
      END;
      `,
      {
        receiptNo: p_receiptno,
        bloodPressure: p_blood_pressure,
        bloodSugar: p_blood_sugar,
        weight: p_weight,
        height: p_height,
        temperature: p_temperature,
        pulse: p_pulse,
        createdBy: p_created_by,
        action: { dir: oracledb.BIND_OUT, type: oracledb.STRING },
      },
      {
        autoCommit: true,
      },
    );

    const action = result.outBinds.action;

    res.status(200).json({
      success: true,
      message:
        action === "UPDATED"
          ? "Patient vitals updated successfully"
          : "Patient vitals added successfully",
    });
  } catch (err) {
    console.error("addPatientVitals error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to add patient vitals",
      error: err.message,
    });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (e) {
        console.error("Connection close error:", e);
      }
    }
  }
};

// old stop api

const doctorStop = async (req, res) => {
  let connection;
  try {
    let {
      doctorId,
      receiptNo,
      breakMessage,
      remarks,
      primaryDiagnosis,
      medicalTests,
      treatment,
      medicalPlan,
      medicine,
    } = req.body;

    const normalizeString = (val) =>
      typeof val === "string" && val.trim() !== "" ? val.trim() : null;

    receiptNo = normalizeString(receiptNo);
    remarks = normalizeString(remarks);
    treatment = normalizeString(treatment);
    medicalPlan = normalizeString(medicalPlan);
    breakMessage = normalizeString(breakMessage) || "On Break";

    primaryDiagnosis = Array.isArray(primaryDiagnosis) ? primaryDiagnosis : [];
    medicalTests = Array.isArray(medicalTests) ? medicalTests : [];
    medicine = Array.isArray(medicine) ? medicine : [];

    const pool = await poolPromise;
    connection = await pool.getConnection();

    await connection.execute(
      `
      BEGIN
        doctor_stop_break(
          p_doc_id        => :doc_id,
          p_receiptno     => :receiptno,
          p_message       => :message,
          p_remarks       => :remarks,
          p_primary_diag  => :primary_diag,
          p_medical_tests => :medical_tests,
          p_treatment     => :treatment,
          p_medical_plan  => :medical_plan,
          p_medicine      => :medicine
        );
      END;
      `,
      {
        doc_id: doctorId,
        receiptno: receiptNo,
        message: breakMessage,
        remarks: remarks,
        primary_diag: {
          dir: oracledb.BIND_IN,
          val: primaryDiagnosis,
          type: "TY_MEDICINE",
        },
        medical_tests: {
          dir: oracledb.BIND_IN,
          val: medicalTests,
          type: "TY_MEDICINE",
        },
        treatment: treatment,
        medical_plan: medicalPlan,
        medicine: {
          dir: oracledb.BIND_IN,
          val: medicine,
          type: "TY_MEDICINE",
        },
      },
      { autoCommit: true },
    );

    // Socket emit
    const io = req.app.get("io");
    const payload = {
      type: "DOCTOR_ON_BREAK",
      doctorId,
    };
    await emitToScreens(connection, io, doctorId, payload);

    res.json({ success: true });
  } catch (err) {
    console.error("doctorStop error:", err);
    res.status(500).json({
      success: false,
      error: err.message,
    });
  } finally {
    if (connection) await connection.close().catch(() => {});
  }
};

// ----  doctorResumeBreak --------

const doctorResumeBreak = async (req, res) => {
  let connection;
  try {
    const { doctorId } = req.body;

    if (!doctorId) {
      return res.status(400).json({
        success: false,
        message: "doctorId is required",
      });
    }

    const pool = await poolPromise;
    connection = await pool.getConnection();

    await connection.execute(
      `
      BEGIN
        doctor_resume_break(
          p_doc_id => :doc_id
        );
      END;
      `,
      { doc_id: doctorId },
      { autoCommit: true },
    );

    const io = req.app.get("io");
    const payload = { type: "DOCTOR_RESUMED", doctorId };
    await emitToScreens(connection, io, doctorId, payload);

    res.json({ success: true, message: "Break resumed successfully" });
  } catch (err) {
    console.error("doctorResumeBreak error:", err);
    res.status(500).json({
      success: false,
      error: err.message,
    });
  } finally {
    if (connection) await connection.close().catch(() => {});
  }
};

const setDoctorRoom = async (req, res) => {
  let connection;

  try {
    const { doctorId, roomNo } = req.body;

    if (!doctorId || !roomNo) {
      return res.status(400).json({
        success: false,
        message: "doctorId and roomNo required",
      });
    }

    const pool = await poolPromise;
    connection = await pool.getConnection();

    await connection.execute(
      `
      BEGIN
        set_consultant_room(
          p_consultant_id => :consultant_id,
          p_room_no       => :room_no,
          p_updated_by    => :updated_by
        );
      END;
      `,
      {
        consultant_id: doctorId,
        room_no: roomNo,
        updated_by: doctorId,
      },
      {
        autoCommit: true,
      },
    );

    return res.json({
      success: true,
      message: "Room updated successfully",
    });
  } catch (err) {
    console.error("setDoctorRoom error:", err);

    return res.status(500).json({
      success: false,
      error: err.message,
    });
  } finally {
    if (connection) {
      await connection.close().catch(() => {});
    }
  }
};

const getDoctorRoom = async (req, res) => {
  let connection;
  try {
    const { doctorId } = req.query;

    if (!doctorId) {
      return res.status(400).json({
        success: false,
        message: "doctorId is required",
      });
    }

    const pool = await poolPromise;
    connection = await pool.getConnection();

    const result = await connection.execute(
      `SELECT NVL(room_no, 'Room Not Assigned') AS room_no
       FROM consultant_room
       WHERE consultant_id = :id`,
      { id: doctorId },
      { outFormat: oracledb.OUT_FORMAT_OBJECT },
    );

    const roomNo = result.rows[0]?.ROOM_NO || "Room Not Assigned";

    res.json({
      success: true,
      doctorId,
      roomNo,
    });
  } catch (err) {
    console.error("getDoctorRoom error:", err);
    res.status(500).json({
      success: false,
      error: err.message,
    });
  } finally {
    if (connection) await connection.close().catch(() => {});
  }
};

const getPatientHistory = async (req, res) => {
  let connection;

  console.log(req.query, "<<<<<<<<<< req.query");

  try {
    let { doctorId, mrNum } = req.query;

    // Normalize strings
    const normalizeString = (val) =>
      typeof val === "string" && val.trim() !== "" ? val.trim() : null;

    mrNum = normalizeString(mrNum);
    doctorId = doctorId ? doctorId : null;

    if (!mrNum) {
      return res.status(400).json({
        success: false,
        message: "MR Number is required",
      });
    }

    const pool = await poolPromise;
    connection = await pool.getConnection();

    const result = await connection.execute(
      `
      BEGIN
        get_patient_history(
          p_mrno      => :mrNum,
          p_doctor_id => :doctorId,
          p_result    => :cursor1,
          p_last_visit => :cursor2
        );
      END;
      `,
      {
        mrNum: mrNum,
        doctorId: doctorId,
        cursor1: {
          dir: oracledb.BIND_OUT,
          type: oracledb.CURSOR,
        },
        cursor2: {
          // ✅ Naya last visit cursor
          dir: oracledb.BIND_OUT,
          type: oracledb.CURSOR,
        },
      },
      {
        outFormat: oracledb.OUT_FORMAT_OBJECT,
        autoCommit: true,
      },
    );

    // Read ALL rows from cursor
    // const rs = result.outBinds.cursor1;
    // const allRows = await rs.getRows();
    // await rs.close();

    // ✅ Poori history
    const rs1 = result.outBinds.cursor1;
    const allRows = await rs1.getRows();
    await rs1.close();

    // ✅ Last visit
    const rs2 = result.outBinds.cursor2;
    const lastVisitRows = await rs2.getRows();
    await rs2.close();

    console.log(`${allRows.length} history records found for MR# ${mrNum}`);

    // Send EXACT database response as-is
    res.json({
      success: true,
      data: allRows, // Direct database rows, no transformation
      totalVisits: allRows.length,
      lastVisit: lastVisitRows[0] || null,
    });
  } catch (err) {
    console.error("getPatientHistory error:", err);

    res.status(500).json({
      success: false,
      message: "Failed to fetch patient history",
      error: err.message,
    });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (e) {
        console.error("Connection close error:", e);
      }
    }
  }
};

// ------- GET PATIENT VITALS API --------------------
const getPatientVitals = async (req, res) => {
  let connection;

  try {
    const { receiptNo } = req.params; // or req.query.receiptNo if using query param

    if (!receiptNo || receiptNo.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "receiptNo is required",
      });
    }

    const pool = await poolPromise;
    connection = await pool.getConnection();

    const result = await connection.execute(
      `
      BEGIN
        get_patient_vitals(
          p_receiptno => :receiptNo,
          p_cursor    => :cursor
        );
      END;
      `,
      {
        receiptNo: receiptNo.trim(),
        cursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR },
      },
    );

    const cursor = result.outBinds.cursor;
    const rows = await cursor.getRows();
    const metaData = cursor.metaData;
    await cursor.close();

    // Map rows to objects using column names
    const vitals =
      rows.length > 0
        ? rows.map((row) => {
            const obj = {};
            metaData.forEach((col, i) => {
              obj[col.name] = row[i];
            });
            return obj;
          })
        : null;

    res.status(200).json({
      success: true,
      data: vitals, // null agar record nahi mila
    });
  } catch (err) {
    console.error("getPatientVitals error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch patient vitals",
      error: err.message,
    });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (e) {
        console.error("Connection close error:", e);
      }
    }
  }
};

// ------- GET ACTIVE CONSULTANTS API ------------------
const getActiveConsultants1 = async (req, res) => {
  let connection;
  const { loggedIn } = req.query;

  try {
    const pool = await poolPromise;
    connection = await pool.getConnection();

    const result = await connection.execute(
      `BEGIN get_active_consultants1(:cursor); END;`,
      { cursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR } },
      { outFormat: oracledb.OUT_FORMAT_OBJECT },
    );

    const resultSet = result.outBinds.cursor;
    let rows = await resultSet.getRows();
    await resultSet.close();

    // ← yeh filter add karo
    if (loggedIn === "1") {
      rows = rows.filter((r) => r.IS_LOGGED_IN === 1);
    }

    res.status(200).json({ status: 200, count: rows.length, data: rows });
  } catch (err) {
    console.error("getActiveConsultants error:", err);

    res.status(500).json({
      status: 500,
      message: "Failed to fetch consultants",
      error: err.message,
    });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error("Connection close error:", err);
      }
    }
  }
};

// Screen se patients — mapping auto read karke filter lagao
const getTodayDoctorPatientsByScreen = async (req, res) => {
  let connection;
  try {
    const { patientStatus, screenId } = req.query;

    const pool = await poolPromise;
    connection = await pool.getConnection();

    let facultyId = null;

    if (screenId) {
      const mapResult = await connection.execute(
        `SELECT LISTAGG(faculty_id, ',')
                WITHIN GROUP (ORDER BY faculty_id) AS faculty_ids
         FROM screen_faculty_map
         WHERE screen_id = :screenId`,
        { screenId },
        { outFormat: oracledb.OUT_FORMAT_OBJECT },
      );

      const mapped = mapResult.rows[0]?.FACULTY_IDS;
      facultyId = mapped && mapped.trim() !== "" ? mapped : null;
    }

    const result = await connection.execute(
      `BEGIN get_today_doctor_patients1(:VPatientStatus, :VFacultyId, :cursor); END;`,
      {
        VPatientStatus: patientStatus ? Number(patientStatus) : null,
        VFacultyId: facultyId,
        cursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR },
      },
      { outFormat: oracledb.OUT_FORMAT_OBJECT },
    );

    const rs = result.outBinds.cursor;
    const rows = await rs.getRows();
    await rs.close();

    res.status(200).json({
      status: 200,
      count: rows.length,
      screenId: screenId || null,
      facultyFilter: facultyId,
      data: rows,
    });
  } catch (err) {
    res.status(500).json({ status: 500, error: err.message });
  } finally {
    if (connection) await connection.close().catch(() => {});
  }
};



// ------- GET PATIENT FULL DETAILS API (by receiptno) --------------------
const getPatientFullDetails = async (req, res) => {
  let connection;

  try {
    const { receiptNo } = req.params; // /opd/patient-full-details/:receiptNo

    if (!receiptNo || receiptNo.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "receiptNo is required",
      });
    }

    const pool = await poolPromise;
    connection = await pool.getConnection();

    const result = await connection.execute(
      `
      BEGIN
        get_patient_full_details(
          p_receiptno => :receiptNo,
          retval      => :cursor
        );
      END;
      `,
      {
        receiptNo: receiptNo.trim(),
        cursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR },
      },
      { outFormat: oracledb.OUT_FORMAT_OBJECT },
    );

    const rs = result.outBinds.cursor;
    const rows = await rs.getRows();
    await rs.close();

    if (!rows || rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No patient found for this receiptNo",
        data: null,
      });
    }

    res.status(200).json({
      success: true,
      data: rows[0], // ek hi receiptno ka ek hi record hota hai
    });
  } catch (err) {
    console.error("getPatientFullDetails error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch patient full details",
      error: err.message,
    });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (e) {
        console.error("Connection close error:", e);
      }
    }
  }
};




const getPatientLabReports = async (req, res) => {

  let connection;

  console.log(req.query, "<<<<<<<<<< req.query");

  try {
    let { doctorId, mrNum } = req.query;

    // Normalize strings
    const normalizeString = (val) =>
      typeof val === "string" && val.trim() !== "" ? val.trim() : null;

    mrNum = normalizeString(mrNum);
    doctorId = doctorId ? doctorId : null;

    if (!mrNum) {
      return res.status(400).json({
        success: false,
        message: "MR Number is required",
      });
    }

    const pool = await poolPromise;
    connection = await pool.getConnection();

    const result = await connection.execute(
      `
      BEGIN
        get_patient_history_labs(
          p_mrno      => :mrNum,
          p_doctor_id => :doctorId,
          p_labs    => :cursor1
        );
      END;
      `,
      {
        mrNum: mrNum,
        doctorId: doctorId,
        cursor1: {
          dir: oracledb.BIND_OUT,
          type: oracledb.CURSOR,
        },
      },
      {
        outFormat: oracledb.OUT_FORMAT_OBJECT,
        autoCommit: true,
      },
    );

    // ✅ Poori history
    const rs1 = result.outBinds.cursor1;
    const allRows = await rs1.getRows();
    await rs1.close();
    const labReports = groupLabRows(allRows);

    console.log(`${allRows.length} lab records found for MR# ${mrNum}`);

    // Send EXACT database response as-is
    res.json({
      success: true,
      data: labReports, 
    });
  } catch (err) {
    console.error("getPatientHistory error:", err);

    res.status(500).json({
      success: false,
      message: "Failed to fetch patient history",
      error: err.message,
    });

  } 
  finally {
    if (connection) {
      try {
        await connection.close();
      } catch (e) {
        console.error("Connection close error:", e);
      }
    }
  }

};


// ------- GET PATIENT HISTORY API (sirf lab reports) -------------------------
// Doctor backend (opd.controller.js) aur patient backend, dono mein yehi function lagao.
// Ye API ab sirf lab reports deti hai (get_patient_history_labs). Visits wala proc yahan call nahi hota.
// doctorId diya ho to sirf us doctor ki order ki hui labs; na diya ho to MR ki saari labs.

// Flat lab rows -> [{ receipt, REPORTS: [{ report head, TESTS: [...] }] }]
const groupLabRows = (rows) => {
  const receipts = new Map();

  for (const r of rows) {
    if (!receipts.has(r.LAB_RECEIPTNO)) {
      receipts.set(r.LAB_RECEIPTNO, {
        LAB_RECEIPTNO: r.LAB_RECEIPTNO,
        LAB_DATE: r.LAB_DATE,
        PATIENT_NAME: r.LAB_PATIENT_NAME,
        ZERO_CONTACT: r.ZERO_CONTACT === 1,
        ORDERED_BY_ID: r.ORDERED_BY_ID,
        ORDERED_BY_NAME: r.ORDERED_BY_NAME,
        AGE: r.AGE,
        MR_NNUM: r.MRNO,
        reports: new Map(),
      });
    }

    const rec = receipts.get(r.LAB_RECEIPTNO);
    const key = `${r.LAB_NO}||${r.REPORTHEAD}`;

    if (!rec.reports.has(key)) {
      rec.reports.set(key, {
        LAB_NO: r.LAB_NO,
        REPORTHEAD: r.REPORTHEAD,
        REPORT_DATE: r.REPORT_DATE,
        R_TIME: r.R_TIME,
        TESTS: [],
      });
    }

    rec.reports.get(key).TESTS.push({
      S_NO: r.S_NO,
      TESTNAME: r.TESTNAME,
      RES: r.RES,
      UNITS: r.UNITS,
      NV: r.NV,
    });
  }

  return [...receipts.values()].map(({ reports, ...rec }) => ({
    ...rec,
    REPORTS: [...reports.values()],
  }));
};





module.exports = {
  getTodayDoctorPatients,
  getDoctorNextPatient,
  getDoctorPatientsWithStats,
  cancelAllDoctorPatients,
  getDoctorNextPatientQueue,
  getDoctorNextPatientSkip,
  doctorCallTokenByNumber,
  repeatCallPatient,
  getActiveConsultants,
  addPatientVitals,
  doctorStop,
  setDoctorRoom,
  getDoctorRoom,
  getPatientHistory,
  getPatientVitals,
  getActiveConsultants1,
  doctorResumeBreak,
  getTodayDoctorPatientsByScreen,
  getPatientFullDetails,
  getPatientLabReports
};
