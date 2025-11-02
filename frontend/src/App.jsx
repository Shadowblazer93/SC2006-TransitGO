// src/App.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import { AuthProvider } from './auth/AuthProvider.jsx';
import ProtectedRoute from './auth/ProtectedRoute.jsx';

// Pages
import Login from './pages/Login.jsx';
import UserHomePage from './pages/UserPages/UserHomePage.jsx';
import FareCalculator from './pages/UserPages/FareCalculator.jsx';
import Favourites from './pages/UserPages/Favourites.jsx';
import SavedRoutes from './pages/UserPages/SavedRoutes.jsx';
import DownloadedArea from './pages/UserPages/DownloadedArea.jsx';
import TripHistory from './pages/UserPages/TripHistory.jsx';
import UserFeedback from './pages/UserPages/UserFeedback.jsx';

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<Login />} />

        {/* Protected */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <UserHomePage />
            </ProtectedRoute>
          }
        />

        {/* User features (lowercase) */}
        <Route path="/farecalculator" element={<ProtectedRoute><FareCalculator /></ProtectedRoute>} />
        <Route path="/favourites" element={<ProtectedRoute><Favourites /></ProtectedRoute>} />
        <Route path="/savedroutes" element={<ProtectedRoute><SavedRoutes /></ProtectedRoute>} />
        <Route path="/downloadedarea" element={<ProtectedRoute><DownloadedArea /></ProtectedRoute>} />
        <Route path="/triphistory" element={<ProtectedRoute><TripHistory /></ProtectedRoute>} />
        <Route path="/userfeedback" element={<ProtectedRoute><UserFeedback /></ProtectedRoute>} />

        {/* Optional: capitalized duplicates in case other buttons use these */}
        <Route path="/FareCalculator" element={<ProtectedRoute><FareCalculator /></ProtectedRoute>} />
        <Route path="/Favourites" element={<ProtectedRoute><Favourites /></ProtectedRoute>} />
        <Route path="/SavedRoutes" element={<ProtectedRoute><SavedRoutes /></ProtectedRoute>} />
        <Route path="/DownloadedArea" element={<ProtectedRoute><DownloadedArea /></ProtectedRoute>} />
        <Route path="/TripHistory" element={<ProtectedRoute><TripHistory /></ProtectedRoute>} />
        <Route path="/UserFeedback" element={<ProtectedRoute><UserFeedback /></ProtectedRoute>} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}
