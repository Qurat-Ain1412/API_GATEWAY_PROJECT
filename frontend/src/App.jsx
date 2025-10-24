import { useState, useEffect } from 'react'
import Signup from './components/Signup'
import Login from './components/Login'
import Dashboard from './components/Dashboard'
import News from './components/News'
import { Routes, Route } from 'react-router-dom'
import './App.css'

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      setIsLoggedIn(true)
    }
  }, [])

  return (
    <div className="app">
      <div className="container">
        <div className="content">
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/news" element={<News />} />
          </Routes>
        </div>
      </div>
    </div>
  )
}

export default App