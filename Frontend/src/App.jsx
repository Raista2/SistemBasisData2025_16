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
import { useAuth } from './context/AuthContext.jsx'
import Layout from "./pages/BackgroundLayout.jsx"

function App() {
  const [count, setCount] = useState(0)
  const { user, logout } = useAuth()

  function HomePage() {
    return (
      <div className="pt-16 flex justify-center items-center">
        <div className="card p-4 font-bold text-white">
          <p>Selamat Datang Di Room Reservation!</p>
          <h1>Pinjam Ruang Di FTUI</h1>
        </div>
        <p className="card font-bold bg-white text-black shadow-md rounded-md">
          Untuk bisa mulai pinjam ruang, registrasi/login akun terlebih dahulu lewat navbar di atas.
        </p>
      </div>
    )
  }

  return (
    <>
      <NavBar user={user} onLogout={logout} />

      {/* Define routes*/}
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/gedung" element={<Gedung />} />
          <Route path="/ruangan/:buildingId" element={<Ruangan />} />
          <Route path="/reservation/:roomId" element={<Reservation />} />
          <Route path="/approval" element={<Approval />} />
          <Route path="/map" element={<Map />} />
        </Route>
      </Routes>
    </>
  )
}

export default App