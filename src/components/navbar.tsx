import { useNavigate } from "react-router-dom"
import { useState } from "react"
import homeIcon from "../assets/home.png"

function NavBar() {
    const navigate = useNavigate()
    const [showModal, setShowModal] = useState(false)
    const [showJoinInput, setShowJoinInput] = useState(false)
    const [joinCode, setJoinCode] = useState("")

    const calendars = [
        { id: 1, name: "Calendar", color: "#00a3ff" },
    ]

    const closeModal = () => {
        setShowModal(false)
        setShowJoinInput(false)
        setJoinCode("")
    }

    return (
        <>
            {/* Modal */}
            {showModal && (
                <div style={{
                    position: "fixed",
                    top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: "rgba(0,0,0,0.5)",
                    zIndex: 200,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}>
                    <div style={{
                        backgroundColor: "#161b22",
                        borderRadius: "1.5rem",
                        padding: "3rem",
                        display: "flex",
                        flexDirection: "column",
                        gap: "1.5rem",
                        width: "32rem",
                        position: "relative",
                        boxShadow: "0 2rem 6rem rgba(0,0,0,0.5)",
                    }}>
                        {/* Close button */}
                        <button
                            onClick={closeModal}
                            style={{
                                position: "absolute",
                                top: "1rem",
                                right: "1rem",
                                background: "none",
                                border: "none",
                                color: "#78879e",
                                fontSize: "2rem",
                                cursor: "pointer",
                            }}
                        >×</button>

                        <h2 style={{
                            color: "white",
                            fontFamily: "Inter, sans-serif",
                            fontWeight: "600",
                            fontSize: "1.8rem",
                            margin: 0,
                        }}>
                            {showJoinInput ? "Join a Calendar" : "Add a Calendar"}
                        </h2>

                        {!showJoinInput ? (
                            <>
                                {/* Create */}
                                <div
                                    style={{
                                        backgroundColor: "#1e2426",
                                        borderRadius: "1rem",
                                        padding: "2rem",
                                        cursor: "pointer",
                                        border: "1px solid #2a2f3b",
                                        transition: "border-color 0.2s ease",
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: "0.5rem",
                                    }}
                                    onMouseEnter={e => (e.currentTarget.style.borderColor = "#00a3ff")}
                                    onMouseLeave={e => (e.currentTarget.style.borderColor = "#2a2f3b")}
                                >
                                    <span style={{ color: "white", fontFamily: "Inter, sans-serif", fontWeight: "600", fontSize: "1.4rem" }}>
                                        Create a Calendar
                                    </span>
                                    <span style={{ color: "#78879e", fontFamily: "Inter, sans-serif", fontSize: "1.1rem" }}>
                                        Start a new group calendar
                                    </span>
                                </div>

                                {/* Join */}
                                <div
                                    onClick={() => setShowJoinInput(true)}
                                    style={{
                                        backgroundColor: "#1e2426",
                                        borderRadius: "1rem",
                                        padding: "2rem",
                                        cursor: "pointer",
                                        border: "1px solid #2a2f3b",
                                        transition: "border-color 0.2s ease",
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: "0.5rem",
                                    }}
                                    onMouseEnter={e => (e.currentTarget.style.borderColor = "#00a3ff")}
                                    onMouseLeave={e => (e.currentTarget.style.borderColor = "#2a2f3b")}
                                >
                                    <span style={{ color: "white", fontFamily: "Inter, sans-serif", fontWeight: "600", fontSize: "1.4rem" }}>
                                        Join with a Code
                                    </span>
                                    <span style={{ color: "#78879e", fontFamily: "Inter, sans-serif", fontSize: "1.1rem" }}>
                                        Enter an invite code to join a calendar
                                    </span>
                                </div>
                            </>
                        ) : (
                            <>
                                <input
                                    type="text"
                                    placeholder="Enter invite code"
                                    value={joinCode}
                                    onChange={e => setJoinCode(e.target.value)}
                                    style={{
                                        backgroundColor: "#0f1319",
                                        border: "1px solid #2a2f3b",
                                        borderRadius: "0.8rem",
                                        padding: "1.2rem 1.5rem",
                                        color: "white",
                                        fontSize: "1.4rem",
                                        fontFamily: "Inter, sans-serif",
                                        outline: "none",
                                        width: "100%",
                                        boxSizing: "border-box" as const,
                                    }}
                                    onFocus={e => (e.currentTarget.style.borderColor = "#00a3ff")}
                                    onBlur={e => (e.currentTarget.style.borderColor = "#2a2f3b")}
                                />
                                <div style={{ display: "flex", gap: "1rem" }}>
                                    <button
                                        onClick={() => setShowJoinInput(false)}
                                        style={{
                                            flex: 1,
                                            padding: "1.2rem",
                                            backgroundColor: "#2a2f3b",
                                            border: "none",
                                            borderRadius: "0.8rem",
                                            color: "white",
                                            fontSize: "1.3rem",
                                            fontFamily: "Inter, sans-serif",
                                            cursor: "pointer",
                                        }}
                                    >
                                        Back
                                    </button>
                                    <button
                                        style={{
                                            flex: 1,
                                            padding: "1.2rem",
                                            backgroundColor: "#51cf66",
                                            border: "none",
                                            borderRadius: "0.8rem",
                                            color: "white",
                                            fontSize: "1.3rem",
                                            fontFamily: "Inter, sans-serif",
                                            cursor: "pointer",
                                            fontWeight: "600",
                                        }}
                                    >
                                        Join
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            <nav style={{
                width: "5.5rem",
                height: "100vh",
                backgroundColor: "#161b22",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                paddingTop: "1rem",
                gap: "0.5rem",
                position: "fixed",
                left: 0,
                top: 0,
                zIndex: 50,
            }}>
                {/* Home */}
                <div
                    onClick={() => navigate("/")}
                    style={{
                        width: "3.8rem",
                        height: "3.8rem",
                        backgroundColor: "#00a3ff",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        marginBottom: "0.5rem",
                        transition: "border-radius 0.2s ease",
                    }}
                    onMouseEnter={e => (e.currentTarget.style.borderRadius = "1.2rem")}
                    onMouseLeave={e => (e.currentTarget.style.borderRadius = "50%")}
                >
                    <img
                        src={homeIcon}
                        alt="Home"
                        style={{ width: "2.2rem", height: "2.2rem", objectFit: "contain", filter: "brightness(0) invert(1)" }}
                    />
                </div>

                {/* Separator */}
                <div style={{ width: "60%", height: "2px", backgroundColor: "#2a2f3b", margin: "0.3rem 0" }} />

                {/* Calendar icons */}
                {calendars.map((cal) => (
                    <div
                        key={cal.id}
                        title={cal.name}
                        onClick={() => navigate("/calendar")}
                        style={{
                            width: "3.8rem",
                            height: "3.8rem",
                            backgroundColor: cal.color,
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                            fontSize: "1.3rem",
                            fontWeight: "700",
                            color: "white",
                            transition: "border-radius 0.2s ease, transform 0.15s ease",
                            fontFamily: "Inter, sans-serif",
                        }}
                        onMouseEnter={e => {
                            e.currentTarget.style.borderRadius = "1.2rem"
                            e.currentTarget.style.transform = "scale(1.08)"
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.borderRadius = "50%"
                            e.currentTarget.style.transform = "scale(1)"
                        }}
                    >
                        {cal.name.charAt(0)}
                    </div>
                ))}

                {/* Add calendar button */}
                <div
                    title="Add Calendar"
                    onClick={() => setShowModal(true)}
                    style={{
                        width: "3.8rem",
                        height: "3.8rem",
                        backgroundColor: "#2a2f3b",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        fontSize: "2.5rem",
                        color: "rgb(236, 226, 226)",
                        marginTop: "0.3rem",
                        transition: "border-radius 0.2s ease, background-color 0.2s ease",
                    }}
                    onMouseEnter={e => {
                        e.currentTarget.style.borderRadius = "1.2rem"
                        e.currentTarget.style.backgroundColor = "#1e2426"
                    }}
                    onMouseLeave={e => {
                        e.currentTarget.style.borderRadius = "50%"
                        e.currentTarget.style.backgroundColor = "#2a2f3b"
                    }}
                >
                    +
                </div>

                {/* User Profile */}
                <div
                    title="Profile"
                    onClick={() => navigate("/login")}
                    style={{
                        marginTop: "auto",
                        marginBottom: "1rem",
                        width: "3.8rem",
                        height: "3.8rem",
                        backgroundColor: "#2a2f3b",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        fontSize: "1.8rem",
                        color: "white",
                        transition: "border-radius 0.2s ease",
                    }}
                    onMouseEnter={e => (e.currentTarget.style.borderRadius = "1.2rem")}
                    onMouseLeave={e => (e.currentTarget.style.borderRadius = "50%")}
                >
                    Test
                </div>
            </nav>
        </>
    )
}

export default NavBar