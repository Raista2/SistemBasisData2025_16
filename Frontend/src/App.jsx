import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
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
import AdminDashboard from './pages/AdminDasboard.jsx'
import { useAuth } from './context/AuthContext.jsx'
import MyReservations from './pages/MyReservations.jsx'
import ReservationLanding from './pages/ReservationLanding.jsx'
import Profile from './pages/Profile.jsx'

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="pt-16 flex justify-center items-center h-screen">Loading...</div>;
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
  const [count, setCount] = useState(0)
  const { user, logout } = useAuth()

  function HomePage() {
    return (
      <div className="pt-16">
        <div>
          <a href="https://vite.dev" target="_blank">
            <img src={viteLogo} className="logo" alt="Vite logo" />
          </a>
          <a href="https://react.dev" target="_blank">
            <img src={reactLogo} className="logo react" alt="React logo" />
          </a>
        </div>
        <h1>Vite + React</h1>
        <div className="card">
          <button onClick={() => setCount((count) => count + 1)}>
            count is {count}
          </button>
          <p>
            Edit <code>src/App.jsx</code> and save to test HMR
          </p>
        </div>
        <p className="read-the-docs">
          Click on the Vite and React logos to learn more
        </p>
      </div>
    )
  }

  return (
    <>
      <NavBar user={user} onLogout={logout} />

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
    </>
  )
}

export default App