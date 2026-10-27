// controllers/ma.controller.js
// Medical Assistant (vitals) calling. Phase 1.
// Every action calls one stored procedure in the mmc schema (see db_scripts/02_mmc_objects.sql).
// The MA identity ALWAYS comes from the verified JWT (req.user.username), never from the request body.

const oracledb = require("oracledb");
const poolPromise = require("../database.js");

const OUT = { outFormat: oracledb.OUT_FORMAT_OBJECT };
const MA_ROOM = "ma";

// ---------- helpers ----------

// Read every row of a REF CURSOR out bind, then close it.
const readCursor = async (rs) => {
  if (!rs) return [];
  try {
    return await rs.getRows(5000);
  } finally {
    await rs.close();
  }
};

const norm = (v) => (v === undefined || v === null || String(v).trim() === "" ? null : String(v).trim());

const withConnection = async (res, fn) => {
  let connection;
  try {
    const pool = await poolPromise;
    connection = await pool.getConnection();
    await fn(connection);
  } catch (err) {
    console.error("MA controller error:", err);
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: "Server error", error: err.message });
    }
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

const getScreensForFaculty = async (connection, facultyId) => {
  if (facultyId === null || facultyId === undefined) return [];
  try {
    const r = await connection.execute(
      `SELECT screen_id FROM screen_faculty_map WHERE faculty_id = :facultyId`,
      { facultyId },
      OUT,
    );
    return r.rows.map((x) => x.SCREEN_ID);
  } catch {
    return [];
  }
};

// Sends MA_CALL_UPDATED to the Screen 5 rooms of the doctor's faculty and to the "ma" room
// (so other MA dashboards refresh). Does NOT use QUEUE_UPDATED, which belongs to the doctor flow.
const emitMaEvent = async (connection, io, type, row) => {
  if (!io || !row) return;
  try {
    const payload = {
      type, // CALL | REPEAT | SKIP | DONE | REMOVE
      receiptNo: row.RECEIPTNO,
      patientToken: row.TOKENNO,
      doctorId: row.CONSULTANTID,
      doctorName: row.DOCTOR_NAME,
      pronounceName: row.PRONOUNCE_NAME || row.DOCTOR_NAME,
      roomNo: row.ROOM_NO,
      maUser: row.VITAL_MA_USER,
      maName: row.MA_NAME || row.VITAL_MA_USER,
      counterNo: row.COUNTER_NO,
      vitalStatusId: row.VITAL_STATUS_ID,
    };

    io.to(MA_ROOM).emit("MA_CALL_UPDATED", payload);

    const screenIds = await getScreensForFaculty(connection, row.FACULTYID);
    screenIds.forEach((sid) => {
      io.to(`screen_${sid}`).emit("MA_CALL_UPDATED", { ...payload, screenId: parseInt(sid) });
    });
  } catch (err) {
    console.error("emitMaEvent error:", err);
  }
};

// Runs a procedure shaped like (…, p_result OUT, p_message OUT, retval OUT cursor).
const runAction = async (connection, proc, binds) => {
  const argList = Object.keys(binds).map((k) => `:${k}`).join(", ");
  const r = await connection.execute(
    `BEGIN ${proc}(${argList}, :res, :msg, :cur); END;`,
    {
      ...binds,
      res: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
      msg: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 200 },
      cur: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR },
    },
    OUT,
  );
  const rows = await readCursor(r.outBinds.cur);
  return { ok: r.outBinds.res === 1, message: r.outBinds.msg, row: rows[0] || null };
};

// Shared handler for the 6 action endpoints.
const handleAction = (proc, eventType, getBinds, validate) => async (req, res) => {
  await withConnection(res, async (connection) => {
    const invalid = validate ? validate(req) : null;
    if (invalid) return res.status(400).json({ success: false, message: invalid });

    const { ok, message, row } = await runAction(connection, proc, {
      u: req.user.username,
      ...getBinds(req),
    });

    if (!ok) return res.status(409).json({ success: false, message });

    await emitMaEvent(connection, req.app.get("io"), eventType, row);
    res.json({ success: true, message, patient: row });
  });
};

const needReceipt = (req) => (norm(req.body.receiptNo) ? null : "receiptNo is required");

// ---------- endpoints ----------

