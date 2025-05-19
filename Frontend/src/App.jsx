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
<<<<<<< Updated upstream
import MyReservations from './pages/MyReservations.jsx'  // Tambahkan import ini
import ProtectedRoute from './components/ProtectedRoute';
=======
import AdminDashboard from './pages/AdminDasboard.jsx'
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
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes

function App() {
  const [count, setCount] = useState(0)

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
<<<<<<< Updated upstream
<<<<<<< Updated upstream
    <>
      <NavBar user={null} onLogout={() => {}} />
      
      {/* Define routes*/}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/gedung" element={<Gedung />} />
        <Route path="/ruangan/:buildingId" element={<Ruangan />} />
        
        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/reservation/:roomId" element={<Reservation />} />
          <Route path="/my-reservations" element={<MyReservations />} />
        </Route>
        
        {/* Admin routes */}
        <Route element={<ProtectedRoute requireAdmin={true} />}>
          <Route path="/approval" element={<Approval />} />
        </Route>

        <Route path="/map" element={<Map />} />
      </Routes>
    </>
=======
=======
>>>>>>> Stashed changes
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

      <footer className="bg-primary-yellow text-primary-blue py-4 mt-auto">
        <div className="container mx-auto px-4 text-center">
          <p className="font-medium">&copy; {new Date().getFullYear()} Room Reservation. All rights reserved.</p>
        </div>
      </footer>
    </div>
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
  )
}

export default App