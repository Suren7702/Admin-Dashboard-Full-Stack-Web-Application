// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/auth/Login.jsx";
import SecretRegister from "./pages/auth/SecretRegister.jsx";

import DashboardHome from "./pages/dashboard/DashboardHome.jsx";
import Members from "./pages/dashboard/Members.jsx";
import Volunteers from "./pages/dashboard/Volunteers.jsx";
import Approvals from "./pages/dashboard/Approvals.jsx";

import NotFound from "./pages/NotFound.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import MaanaduSupporters from "./pages/MaanaduSupporters.jsx";
import KizhaiKazhagam from "./pages/KizhaiKazhagam"; 
import BoothMap from "./pages/BoothMap";
import AddBooth from "./pages/dashboard/AddBooth";

export default function App() {
  const isAuthenticated = !!localStorage.getItem("token");

  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route
          path="/login"
          element={
            isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />
          }
        />
        <Route path="/secret-register" element={<SecretRegister />} />

        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardHome />} />
          <Route path="/dashboard/members" element={<Members />} />
          <Route path="/dashboard/volunteers" element={<Volunteers />} />
           <Route path="/dashboard/kizhai" element={<KizhaiKazhagam />} />
          <Route path="/dashboard/approvals" element={<Approvals />} />
          <Route path="/dashboard/booths/add" element={<AddBooth />} />
          <Route
            path="/dashboard/maanadu-supporters"   // 🔥 fixed path
            element={<MaanaduSupporters />}
          />
        </Route>
        
          <Route path="/booths-map" element={<BoothMap />} />

        {/* Root redirect */}
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