// GET /api/ma/board
const getBoard = async (req, res) => {
  await withConnection(res, async (connection) => {
    const r = await connection.execute(
      `BEGIN ma_get_board(:u, :me, :cur, :wait, :skip, :rem); END;`,
      {
        u: req.user.username,
        me: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR },
        cur: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR },
        wait: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR },
        skip: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR },
        rem: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR },
      },
      OUT,
    );
    const [me, current, waiting, skipped, removed] = await Promise.all([
      readCursor(r.outBinds.me),
      readCursor(r.outBinds.cur),
      readCursor(r.outBinds.wait),
      readCursor(r.outBinds.skip),
      readCursor(r.outBinds.rem),
    ]);
    res.json({
      success: true,
      me: me[0] || null,
      current: current[0] || null,
      waiting,
      skipped,
      removed,
    });
  });
};

// POST /api/ma/call-next   body: { consultantId? }
const callNext = handleAction("ma_call_next", "CALL", (req) => ({
  doc: norm(req.body.consultantId),
}));

// POST /api/ma/call   body: { receiptNo }   (Select Token / Recall / Restore)
const callSpecific = handleAction(
  "ma_call_specific",
  "CALL",
  (req) => ({ rcpt: norm(req.body.receiptNo) }),
  needReceipt,
);

// POST /api/ma/skip   body: { receiptNo }
const skip = handleAction("ma_skip", "SKIP", (req) => ({ rcpt: norm(req.body.receiptNo) }), needReceipt);

// POST /api/ma/repeat   body: { receiptNo }
const repeat = handleAction(
  "ma_repeat",
  "REPEAT",
  (req) => ({ rcpt: norm(req.body.receiptNo) }),
  needReceipt,
);

// POST /api/ma/remove   body: { receiptNo }
const remove = handleAction(
  "ma_remove",
  "REMOVE",
  (req) => ({ rcpt: norm(req.body.receiptNo) }),
  needReceipt,
);

// POST /api/ma/save-vitals   body: { receiptNo, bloodPressure, bloodSugar, weight, height, temperature, pulse }
// Saves vitals and marks the patient done in one transaction. Does not call the next patient.
const saveVitals = handleAction(
  "ma_save_vitals",
  "DONE",
  (req) => ({
    rcpt: norm(req.body.receiptNo),
    bp: norm(req.body.bloodPressure),
    sugar: norm(req.body.bloodSugar),
    weight: norm(req.body.weight),
    height: norm(req.body.height),
    temp: norm(req.body.temperature),
    pulse: norm(req.body.pulse),
  }),
  needReceipt,
);

// POST /api/ma/set-counter   body: { counterNo }   (the MA sets or changes their own counter)
const setCounter = async (req, res) => {
  await withConnection(res, async (connection) => {
    const counterNo = norm(req.body.counterNo);
    if (!counterNo) return res.status(400).json({ success: false, message: "counterNo is required" });
    if (counterNo.length > 20) {
      return res.status(400).json({ success: false, message: "counterNo must be 20 characters or less" });
    }
    const { ok, message, row } = await runAction(connection, "ma_set_counter", {
      u: req.user.username,
      counter: counterNo,
    });
    if (!ok) return res.status(409).json({ success: false, message });
    res.json({ success: true, message, counter: row });
  });
};

// GET /api/ma/screen-board?facultyIds=1,3     (public: used by Screen 5, like the other display endpoints)
const getScreenBoard = async (req, res) => {
  await withConnection(res, async (connection) => {
    const facultyIds = norm(req.query.facultyIds);
    if (facultyIds && !/^[0-9,\s]+$/.test(facultyIds)) {
      return res.status(400).json({ success: false, message: "facultyIds must be comma separated numbers" });
    }
    const r = await connection.execute(
      `BEGIN get_screen_ma_board(:f, :calling, :skipped, :docSkipped); END;`,
      {
        f: facultyIds ? facultyIds.replace(/\s/g, "") : null,
        calling: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR },
        skipped: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR },
        docSkipped: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR },
      },
      OUT,
    );
    const [calling, skipped, doctorSkipped] = await Promise.all([
      readCursor(r.outBinds.calling),
      readCursor(r.outBinds.skipped),
      readCursor(r.outBinds.docSkipped),
    ]);
    res.json({ success: true, calling, skipped, doctorSkipped });
  });
};

module.exports = {
  getBoard,
  callNext,
  callSpecific,
  skip,
  repeat,
  remove,
  saveVitals,
  setCounter,
  getScreenBoard,
  MA_ROOM,
};