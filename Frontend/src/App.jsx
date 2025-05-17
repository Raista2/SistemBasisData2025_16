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
import Layout from "./pages/BackgroundLayout.jsx"

function App() {
  const [count, setCount] = useState(0)

  function HomePage() {
    return (
      <div className="pt-16 p-4 md:p-10 lg:p-20 max-w-4xl mx-auto">
        <div className="text-3xl text-left text-black font-bold">Selamat Datang Di Room Reservation</div>
      </div>
    )
  }

  return (
    <div >
      <NavBar user={null} onLogout={() => {}} />
      
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
    </div>
  )
}

export default App