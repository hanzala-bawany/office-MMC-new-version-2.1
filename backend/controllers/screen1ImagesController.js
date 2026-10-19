const oracledb = require("oracledb");
const poolPromise = require("../database.js");


const manageScreen1Images = async (req, res) => {
  
  let { action, status, id } = req.body || {};
  const file = req.file || null;
  let connection;

  try {
    const finalAction = (action || "").trim().toUpperCase();
    const validActions = ["ADD", "EDIT", "DELETE"];
    if (!validActions.includes(finalAction)) {
      return res.status(400).json({
        success: false,
        message: "Invalid action. Must be ADD, EDIT, or DELETE.",
      });
    }

    if ((finalAction === "EDIT" || finalAction === "DELETE") && !id) {
      return res.status(400).json({
        success: false,
        message: "ID is required for EDIT or DELETE.",
      });
    }

    // FIXED: safe conversion
    if (status !== undefined && status !== null && status !== "") {
      status = Number(String(status).trim());
    } else {
      status = null;
    }

    id = id ? String(id).trim() : null;

    let imageBlob = null;
    if (file && (finalAction === "ADD" || finalAction === "EDIT")) {
      imageBlob = file.buffer;
    }

    if (finalAction === "ADD" && !imageBlob) {
      return res.status(400).json({
        success: false,
        message: "Image file is required for ADD action.",
      });
    }

    const pool = await poolPromise;
    connection = await pool.getConnection();

    await connection.execute(
  `
  BEGIN
    manage_screen1images(
      p_action     => :action,
      p_id         => :id,
      p_image      => :image,
      p_createdby  => :createdby,
      p_status     => :status
    );
  END;
  `,
  {
    action: { val: finalAction, type: oracledb.STRING },

    id: id
      ? { val: String(id), type: oracledb.STRING }
      : { val: null, type: oracledb.STRING },  

    image: imageBlob
      ? { val: imageBlob, type: oracledb.BLOB }
      : { val: null, type: oracledb.BLOB },

    createdby: { val: "Admin", type: oracledb.STRING },

    status:
      status !== null
        ? { val: Number(status), type: oracledb.NUMBER }
        : { val: null, type: oracledb.NUMBER },
  },
  { autoCommit: false }
);


    res.status(200).json({
      success: true,
      message:
        finalAction === "ADD"
          ? "Image added successfully."
          : finalAction === "EDIT"
          ? "Image updated successfully."
          : "Image deleted successfully.",
    });
  } catch (err) {
    console.error("Error in manageScreen3Images:", err);

    if (connection) await connection.rollback().catch(() => {});

    res.status(500).json({
      success: false,
      message: "Something went wrong while processing request.",
      error: err.message,
    });
  } finally {
    if (connection) connection.close().catch(() => {});
  }
};


//============== GET ------------------------

const getScreen1Images = async (req, res) => {
  const { id, status } = req.query;
  let connection;

  try {
    const pool = await poolPromise;
    connection = await pool.getConnection();

    const result = await connection.execute(
      `
      BEGIN
        get_screen1images(
          p_id      => :id,
          p_status  => :status,
          p_result  => :cursor
        );
      END;
      `,
      {
        id: id || null,
        status: status ? Number(status) : null,
        cursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR },
      },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    const resultSet = result.outBinds.cursor;
    const rows = [];
    let fetchRows;
    const fetchSize = 100;

    do {
      fetchRows = await resultSet.getRows(fetchSize);
      for (let row of fetchRows) {
        if (row.IMAGE) {
          const lob = row.IMAGE;
          const chunks = [];
          // Promise se BLOB read
          await new Promise((resolve, reject) => {
            lob.on("data", (chunk) => chunks.push(chunk));
            lob.on("end", resolve);
            lob.on("error", reject);
          });
          const buffer = Buffer.concat(chunks);
          row.IMAGE = `data:image/png;base64,${buffer.toString("base64")}`;
        }
      }
      rows.push(...fetchRows);
    } while (fetchRows.length === fetchSize);

    await resultSet.close();

    res.status(200).json({
      success: true,
      count: rows.length,
      data: rows,
    });
  } catch (err) {
    console.error("Error in getScreen3Images:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch screen3 images.",
      error: err.message,
    });
  } finally {
    if (connection) await connection.close().catch(() => {});
  }
};



module.exports = { manageScreen1Images, getScreen1Images };
