import React from "react";
import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import ResetPassword from "./pages/ResetPassword";
import CreateAccount from "./pages/CreateAccount";
import StationDensityRealTime from "./pages/StationDensityRealTime";
import StationDensityForecast from "./pages/StationDensityForecast";
import TrainServiceAlerts from "./pages/TrainServiceAlerts";
import UserComponent from "./components/UserComponent";
import Announcements from "./pages/UserUI/Announcements";
import AnnouncementManagement from "./pages/AdminUI/AnnouncementManagement";
import UserManagement from "./pages/AdminUI/UserManagement";
import UserFeedbackList from "./pages/AdminUI/UserFeedbackList";

//Import Admin Pages
import AdminHomePage from "./pages/AdminPages/AdminHomePage";
import AdminProfilePage from "./pages/AdminPages/AdminProfilePage";

//Import User Pages
import UserHomePage from "./pages/UserPages/UserHomePage";
import UserProfilePage from "./pages/UserPages/UserProfilePage";


function App() {
  return (
    <Routes>
      {/* Auth Pages */}
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/signup" element={<CreateAccount />} />

      {/* Admin Pages */}
      <Route path="/AdminHomePage" element={<AdminHomePage />} />
      <Route path="/AdminProfile" element={<AdminProfilePage />} />
      <Route path="/announcementmanagement" element={<AnnouncementManagement />} />
      <Route path="/usermanagement" element={<UserManagement />} />
      <Route path="/userfeedbacklist" element={<UserFeedbackList />} />

      {/* Main App Pages */}
      <Route path="/UserHomePage" element={<UserHomePage />} />
      <Route path="/UserProfile" element={<UserProfilePage />} />
      <Route path="/users" element={<UserComponent />} />
      <Route path="/stationdensityrealtime" element={<StationDensityRealTime />} />
      <Route path="/stationdensityforecast" element={<StationDensityForecast />} />
      <Route path="/trainservicealerts" element={<TrainServiceAlerts />} />
      <Route path="/announcements" element={<Announcements />} />
    </Routes>
  );
}

export default App;

