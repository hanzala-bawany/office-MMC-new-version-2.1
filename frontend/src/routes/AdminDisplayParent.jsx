import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { toast } from "react-toastify";


const AdminDisplayParent = () => {

  const screenAccessMap = {
    "001Screen1": "/screen1display",
    "002Screen2": "/screen2display",
    "003Screen3": "/screen3display",
    "004Screen4": "/screen4display",
    "005Screen5": "/screen/5",
  };
  const loginUserData = useSelector((state) => state?.authSlice?.loginUser);
  const allowedPath = screenAccessMap[loginUserData?.username];
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    if (toastMessage) {
      toast.error(toastMessage);
    }
  }, [toastMessage]);

  if (!loginUserData) {
    return <Navigate to="/login" replace />;
  }
  else if (loginUserData.role === "Admin") {
    return <Outlet />;
  }
  else if (loginUserData.role == "doctor") {
    toast.error("Only Admin Can Access");
    return <Navigate to="/doctorDashboard" replace />;
  }
  else if (loginUserData.role == "Receptionist") {
    toast.error("Only Admin Can Access");
    return <Navigate to="/receptionist" replace />;
  }
  else if (loginUserData.role == "Medical Assistant") {
    toast.error("Only Admin Can Access");
    return <Navigate to="/medicalAssistant" replace />;
  }
  else if (allowedPath) {
    toast.error("Only Admin Can Access");
    return <Navigate to={allowedPath} replace />;
  }
  else {
    setToastMessage("Unauthorized user");
    return <Navigate to="/login" replace />;
  }
  
};

export default AdminDisplayParent;


