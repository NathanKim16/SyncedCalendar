// @ts-ignore
import { BrowserRouter, Routes, Route } from "react-router-dom"
import CalendarApp from "./components/CalendarApp"
import NavBar from "./components/navbar"
import './components/CalendarApp.css'
import Login from "./components/Login"

function App() {
  return (
    <BrowserRouter>
      <div className="container">
        <NavBar />
        <Routes>
          <Route path="/" element={<CalendarApp />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App