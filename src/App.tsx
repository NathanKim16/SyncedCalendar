import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom"
import CalendarApp from "./components/CalendarApp"
import NavBar from "./components/navbar"
import WeekView from "./components/WeekView"
import Login from "./components/Login"
import './components/CalendarApp.css'

const AppContent = () => {
    const location = useLocation()
    const showWelcome = location.pathname === "/"

    return (
        <div className="container">
            <NavBar />
            {showWelcome && (
                <h1 style={{
                    position: 'fixed',
                    top: '2rem',
                    left: '8rem',
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '4rem',
                    fontWeight: 'bold',
                    color: 'rgb(236, 226, 226)',
                    letterSpacing: '0.1rem',
                    margin: 0,
                    zIndex: 100,
                }}>
                    Welcome to Synced!
                </h1>
            )}
            <Routes>
              <Route path="/" element={<WeekView />} />
              <Route path="/calendar" element={<CalendarApp />} />
              <Route path="/login" element={<Login />} />
            </Routes>
        </div>
    )
}

function App() {
    return (
        <BrowserRouter>
            <AppContent />
        </BrowserRouter>
    )
}

export default App