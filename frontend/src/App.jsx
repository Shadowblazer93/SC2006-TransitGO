import React from "react";
import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import ResetPassword from "./pages/ResetPassword";
import CreateAccount from "./pages/CreateAccount";
import StationDensityRealTime from "./pages/StationDensityRealTime";
import StationDensityForecast from "./pages/StationDensityForecast";
import TrainServiceAlerts from "./pages/TrainServiceAlerts";
import UserComponent from "./components/UserComponent";

function App() {
  return (
    <Routes>
      {/* Auth Pages */}
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/create-account" element={<CreateAccount />} />

      {/* Main App Pages */}
      <Route path="/users" element={<UserComponent />} />
      <Route path="/stationdensityrealtime" element={<StationDensityRealTime />} />
      <Route path="/stationdensityforecast" element={<StationDensityForecast />} />
      <Route path="/trainservicealerts" element={<TrainServiceAlerts />} />
    </Routes>
  );
}

export default App;

