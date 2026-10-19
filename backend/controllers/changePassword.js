const oracledb = require("oracledb");
const poolPromise = require("../database.js");
const { formatForOracle } = require("../utills/dateFormatCoverter.js");
const { handleError } = require("../utills/resHanlder.js");

const changePassword = async (req, res) => {

  console.log(req.body , "req.body;");
  

  try {
    const { userId, oldPassword, newPassword } = req.body;

    // Validation
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    if (!oldPassword) {
      return res.status(400).json({
        success: false,
        message: "Old password is required",
      });
    }

    if (!newPassword) {
      return res.status(400).json({
        success: false,
        message: "New password is required",
      });
    }

    if (oldPassword === newPassword) {
      return res.status(400).json({
        success: false,
        message: "New password cannot be same as old password",
      });
    }

    let connection;

    try {
      const pool = await poolPromise;
      connection = await pool.getConnection();

      // Call the stored procedure
      const result = await connection.execute(
        `BEGIN 
                    hms_change_password(
                        :p_userid,
                        :p_oldpassword,
                        :p_newpassword,
                        :p_status,
                        :p_message
                    );
                END;`,
        {
          p_userid: userId,
          p_oldpassword: oldPassword,
          p_newpassword: newPassword,
          p_status: {
            type: oracledb.NUMBER,
            dir: oracledb.BIND_OUT,
          },
          p_message: {
            type: oracledb.STRING,
            dir: oracledb.BIND_OUT,
            maxSize: 200,
          },
        },
        {
          autoCommit: true,
        },
      );

      const status = result.outBinds.p_status;
      const message = result.outBinds.p_message;

      // Handle response based on procedure status
      if (status === 1) {
        return res.status(200).json({
          success: true,
          message: message || "Password changed successfully",
          data: {
            userId: userId,
            status: status,
          },
        });
      } else if (status === 0) {
        return res.status(400).json({
          success: false,
          message: message || "Invalid old password",
          data: {
            userId: userId,
            status: status,
          },
        });
      } else {
        // status === -1 or any other error
        return res.status(500).json({
          success: false,
          message: message || "An error occurred while changing password",
          data: {
            userId: userId,
            status: status,
          },
        });
        
      }

    } catch (error) {
      console.error("Database error:", error);
      return handleError(res, error, "Error changing password", 500);
    } 
    finally {
      if (connection) {
        try {
          await connection.close();
        } catch (err) {
          console.error("Error closing connection:", err);
        }
      }
    }
  } catch (error) {
    console.error("Controller error:", error);
    return handleError(res, error, "Internal server error", 500);
  }
};

module.exports = {
  changePassword,
};
