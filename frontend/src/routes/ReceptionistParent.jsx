import { useEffect } from "react"
import { Navigate, Outlet } from "react-router-dom"
import { toast } from "react-toastify"

const ReceptionistParent = () => {


    const isUserLogin = JSON.parse(localStorage.getItem("loginUser"));
    const loginUserData = JSON.parse(localStorage.getItem("loginUserData") || "{}");

    // console.log(isUserLogin , "isUserLogin");
    // console.log(loginUserData , "loginUserData");

    const isAllow = loginUserData?.role === "Receptionist" || loginUserData?.role === "Admin";

    useEffect(() => {
        if (!isUserLogin) {
            toast.warning("You have to login first");
        } else if (loginUserData?.role !== "Receptionist" && loginUserData?.role !== "Admin") {
            toast.error("Access denied");
        }
    }, [isUserLogin, loginUserData]);

    return (
        <>
            {
                isAllow ? <Outlet /> : <Navigate to={"/"}  />
            }
        </>
    )

}

export default ReceptionistParent
