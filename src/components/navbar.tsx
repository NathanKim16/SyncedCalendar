import { useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"
import { useAuth } from "./context/auth/index"
import { doSignOut } from "./firebase/auth"
import { updateProfile } from "firebase/auth"
import { auth } from "../firebase"
import { setUser } from "../services/firestoreService"
import homeIcon from "../assets/home.png"

function NavBar() {
    const navigate = useNavigate()
    const [showModal, setShowModal] = useState(false)
    const [showJoinInput, setShowJoinInput] = useState(false)
    const [joinCode, setJoinCode] = useState("")
    const [displayNameInput, setDisplayNameInput] = useState("")
    const [displayNameError, setDisplayNameError] = useState("")
    const [savingDisplayName, setSavingDisplayName] = useState(false)
    const { currentUser, setCurrentUser } = useAuth()
    const userInitial = ((currentUser?.displayName?.trim()?.charAt(0).toUpperCase() || currentUser?.email?.charAt(0).toUpperCase()) ?? "Login")
    const [showUserMenu, setShowUserMenu] = useState(false)

    useEffect(() => {
        setDisplayNameInput(currentUser?.displayName ?? "")
        setDisplayNameError("")
    }, [currentUser?.displayName])

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
                <div style={{ marginTop: "auto", marginBottom: "1rem", position: "relative" }}>
                    <div
                        title="Profile"
                        onClick={() => setShowUserMenu(!showUserMenu)}
                        style={{
                            width: "3.8rem",
                            height: "3.8rem",
                            backgroundColor: "#2a2f3b",
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                            fontSize: "1.5rem",
                            fontWeight: "700",
                            color: "white",
                            fontFamily: "Inter, sans-serif",
                            transition: "border-radius 0.2s ease",
                        }}
                        onMouseEnter={e => (e.currentTarget.style.borderRadius = "1.2rem")}
                        onMouseLeave={e => (e.currentTarget.style.borderRadius = "50%")}
                    >
                        {userInitial}
                    </div>
                    {showUserMenu && currentUser && (
                        <div style={{
                            position: "absolute",
                            left: "5rem",
                            bottom: 0,
                            backgroundColor: "#161b22",
                            borderRadius: "0.8rem",
                            padding: "0.5rem",
                            boxShadow: "0 0.5rem 2rem rgba(0,0,0,0.4)",
                            border: "1px solid #2a2f3b",
                            whiteSpace: "nowrap",
                            zIndex: 100,
                        }}>
                            <div style={{
                                padding: "0.8rem 1.5rem",
                                color: "#ffffff",
                                fontSize: "1.1rem",
                                fontFamily: "Inter, sans-serif",
                                borderBottom: "1px solid #2a2f3b",
                                marginBottom: "0.6rem",
                            }}>
                                {currentUser.displayName ? `Display name: ${currentUser.displayName}` : "No display name set"}
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem", padding: "0 1.5rem 0.5rem" }}>
                                <div style={{ position: "relative", width: "18rem" }}>
                                    <input
                                        type="text"
                                        placeholder="Enter display name"
                                        value={displayNameInput}
                                        maxLength={16}
                                        onChange={e => setDisplayNameInput(e.target.value.replace(/\s+/g, ""))}
                                        onKeyDown={e => { if (/\s/.test(e.key)) e.preventDefault() }}
                                        onPaste={e => {
                                            e.preventDefault();
                                            const pasted = e.clipboardData.getData("text").replace(/\s+/g, "").slice(0, 16);
                                            setDisplayNameInput(pasted);
                                        }}
                                        style={{
                                            backgroundColor: "#0f1319",
                                            border: "1px solid #2a2f3b",
                                            borderRadius: "0.8rem",
                                            padding: "0.9rem 5.5rem 0.9rem 1rem",
                                            color: "white",
                                            fontSize: "1rem",
                                            fontFamily: "Inter, sans-serif",
                                            outline: "none",
                                            width: "100%",
                                            boxSizing: "border-box" as const,
                                        }}
                                    />
                                    <button
                                        onClick={async () => {
                                            const trimmed = displayNameInput.trim();
                                            if (!trimmed) {
                                                setDisplayNameError("Display name cannot be empty.");
                                                return;
                                            }
                                            if (trimmed.length > 16) {
                                                setDisplayNameError("Display name must be 16 characters or less.");
                                                return;
                                            }
                                            if (!currentUser) return;
                                            if (trimmed === currentUser.displayName) {
                                                setShowUserMenu(false);
                                                return;
                                            }
                                            setSavingDisplayName(true);
                                            try {
                                                        await updateProfile(auth.currentUser ?? currentUser, { displayName: trimmed });
                                                if (currentUser.uid) {
                                                    await setUser(currentUser.uid, {
                                                        username: trimmed,
                                                        email: currentUser.email || "",
                                                    });
                                                }
                                                setCurrentUser({ ...currentUser, displayName: trimmed });
                                                setDisplayNameError("");
                                                setShowUserMenu(false);
                                            } catch (error) {
                                                console.error(error);
                                                setDisplayNameError("Could not update display name.");
                                            } finally {
                                                setSavingDisplayName(false);
                                            }
                                        }}
                                        disabled={savingDisplayName || displayNameInput.trim().length === 0}
                                        style={{
                                            position: "absolute",
                                            right: "0.2rem",
                                            top: "0.2rem",
                                            bottom: "0.2rem",
                                            padding: "0 1rem",
                                            backgroundColor: "transparent",
                                            border: "none",
                                            color: "white",
                                            fontSize: "1rem",
                                            fontFamily: "Inter, sans-serif",
                                            cursor: savingDisplayName ? "not-allowed" : "pointer",
                                            fontWeight: "600",
                                            borderRadius: "0.6rem",
                                        }}
                                    >
                                        {savingDisplayName ? "Saving..." : "Set"}
                                    </button>
                                </div>
                                {displayNameError && (
                                    <div style={{ color: "#ff7f7f", fontSize: "0.95rem", fontFamily: "Inter, sans-serif" }}>
                                        {displayNameError}
                                    </div>
                                )}
                            </div>
                            <div style={{
                                padding: "0.8rem 1.5rem",
                                color: "#78879e",
                                fontSize: "1.1rem",
                                fontFamily: "Inter, sans-serif",
                                borderTop: "1px solid #2a2f3b",
                                marginTop: "0.5rem",
                            }}>
                                {currentUser.email}
                            </div>
                            <div
                                onClick={async () => {
                                    await doSignOut()
                                    setShowUserMenu(false)
                                    navigate("/")
                                }}
                                style={{
                                    padding: "0.8rem 1.5rem",
                                    color: "#ff5050",
                                    fontSize: "1.2rem",
                                    fontFamily: "Inter, sans-serif",
                                    cursor: "pointer",
                                    borderRadius: "0.5rem",
                                    transition: "background-color 0.2s ease",
                                }}
                                onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#1e2426")}
                                onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}
                            >
                                Sign Out
                            </div>
                        </div>
                    )}
                </div>
            </nav>
        </>
    )
}

export default NavBar