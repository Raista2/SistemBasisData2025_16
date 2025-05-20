import { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import NavBar from './NavBar.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Map from './pages/Map.jsx'
import Gedung from './pages/Gedung.jsx'
import Ruangan from './pages/Ruangan.jsx'
import Reservation from './pages/Reservation.jsx'
import Approval from './pages/Approval.jsx'
import AdminDashboard from './pages/AdminDashboard.jsx'
import { useAuth } from './context/AuthContext.jsx'
import MyReservations from './pages/MyReservations.jsx'
import ReservationLanding from './pages/ReservationLanding.jsx'
import Profile from './pages/Profile.jsx'
import HomePage from './pages/Home.jsx'

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="pt-16 flex justify-center items-center h-screen font-qanelas">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-blue mb-4"></div>
          <p className="text-primary-blue font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  const { user, logout } = useAuth()

  return (
    <div className="font-qanelas min-h-screen flex flex-col">
      <NavBar user={user} onLogout={logout} />

      <main className="flex-grow">
        {/* Define routes*/}
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/gedung" element={<Gedung />} />
          <Route path="/ruangan/:buildingId" element={<Ruangan />} />
          <Route path="/reservation/:roomId" element={
            <ProtectedRoute>
              <Reservation />
            </ProtectedRoute>
          } />
          <Route path="/approval" element={
            <ProtectedRoute requiredRole="admin">
              <Approval />
            </ProtectedRoute>
          } />
          <Route path="/admin/dashboard" element={
            <ProtectedRoute requiredRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/map" element={<Map />} />
          <Route path="/my-reservations" element={
            <ProtectedRoute>
              <MyReservations />
            </ProtectedRoute>
          } />
          <Route path="/reservation" element={
            <ProtectedRoute>
              <ReservationLanding />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
        </Routes>
      </main>
    </div>
  )
}

export default App