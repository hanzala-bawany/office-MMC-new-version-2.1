const poolPromise = require("../database.js");

let lastCreatedTime = null;

async function startOpdWatcher(io) {
  setInterval(async () => {
    let connection;

    try {
      const pool = await poolPromise;
      connection = await pool.getConnection();

      const result = await connection.execute(
        `SELECT MAX(createdtime) FROM hms.opdreceipt`,
      );

      const currentValue = result.rows[0][0];

      if (
        lastCreatedTime !== null &&
        currentValue &&
        new Date(currentValue).getTime() !== new Date(lastCreatedTime).getTime()
      ) {
        io.emit("opdUpdated", {
          message: "New OPD Receipt Added",
          time: new Date(),
        });
      }

      lastCreatedTime = currentValue;
    } catch (err) {
      console.error("Watcher Error:", err);
    } finally {
      if (connection) {
        await connection.close();
      }
    }
  }, 5000);
}

module.exports = {
  startOpdWatcher,
};
