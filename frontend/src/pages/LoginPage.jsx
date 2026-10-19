import { UserOutlined } from '@ant-design/icons';
import { Button, Input } from 'antd';
import doctorImg from "../assets/doctor.png"
import NubitLogo from "../assets/nubit-logo.png"
import hospitraxLogo from "../assets/productLogoBgRemove.png"
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { base_URL } from '../utills/baseUrl';
import { useDispatch } from 'react-redux';
import { loginUser } from '../reduxToolKit/authSlice';
import { jwtDecode } from "jwt-decode";
import logo from "../assets/MMC logo.png";




const LoginPage = () => {

  const savedUsername = JSON.parse(localStorage.getItem('username') || 'null') || '';
  const savedPassword = JSON.parse(localStorage.getItem('password') || 'null') || '';
  const [inputs, setInputs] = useState({
    username: savedUsername,
    password: savedPassword
  })
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate()
  const dispatch = useDispatch()

  const inputHandler = (e) => {
    setInputs({ ...inputs, [e.target.id]: e.target.value })
    // console.log(inputs , "<<<<<<<<<<<<");
  }

  // console.log(savedUsername, "savedUsername");
  // console.log(savedPassword, "savedPassword");


  const loginHandler = async () => {

    if (!inputs?.username || !inputs?.password) {
      toast.info("Please fill all fields");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post(`${base_URL}/api/auth/login`, inputs);
      console.log(res , "login user res .....................");
      const token = res.data.token;
      const decoded = jwtDecode(token);
      const userData = { ...decoded , isprevioussessionopen : res?.data?.isprevioussessionopen }

      // console.log(userData, "login userData <<<<<<");


      localStorage.setItem("loginUserData", JSON.stringify(userData))
      localStorage.setItem("loginUser", JSON.stringify(token));
      dispatch(loginUser(userData));
      setLoading(false);

      if (decoded.role === "Admin") {

        navigate("/");

      }
      else if (decoded.role === "doctor") {

        localStorage.setItem("username", JSON.stringify(inputs?.username))
        localStorage.setItem("password", JSON.stringify(inputs?.password));
        navigate("/doctorSetupPage");

      }
      else if (decoded.role === "Medical Assistant") {

        navigate("/medicalAssistant");

      }
      else if (decoded.role === "Receptionist" || decoded.role?.split("|")[0] === "Receptionist") {

        navigate("/receptionist");

      }
      else if (decoded?.role == "screen" && decoded?.id >= 6 && decoded?.id <= 10) {        //  decoded?.id = 6 means screen 5

        const screenAccessMap = {
          "005Screen5": { path: "/screen", id: 6, num: 5 },
          "006Screen6": { path: "/screen", id: 7, num: 6 },
          "007Screen7": { path: "/screen", id: 8, num: 7 },
          "008Screen8": { path: "/screen", id: 9, num: 8 },
          "009Screen9": { path: "/screen", id: 10, num: 9 },
        };

        const screen = screenAccessMap[decoded.username];
        if (screen) {
          navigate(`${screen.path}/${screen.num}`); // ✅ Screen ID pass kar rahe hain
        } else {
          navigate("/login");
        }

      }
      else {

        const screenAccessMap = {
          "001Screen1": "/screen1display",
          "002Screen2": "/screen2display",
          "003Screen3": "/screen3display",
          "004Screen4": "/screen4display",
        };

        navigate(screenAccessMap[decoded.username] || "/login");

      }

      if (decoded.role === "doctor") {
        toast.info("Add Room");
      }
      else {
        toast.success(res?.data?.message);
      }

    }
    catch (err) {
      console.log(err, "error");
      setLoading(false);
      toast.error(err?.response?.data?.message);
    }


  }

  return (

    <div className="relative h-[100vh] w-[100%] flex justify-center items-center ">

      <div className="flex absolute top-4 left-4 items-center gap-4 [@media(min-width:3200px)]:gap-8 [@media(min-width:4400px)]:gap-12">

        {/* Logo wrapper */}
        <div className="bg-[linear-gradient(135deg,#01A7B5_0%,#0b2745_100%)] p-[2px] rounded-full shadow-lg">
          <div className=" bg-white backdrop-blur-md
      p-2
      rounded-full
    ">
            <img
              src={logo}
              alt="logo"
              className="
          h-6 sm:h-8 md:h-12
          w-6 sm:w-8 md:w-12
          min-[2000px]:h-16 min-[2000px]:w-16
          [@media(min-width:3000px)]:h-18 [@media(min-width:3000px)]:w-18
          [@media(min-width:4400px)]:h-30 [@media(min-width:4400px)]:w-30
          object-contain
        "
            />
          </div>
        </div>

        {/* Text */}
        <div>
          <h1 className="
  text-1xl sm:text-2xl md:text-3xl  font-bold tracking-wide
  min-[2000px]:text-5xl
  [@media(min-width:3200px)]:text-6xl
  [@media(min-width:4400px)]:text-7xl
  text-[#0b2745]
  bg-[linear-gradient(to_right,#0b2745_0%,#01A7B5_60%)]
  bg-clip-text
  
">
            Memon Medical Complex
          </h1>


          <p className="
      text-sm italic
      min-[2000px]:text-2xl
      [@media(min-width:3000px)]:text-3xl
      [@media(min-width:4400px)]:text-5xl
      text-[#0b2745]/70
    ">
            “Serving with Excellence & Care”
          </p>
        </div>

      </div>



      <h1
        className="absolute top-14 text-[40px] sm:text-[45px] md:text-[50px] font-bold bg-[linear-gradient(to_right,white_0%,white_30%,#a1e5ec_50%,#01A7B5_100%)] bg-clip-text text-transparent"
      >
        Welcome Back
      </h1>

      {/* <h1 className="absolute top-4 text-[50px] font-bold bg-[linear-gradient(to_right,white_50%,#01A7B5_50%)] bg-clip-text text-transparent"> Welcome Back </h1> */}

      <div className="w-[50%] h-[100%] bg-[#01A7B5] flex items-center justify-end">

        <div className="flex flex-col justify-between absolute left-5 sm:static  items-start p-6 h-[65%] md:h-[62%] lg:h-[55%]  w-[90%] md:w-[80%] lg:w-[60%] xl:w-[50%] bg-white shadow-[6px_0_20px_black]">

          <div className="flex absolute  items-center gap-4 [@media(min-width:3200px)]:gap-8 [@media(min-width:4400px)]:gap-12">
            <img
              src={hospitraxLogo}
              alt="Hospitrax Logo"
              className="w-14 4xl:w-30"
            />
          </div>

          <div className='w-full text-center mt-4 '>
            <h1 className='text-[40px] font-medium text-[#01A7B5]'>Hospital</h1>
            <h3 className='text-[20px] text-gray-600'>Management System</h3>
          </div>

          <div className='w-[100%] text-[18px]'>
            <label htmlFor="userName">User Name</label>
            <Input
              value={inputs.username}
              onKeyUp={(e) => {
                if (e.key === "Enter") {
                  loginHandler();
                }
              }}
              required
              style={{ fontSize: "18px", marginTop: "8px" }} onChange={inputHandler} id='username' placeholder="User Name" />
          </div>

          <div className='w-[100%] text-[18px]'>
            <label htmlFor="password">Password</label>
            <Input.Password
              value={inputs.password}
              onKeyUp={(e) => {
                if (e.key === "Enter") {
                  loginHandler();
                }
              }}
              required
              style={{ fontSize: "18px", marginTop: "8px" }} onChange={inputHandler} id='password' placeholder="Input password" />
          </div>

          <Button
            onClick={loginHandler}
            style={{
              backgroundColor: "#01A7B5",
              color: "white",
              border: "none",
              fontSize: "18px",
              padding: "18px"
            }}
            block
            disabled={loading}
            loading={loading}>{!loading && "Login"}</Button>

          <h1 className='text-[#01A7B5]'>Powered By Nubit Software</h1>

        </div>

      </div>

      <div className="w-[50%] h-[100%] bg-[#F3F3F3] flex items-center justify-start">

        <div className="hidden sm:flex   justify-center items-center p-4 h-[65%] md:h-[62%] lg:h-[55%] w-[95%] md:w-[80%] lg:w-[60%] xl:w-[50%] bg-[#E3FDFF] shadow-[12px_4px_20px_0_rgba(0,0,0,0.3)]">
          <img src={doctorImg} alt="" />
        </div>

      </div>

      <img className='absolute bottom-6 right-4 w-[60px] sm:w-[70px]' src={NubitLogo} alt="NubitLogo" />

    </div>
  )
}

export default LoginPage