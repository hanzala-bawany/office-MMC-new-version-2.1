import './App.css'
import { Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import AppLayout from './Layouts/AppLayout'
import ScreenLayout from './Layouts/ScreenLayout'
import Screen2Page from './pages/Screen2'
import Screen3Page from './pages/Screen3'
import Screen4Page from './pages/Screen4'
import FacultyPage from './pages/Faculty'
import Screen1Page from './pages/Screen1'
import DoctorPage from './pages/Doctor'
import ScreensPage from './pages/Screens'
import Screen1Display from './pages/Screen1Display'
import Screen4Display from './pages/Screen4Display'
import Screen3Display from './pages/Screen3Display'
import Screen2Display from './pages/Screen2Display'
import ReceptionPage from './pages/ReceptionPage'
import NotFoundPage from './pages/NotFoundPage'
import LoginPage from './pages/LoginPage'
import AdminDisplayParent from './routes/AdminDisplayParent'
import AuthParent from './routes/AuthParent'
import ScreenDisplayParent from './routes/ScreenDisplayParent'
import ReceptionistParent from './routes/ReceptionistParent'
import Screen5Display from './pages/Screen5Display'
import DoctorDashboard from './pages/DoctorDashboard'
import DocotorParent from './routes/DocotorParent'
import MedicalAssistant from './pages/MedicalAssistant'
import MedicalAssistantParent from './routes/MedicalAssistantParent'
import PronunciationPage from './pages/PronunciationPage'
import AddRemoveLogoutDoctor from './pages/AddRemoveLogoutDoctor'
import DoctorSetupPage from './components/doctorDashboard/Doctorsetuppage'
import AddScreens from './pages/AddScreens'
import PrescriptionReport from './pages/PrescriptionReport'
import OpdReceiptPage from './pages/OpdReceiptPage'
import ReceptionistPage from './pages/ReceptionistDashboard'
import PartialPaymentPage from './pages/PartialPaymentPage'
import UserSessionPage from './pages/UserSessionPage'
import CurrentCashPage from './pages/CurrentCashPage'
import ChangePassword from './pages/settings/ChangePassword'
import SharingReportPage from './pages/SharingReportPage'


function App() {


  return (
    <>
      <Routes>

        {/* AppLayout wale routes */}
        <Route element={<AppLayout />}>

          <Route element={<AdminDisplayParent />}>
            <Route index element={<Home />} />
            <Route path="/screen1" element={<Screen1Page />} />
            <Route path="/screen2" element={<Screen2Page />} />
            <Route path="/screen3" element={<Screen3Page />} />
            <Route path="/screen4" element={<Screen4Page />} />
            <Route path="/consultant" element={<FacultyPage />} />
            <Route path="/doctor" element={<DoctorPage />} />
            <Route path="/screens" element={<ScreensPage />} />
            <Route path="/reception" element={<ReceptionPage />} />
            <Route path="/pronunciation" element={<PronunciationPage />} />
            <Route path="/removeDoctor" element={<AddRemoveLogoutDoctor />} />
            <Route path="/addScreens" element={<AddScreens />} />
            <Route path="/sharingReport" element={<SharingReportPage />} />
          </Route>

          <Route element={<ReceptionistParent />}>
            <Route path="/receptionist" element={<ReceptionistPage />} />
            <Route path="/opdReceiptPage" element={<OpdReceiptPage />} />
            <Route path="/partialPaymentPage" element={<PartialPaymentPage />} />
            <Route path="/userSessionPage" element={<UserSessionPage />} />
            <Route path="/currentCashPage" element={<CurrentCashPage />} />
            <Route path="/changePassword" element={<ChangePassword />} />
          </Route>

        </Route>

        {/*  Reprts*/}
        <Route path="/prescriptionReport" element={<PrescriptionReport />} />

        {/*  Medical Assistant */}
        <Route element={<MedicalAssistantParent />}>
          <Route path="/medicalAssistant" element={<MedicalAssistant />} />
        </Route>

        {/* Screen Displays */}
        <Route element={<ScreenDisplayParent />}>
          <Route path="/screen1display" element={<Screen1Display />} />
          <Route path="/screen2display" element={<Screen2Display />} />
          <Route path="/screen3display" element={<Screen3Display />} />
          <Route path="/screen4display" element={<Screen4Display />} />
        </Route>
        <Route path="/screen/:screenNum" element={<Screen5Display />} />


        {/*  Doctor*/}
        <Route element={<DocotorParent />}>
          <Route path="/doctorDashboard" element={<DoctorDashboard />} />
          <Route path="/doctorSetupPage" element={<DoctorSetupPage />} />
          <Route path="/doctorDashboard/report" element={<SharingReportPage />} />
        </Route>

        {/* Auth Routes */}
        <Route element={<AuthParent />}>
          <Route path="/login" element={<LoginPage />} />
        </Route>


        <Route path="/*" element={<NotFoundPage />} />

      </Routes>
    </>
  )
}

export default App 