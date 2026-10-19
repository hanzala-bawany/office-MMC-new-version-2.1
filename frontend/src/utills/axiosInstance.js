import axios from "axios";
import { base_URL } from "../utills/baseUrl"
import { toast } from "react-toastify";
import { store } from '../reduxToolKit/store'
import { logoutUser } from "../reduxToolKit/authSlice";


const axiosInstance = axios.create({
  baseURL: base_URL,
});


axiosInstance.interceptors.request.use((config) => {

  const token = JSON.parse(localStorage.getItem("loginUser"));

  if (token) {
    config.headers.authorization = `Bearer ${token}`;
  }

  return config;
});



axiosInstance.interceptors.response.use(

  (response) => {
     return response; 
  },
  (error) => {
    
    if (error?.response?.status === 401) {

      store.dispatch(logoutUser()); 
      toast.warning("You have to login first");
      setTimeout(() => {
          window.location.href = "/login"; 
      },1*1000)
    
    }

    return Promise.reject(error);    // by default yahan se promise.resolve return ho ta he is waja se bataya warna ye err bhi try me hi resolve ho jata
    
  }
);

export default axiosInstance;