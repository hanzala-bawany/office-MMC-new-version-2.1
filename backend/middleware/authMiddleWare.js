const jwt = require("jsonwebtoken");
const { DEFAULT } = require("oracledb");


const verifyToken = (req, res, next) => {  


  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; 

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Token required',
    });
  }

  try {

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } 
  catch (err) {
    return res.status(401).json({
      success: false,
      message: err.message || 'Invalid or expired token',
    });
  }

};

const isAdmin = (req, res, next) => {

  if (req.user?.role !== 'Admin') {
    return res.status(403).json({
      success: false,
      message: 'Admin access required',
    });
  }
  next();
  
};

module.exports = { verifyToken, isAdmin };