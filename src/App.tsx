import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom"
import { AuthProvider } from "./components/context/auth/index"
import CalendarApp from "./components/CalendarApp"
import NavBar from "./components/navbar"
import WeekView from "./components/WeekView"
import Login from "./components/Login"
import './components/CalendarApp.css'

const AppContent = () => {
    const location = useLocation()
    const isLoginPage = location.pathname === "/"

    return (
        <div className="container">
            {!isLoginPage && <NavBar />}
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/calendar" element={<CalendarApp />} />
                <Route path="/home" element={<WeekView />} />
            </Routes>
        </div>
    )
}

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <AppContent />
            </BrowserRouter>
        </AuthProvider>
        
    )
}

export default App