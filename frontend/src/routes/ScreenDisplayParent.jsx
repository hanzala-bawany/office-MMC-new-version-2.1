import axios from "axios";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { base_URL } from "../utills/baseUrl";
import { updateDoctorsData } from "../reduxToolKit/doctorSlice";

const ScreenDisplayParent = () => {

    const screenAccessMap = {
        "001Screen1": "/screen1display",
        "002Screen2": "/screen2display",
        "003Screen3": "/screen3display",
        "004Screen4": "/screen4display",
    };
    const loginUserData = useSelector((state) => state?.authSlice?.loginUser);
    const location = useLocation();
    const dispatch = useDispatch();


    useEffect(() => {
        const fetchDoctors = async () => {
            try {
                const res = await axios.get(`${base_URL}/api/doctor/list`);
                dispatch(updateDoctorsData(res.data.data));
            } catch (error) {
                console.log("Failed to fetch doctors", error);
            }
        };
        fetchDoctors();
    }, []);

    // console.log(loginUserData, "logoin use data");

    if (!loginUserData) {
        return <Navigate to="/login" replace />;
    }


    if (loginUserData?.role === "Admin") {
        return <Outlet />;
    }

    if (loginUserData.role == "doctor") {
        toast.error("Access Denied")
        return <Navigate to="/doctorDashboard" replace />;
    }
    else if (loginUserData.role == "Medical Assistant") {
        toast.error("Access Denied")
        return <Navigate to="/medicalAssistant" replace />;
    }

    const allowedPath = screenAccessMap[loginUserData.username];
    const isAllowed = location.pathname.startsWith(allowedPath);

    if (isAllowed) return <Outlet />;

    toast.error("Access Denied")
    return <Navigate to={allowedPath} replace />;


}

export default ScreenDisplayParent