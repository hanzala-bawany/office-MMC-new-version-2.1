import { useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { toast } from "react-toastify";

const DocotorParent = () => {

    const isUserLogin = JSON.parse(localStorage.getItem("loginUser"));
    const loginUserData = JSON.parse(localStorage.getItem("loginUserData"));


    const isAllow = loginUserData?.role == "doctor"

    useEffect(() => {
        if (!isUserLogin) {
            toast.warning("You have to login first");
        } else if (loginUserData?.role !== "doctor" && loginUserData?.role !== "Admin") {
            toast.error("Access denied");
        }
    }, [isUserLogin, loginUserData]);

    return (
        <>
            {
                isAllow ? <Outlet /> : <Navigate to={"/"} />
            }
        </>
    )
}

export default DocotorParent