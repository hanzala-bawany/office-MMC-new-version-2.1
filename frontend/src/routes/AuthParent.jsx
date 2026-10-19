import { useEffect } from "react"
import { Navigate, Outlet } from "react-router-dom"
import { toast } from "react-toastify"


const AuthParent = () => {

  const isUserLogin = JSON.parse(localStorage.getItem("loginUser"));
  const loginUserData = JSON.parse(localStorage.getItem("loginUserData"));



  const screenAccessMap = {
    "001Screen1": "/screen1display",
    "002Screen2": "/screen2display",
    "003Screen3": "/screen3display",
    "004Screen4": "/screen4display",
    "005Screen5": "/screen/5",
    "006Screen6": "/screen/6",
    "007Screen7": "/screen/7",
    "008Screen8": "/screen/8",
    "009Screen9": "/screen/9",
  };

  const allowedPath = screenAccessMap[loginUserData?.username];
  const screenPath = loginUserData?.role == "screen";
  const doctorPath = loginUserData?.role == "doctor";
  const medicalAssistantPath = loginUserData?.role == "Medical Assistant";
  const receptionistPath = loginUserData?.role == "Receptionist";
  const adminPath = loginUserData?.role == "Admin";


  useEffect(() => {
    if (isUserLogin) toast.warning("You are already logged in");
  }, [isUserLogin])

  if(isUserLogin && screenPath){
    return   <Navigate to={allowedPath} />
  }
  else if(isUserLogin && doctorPath){
    return   <Navigate to="/doctorDashboard" />
  }
  else if(isUserLogin && medicalAssistantPath){
    return   <Navigate to="/medicalAssistant" />
  }
  else if(isUserLogin && receptionistPath){
    return   <Navigate to="/receptionist" />
  }
  else if(isUserLogin && adminPath){
    return   <Navigate to="/" />
  }
  else {
   return  <Outlet />
  }


}


export default AuthParent