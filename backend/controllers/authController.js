const oracledb = require("oracledb");
const jwt = require("jsonwebtoken");
const poolPromise = require("../database.js");
// const {
//   getDoctorFacultyId,
//   getScreensForFaculty,
// } = require("../utills/helperFunc.js");

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

//                END

const unifiedLogin = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      success: false,
      message: "Username and password are required",
    });
  }

  let connection;

  try {
    const pool = await poolPromise;
    connection = await pool.getConnection();

    // ================== 1️⃣ TRY USER LOGIN ==================
    const userResult = await connection.execute(
      `
      BEGIN
        user_login1(
          :username,
          :password,
          :status,
          :message,
          :userrole,
          :userid
        );
      END;
      `,
      {
        username,
        password,
        status: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
        message: {
          dir: oracledb.BIND_OUT,
          type: oracledb.STRING,
          maxSize: 200,
        },
        userrole: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
        userid: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
      },
    );

    const { status, message, userrole, userid } = userResult.outBinds;

    //  Admin / Screen success
    if (status === 1) {
      let role = "";

      if (userrole === 1) {
        role = "Admin";
      } else {
        role = "screen";
      }

      const token = jwt.sign(
        { id: userid, username, role },
        process.env.JWT_SECRET,
        {
          expiresIn: "30d",
        },
      );

      return res.status(200).json({
        success: true,
        message,
        role,
        userId: userid,
        token,
      });
    }

    // ================== 2️⃣ HMS MEDICAL ASSISTANT ==================
    const hmsResult = await connection.execute(
      `BEGIN
      hms_user_login(:username,:password,:status,:message,:userlevel,  :isprevioussessionopen);
   END;`,
      {
        username,
        password,
        status: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
        message: {
          dir: oracledb.BIND_OUT,
          type: oracledb.STRING,
          maxSize: 200,
        },
        userlevel: {
          dir: oracledb.BIND_OUT,
          type: oracledb.STRING,
          maxSize: 50,
        },
        isprevioussessionopen: {
          dir: oracledb.BIND_OUT,
          type: oracledb.NUMBER,
          maxSize: 10,
        },
      },
    );

    const {
      status: hmsStatus,
      message: hmsMessage,
      userlevel,
      isprevioussessionopen = null,
    } = hmsResult.outBinds;

    if (hmsStatus === 1) {
      const token = jwt.sign(
        { username, role: userlevel },
        process.env.JWT_SECRET,
        { expiresIn: "30d" },
      );

      return res.json({
        success: true,
        role: userlevel,
        message: hmsMessage,
        token,
        isprevioussessionopen,
      });
    }

    // ================== 2️⃣ TRY DOCTOR LOGIN ==================
    const doctorResult = await connection.execute(
      `
      BEGIN
        get_doctor_login(
          :username,
          :password,
          :cursor
        );
      END;
      `,
      {
        username,
        password,
        cursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR },
      },
      {
        outFormat: oracledb.OUT_FORMAT_OBJECT,
      },
    );

    const rs = doctorResult.outBinds.cursor;
    const rows = await rs.getRows(1);
    await rs.close();

    if (rows.length > 0) {
      const doctor = rows[0];

      //  Already logged in check
      if (doctor.ID === -1) {
        return res.status(403).json({
          success: false,
          message: "Doctor already logged in on another device",
        });
      }

      if (doctor.ID === -2) {
        return res.status(400).json({
          success: false,
          message: "Multiple usernames found with the same credentials.",
        });
      }

      //  Invalid case
      if (!doctor.ID) {
        return res.status(401).json({
          success: false,
          message: "Invalid username or password",
        });
      }

      const token = jwt.sign(
        {
          doctorId: doctor.ID,
          name: doctor.NAME,
          role: "doctor",
          faculty: doctor.FACULTY,
        },
        process.env.JWT_SECRET,
        { expiresIn: "30d" },
      );

      const io = req.app.get("io");

      const payload = {
        type: "LOGIN_DOCOTR",
        doctorId: doctor.ID,
      };

      await emitToScreens(connection, io, doctor.ID, payload);

      return res.status(200).json({
        success: true,
        message: "Doctor login successful",
        role: "doctor",
        doctorId: doctor.ID,
        doctorName: doctor.NAME,
        faculty: doctor.FACULTY,
        token,
      });
    }

    // ❌ Both failed
    return res.status(401).json({
      success: false,
      message: "Invalid username or password",
    });
  } catch (err) {
    console.error("Unified Login Error:", err);
    return res.status(500).json({
      success: false,
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

const logoutDoctor = async (req, res) => {
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

    const result = await connection.execute(
      `
      BEGIN
        doctor_logout(
          :doctorId,
          :status,
          :message
        );
      END;
      `,
      {
        doctorId,
        status: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
        message: {
          dir: oracledb.BIND_OUT,
          type: oracledb.STRING,
          maxSize: 200,
        },
      },
    );

    const { status, message } = result.outBinds;

    if (status === 1) {
      const io = req.app.get("io");
      const payload = {
        type: "LOGOUT_DOCTOR",
        doctorId: parseInt(doctorId),
      };

      await emitToScreens(connection, io, doctorId, payload);

      return res.status(200).json({
        success: true,
        message,
      });
    } else {
      return res.status(400).json({
        success: false,
        message,
      });
    }
  } catch (err) {
    console.error("Logout Error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: err.message,
    });
  } finally {
    if (connection) await connection.close();
  }
};

const forceLogoutDoctor = async (req, res) => {
  let connection;

  try {
 
    const { consultantId } = req.body;
    const adminSession = req.user?.username || "Admin";

    if (!consultantId) {
      return res.status(400).json({
        success: false,
        message: "consultantId is required",
      });
    }

    const pool = await poolPromise;
    connection = await pool.getConnection();

    const result = await connection.execute(
      `BEGIN
         force_logout_consultant(:cid, :admin, :status, :message);
       END;`,
      {
        cid: consultantId,
        admin: adminSession,
        status: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
        message: {
          dir: oracledb.BIND_OUT,
          type: oracledb.STRING,
          maxSize: 200,
        },
      },
    );

    const { status, message } = result.outBinds;

    if (status === 1) {
      // Same pattern jo tumhara logoutDoctor mein hai
      const io = req.app.get("io");

      const payload = {
        type: "FORCE_LOGOUT_DOCTOR",
        doctorId: parseInt(consultantId),
      };

      await emitToScreens(connection, io, consultantId, payload);

      io.emit(`${consultantId}`, {
        type: "FORCE_LOGOUT_DOCTOR", // naya type
        doctorId: consultantId,
      });

      return res.json({ success: true, message });
    }

    return res.status(400).json({ success: false, message });
  } catch (err) {
    console.error("forceLogoutDoctor error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: err.message,
    });
  } finally {
    if (connection) await connection.close().catch(() => {});
  }
};

module.exports = { unifiedLogin, logoutDoctor, forceLogoutDoctor };
