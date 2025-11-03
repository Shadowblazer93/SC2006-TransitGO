// src/App.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import './styles/theme.css';

// Auth & layout
import { AuthProvider } from './auth/AuthProvider.jsx';
import ProtectedRoute from './auth/ProtectedRoute.jsx';
import AppShell from './components/AppShell.jsx';

// Pages
import Login from './pages/Login.jsx';
import UserHomePage from './pages/UserHomePage.jsx';
import FareCalculator from './pages/UserPages/FareCalculator.jsx';
import Favourites from './pages/UserPages/Favourites.jsx';
import SavedRoutes from './pages/UserPages/SavedRoutes.jsx';
import DownloadedArea from './pages/UserPages/DownloadedArea.jsx';
import TripHistory from './pages/UserPages/TripHistory.jsx';
import UserFeedback from './pages/UserPages/UserFeedback.jsx';
import Map from './pages/UserPages/Map.jsx';
import PlatformCrowdness from './pages/UserPages/PlatformCrowdness.jsx';
import MRTServices from './pages/UserPages/MRTServices.jsx';
import UserProfile from './pages/UserPages/UserProfile.jsx';
import FontSize from './pages/UserPages/FontSize.jsx';

// Auto-register any other pages under src/pages/**
import { getDynamicAutoRoutes } from './router/DynamicAutoRoutes.jsx';

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public route */}
        <Route path="/login" element={<Login />} />

        {/* Protected layout (header + footer) */}
        <Route
          element={
            <ProtectedRoute>
              <AppShell />
            </ProtectedRoute>
            
          }
        >
          {/* Home */}
          <Route index element={<UserHomePage />} />
          <Route path="/" element={<UserHomePage />} />

          {/* Main features */}
          <Route path="/map" element={<Map />} />
          <Route path="/crowdness" element={<PlatformCrowdness />} />
          <Route path="/services" element={<MRTServices />} />
          <Route path="/farecalculator" element={<FareCalculator />} />
          <Route path="/favourites" element={<Favourites />} />
          <Route path="/savedroutes" element={<SavedRoutes />} />
          <Route path="/downloadedarea" element={<DownloadedArea />} />
          <Route path="/triphistory" element={<TripHistory />} />
          <Route path="/userfeedback" element={<UserFeedback />} />

          {/* Legacy aliases (capitalised) */}
          <Route path="/FareCalculator" element={<FareCalculator />} />
          <Route path="/Favourites" element={<Favourites />} />
          <Route path="/SavedRoutes" element={<SavedRoutes />} />
          <Route path="/DownloadedArea" element={<DownloadedArea />} />
          <Route path="/TripHistory" element={<TripHistory />} />
          <Route path="/UserFeedback" element={<UserFeedback />} />
          <Route path="/profile" element={<UserProfile />} />
          n<Route path="/font-size" element={<FontSize />} />
          


          {/* Auto routes for anything else in src/pages/** */}
          {getDynamicAutoRoutes()}       
          </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}
