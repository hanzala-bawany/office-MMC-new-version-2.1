import { useEffect } from "react"
import { Navigate, Outlet } from "react-router-dom"
import { toast } from "react-toastify"

const MedicalAssistantParent = () => {


    const isUserLogin = JSON.parse(localStorage.getItem("loginUser"));
    const loginUserData = JSON.parse(localStorage.getItem("loginUserData") || "{}");

    // console.log(isUserLogin , "isUserLogin");
    // console.log(loginUserData , "loginUserData");
    


    const isAllow = loginUserData?.role === "Medical Assistant" || loginUserData?.role === "Admin";

    useEffect(() => {
        if (!isUserLogin) {
            toast.warning("You have to login first");
        } else if (loginUserData?.role !== "Medical Assistant" && loginUserData?.role !== "Admin") {
            toast.error("Access denied");
        }
    }, [isUserLogin, loginUserData]);

    return (
        <>
            {
                isAllow ? <Outlet /> : <Navigate to={"/"}   />
            }
        </>
    )

}

export default MedicalAssistantParent