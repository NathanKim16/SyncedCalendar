import { useNavigate, useLocation } from "react-router-dom"
import { useState, useEffect } from "react"
import { useAuth } from "./context/auth/index"
import { doSignOut } from "./firebase/auth"
import { updateProfile } from "firebase/auth"
import { auth } from "../firebase"
import { setUser, createCalendar, createMembership, getMembershipsByUser, getCalendar, getMembershipByUserAndCalendar, updateCalendar, deleteCalendar, deleteEventsByCalendar, deleteMembershipsByCalendar } from "../services/firestoreService"
import { Timestamp } from "firebase/firestore"
import homeIcon from "../assets/home.png"
import { inviteCodeFunction } from "../services/CodeInvite"

function NavBar() {
    const navigate = useNavigate()
    const [showModal, setShowModal] = useState(false)
    const [showJoinInput, setShowJoinInput] = useState(false)
    const [showCreateInput, setShowCreateInput] = useState(false)
    const [joinCode, setJoinCode] = useState("")
    const [calendarName, setCalendarName] = useState("")
    const [calendarColor, setCalendarColor] = useState("#00a3ff")
    const [displayNameInput, setDisplayNameInput] = useState("")
    const [displayNameError, setDisplayNameError] = useState("")
    const [savingDisplayName, setSavingDisplayName] = useState(false)
    const [creatingCalendar, setCreatingCalendar] = useState(false)
    const [calendars, setCalendars] = useState<any[]>([])
    const { currentUser, setCurrentUser } = useAuth()
    const location = useLocation()
    const currentCalendarId = location.pathname.startsWith('/calendar/') ? location.pathname.split('/')[2] : null
    const userInitial = ((currentUser?.displayName?.trim()?.charAt(0).toUpperCase() || currentUser?.email?.charAt(0).toUpperCase()) ?? "Login")
    const [showUserMenu, setShowUserMenu] = useState(false)
    const [refreshCalendars, setRefreshCalendars] = useState(false)
    const [showCalendarPopup, setShowCalendarPopup] = useState(false)
    const [selectedCalendarForPopup, setSelectedCalendarForPopup] = useState<any>(null)
    const [userCalendarRole, setUserCalendarRole] = useState<string | null>(null)
    const [editingCalendarName, setEditingCalendarName] = useState("")
    const [editingCalendarColor, setEditingCalendarColor] = useState("")
    const [deletingCalendar, setDeletingCalendar] = useState(false)
    const [popupPosition, setPopupPosition] = useState({ top: 0, left: 0 })


    useEffect(() => {
        setDisplayNameInput(currentUser?.displayName ?? "")
        setDisplayNameError("")
    }, [currentUser?.displayName])

    // Fetch user's calendars from database
    useEffect(() => {
        if (!currentUser?.uid) return
        
        const fetchCalendars = async () => {
            try {
                const memberships = await getMembershipsByUser(currentUser.uid)
                const calendarDocs = await Promise.all(
                    memberships.map(m => getCalendar(m.cal_id))
                )
                const calendarList = calendarDocs
                    .filter(doc => doc.exists())
                    .map(doc => ({ id: doc.id, ...doc.data() }))
                setCalendars(calendarList)
            } catch (error) {
                console.error("Error fetching calendars:", error)
            }
        }
        
        fetchCalendars()
    }, [currentUser?.uid, refreshCalendars])

    // Close popups on outside click
    useEffect(() => {
        const handleClickOutside = () => {
            setShowUserMenu(false)
            setShowCalendarPopup(false)
        }
        
        if (showUserMenu || showCalendarPopup) {
            const timeoutId = setTimeout(() => {
                document.addEventListener("click", handleClickOutside)
            }, 0)
            
            return () => {
                clearTimeout(timeoutId)
                document.removeEventListener("click", handleClickOutside)
            }
        }
    }, [showUserMenu, showCalendarPopup])

    const closeModal = () => {
        setShowModal(false)
        setShowJoinInput(false)
        setShowCreateInput(false)
        setJoinCode("")
        setCalendarName("")
        setCalendarColor("#00a3ff")
    }

    const handleCreateCalendar = async () => {
        if (!calendarName.trim()) return
        if (!currentUser?.uid) return

        setCreatingCalendar(true)
        try {
            // Create the calendar
            const calendarData = {
                name: calendarName,
                description: "",
                owner_id: currentUser.uid,
                icon: "",
                color: calendarColor,
                created_at: Timestamp.now(),
            }
            const calendarRef = await createCalendar(calendarData)

            // Create membership for the owner
            const membershipData = {
                user_id: currentUser.uid,
                cal_id: calendarRef.id,
                role: "owner",
                permissions: ["admin", "create_event", "delete_event", "manage_members"],
                joined_at: Timestamp.now(),
            }
            await createMembership(membershipData)

            // Reset form and close modal
            setCalendarName("")
            setCalendarColor("#00a3ff")
            setShowModal(false)
            setShowCreateInput(false)
            // Trigger refetch of calendars
            setRefreshCalendars(prev => !prev)
        } catch (error) {
            console.error("Error creating calendar:", error)
        } finally {
            setCreatingCalendar(false)
        }
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
                            {showCreateInput ? "Create a Calendar" : showJoinInput ? "Join a Calendar" : "Add a Calendar"}
                        </h2>

                        {!showCreateInput && !showJoinInput ? (
                            <>
                                {/* Create */}
                                <div
                                    onClick={() => setShowCreateInput(true)}
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
                        ) : showCreateInput ? (
                            <>
                                <input
                                    type="text"
                                    placeholder="Calendar name"
                                    value={calendarName}
                                    onChange={e => setCalendarName(e.target.value)}
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
                                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                                    <span style={{ color: "#ddd", fontFamily: "Inter, sans-serif", fontSize: "1.2rem", fontWeight: "600" }}>
                                        Color:
                                    </span>
                                    <input
                                        type="color"
                                        value={calendarColor}
                                        onChange={e => setCalendarColor(e.target.value)}
                                        style={{
                                            width: "4rem",
                                            height: "3rem",
                                            border: "none",
                                            borderRadius: "0.5rem",
                                            cursor: "pointer",
                                        }}
                                    />
                                </div>
                                <div style={{ display: "flex", gap: "1rem" }}>
                                    <button
                                        onClick={() => setShowCreateInput(false)}
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
                                        onClick={handleCreateCalendar}
                                        disabled={creatingCalendar || !calendarName.trim()}
                                        style={{
                                            flex: 1,
                                            padding: "1.2rem",
                                            backgroundColor: creatingCalendar || !calendarName.trim() ? "#5a5f6b" : "#51cf66",
                                            border: "none",
                                            borderRadius: "0.8rem",
                                            color: "white",
                                            fontSize: "1.3rem",
                                            fontFamily: "Inter, sans-serif",
                                            cursor: creatingCalendar || !calendarName.trim() ? "not-allowed" : "pointer",
                                            fontWeight: "600",
                                        }}
                                    >
                                        {creatingCalendar ? "Creating..." : "Create"}
                                    </button>
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
                                        onClick={() => inviteCodeFunction(joinCode)}
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
                        style={{
                            position: 'relative',
                            display: 'flex',
                            alignItems: 'center',
                            marginBottom: '0.5rem',
                        }}
                    >
                        {cal.id === currentCalendarId && (
                            <div
                                style={{
                                    position: 'absolute',
                                    left: '-10px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    width: '4px',
                                    height: '2.5rem',
                                    backgroundColor: 'white',
                                    borderRadius: '2px',
                                }}
                            />
                        )}
                        <div
                            title={cal.name}
                            onClick={() => navigate(`/calendar/${cal.id}`)}
                            onContextMenu={async (e) => {
                                e.preventDefault()
                                const rect = e.currentTarget.getBoundingClientRect()
                                if (currentUser?.uid) {
                                    const membership = await getMembershipByUserAndCalendar(currentUser.uid, cal.id)
                                    setUserCalendarRole(membership?.role || null)
                                    setSelectedCalendarForPopup(cal)
                                    setEditingCalendarName(cal.name)
                                    setEditingCalendarColor(cal.color)
                                    setPopupPosition({
                                        top: rect.top,
                                        left: rect.right + 15,
                                    })
                                    setShowCalendarPopup(true)
                                }
                            }}
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

                {/* Calendar Info Popup */}
                {showCalendarPopup && selectedCalendarForPopup && (
                    <div onClick={(e) => e.stopPropagation()} style={{
                        position: "fixed",
                        left: `${popupPosition.left}px`,
                        top: `${popupPosition.top}px`,
                        backgroundColor: "#161b22",
                        borderRadius: "0.8rem",
                        padding: "1.5rem",
                        boxShadow: "0 0.5rem 2rem rgba(0,0,0,0.4)",
                        border: "1px solid #2a2f3b",
                        zIndex: 100,
                        width: "25rem",
                    }}>
                        <div style={{
                            padding: "0 0 1rem 0",
                            borderBottom: "1px solid #2a2f3b",
                            marginBottom: "1rem",
                        }}>
                            <h3 style={{
                                color: "#ffffff",
                                fontSize: "1.5rem",
                                fontFamily: "Inter, sans-serif",
                                margin: "0 0 0.5rem 0",
                            }}>
                                {selectedCalendarForPopup.name}
                            </h3>
                            <p style={{
                                color: "#78879e",
                                fontSize: "1.1rem",
                                fontFamily: "Inter, sans-serif",
                                margin: 0,
                            }}>
                                {selectedCalendarForPopup.description || "No description"}
                            </p>
                        </div>

                        {(userCalendarRole === "owner" || userCalendarRole === "admin") && (
                            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                                <div>
                                    <label style={{
                                        color: "#78879e",
                                        fontSize: "1.05rem",
                                        fontFamily: "Inter, sans-serif",
                                        display: "block",
                                        marginBottom: "0.5rem",
                                    }}>
                                        Calendar Name
                                    </label>
                                    <input
                                        type="text"
                                        value={editingCalendarName}
                                        onChange={e => setEditingCalendarName(e.target.value)}
                                        style={{
                                            backgroundColor: "#0f1319",
                                            border: "1px solid #2a2f3b",
                                            borderRadius: "0.5rem",
                                            padding: "0.7rem",
                                            color: "white",
                                            fontSize: "1.1rem",
                                            fontFamily: "Inter, sans-serif",
                                            width: "100%",
                                            boxSizing: "border-box",
                                        }}
                                    />
                                </div>

                                <div>
                                    <label style={{
                                        color: "#78879e",
                                        fontSize: "1.05rem",
                                        fontFamily: "Inter, sans-serif",
                                        display: "block",
                                        marginBottom: "0.5rem",
                                    }}>
                                        Calendar Color
                                    </label>
                                    <input
                                        type="color"
                                        value={editingCalendarColor}
                                        onChange={e => setEditingCalendarColor(e.target.value)}
                                        style={{
                                            width: "100%",
                                            height: "2.5rem",
                                            border: "1px solid #2a2f3b",
                                            borderRadius: "0.5rem",
                                            cursor: "pointer",
                                        }}
                                    />
                                </div>

                                <div style={{ display: "flex", gap: "0.5rem" }}>
                                    <button
                                        onClick={async () => {
                                            if (editingCalendarName.trim()) {
                                                await updateCalendar(selectedCalendarForPopup.id, {
                                                    name: editingCalendarName,
                                                    color: editingCalendarColor,
                                                })
                                                setRefreshCalendars(!refreshCalendars)
                                                setShowCalendarPopup(false)
                                            }
                                        }}
                                        style={{
                                            flex: 1,
                                            backgroundColor: "#00a3ff",
                                            border: "none",
                                            borderRadius: "0.5rem",
                                            padding: "0.7rem",
                                            color: "white",
                                            fontSize: "1.1rem",
                                            fontFamily: "Inter, sans-serif",
                                            cursor: "pointer",
                                        }}
                                    >
                                        Save
                                    </button>
                                    <button
                                        onClick={() => setShowCalendarPopup(false)}
                                        style={{
                                            flex: 1,
                                            backgroundColor: "#2a2f3b",
                                            border: "none",
                                            borderRadius: "0.5rem",
                                            padding: "0.7rem",
                                            color: "white",
                                            fontSize: "1.1rem",
                                            fontFamily: "Inter, sans-serif",
                                            cursor: "pointer",
                                        }}
                                    >
                                        Cancel
                                    </button>
                                </div>

                                <button
                                    onClick={async () => {
                                        if (window.confirm(`Are you sure you want to delete "${selectedCalendarForPopup.name}"? This will remove all events and memberships.`)) {
                                            setDeletingCalendar(true)
                                            try {
                                                await deleteEventsByCalendar(selectedCalendarForPopup.id)
                                                await deleteMembershipsByCalendar(selectedCalendarForPopup.id)
                                                await deleteCalendar(selectedCalendarForPopup.id)
                                                setRefreshCalendars(!refreshCalendars)
                                                setShowCalendarPopup(false)
                                                navigate('/')
                                            } catch (error) {
                                                console.error("Error deleting calendar:", error)
                                            } finally {
                                                setDeletingCalendar(false)
                                            }
                                        }
                                    }}
                                    disabled={deletingCalendar}
                                    style={{
                                        backgroundColor: "#ff4444",
                                        border: "none",
                                        borderRadius: "0.5rem",
                                        padding: "0.7rem",
                                        color: "white",
                                        fontSize: "1.1rem",
                                        fontFamily: "Inter, sans-serif",
                                        cursor: deletingCalendar ? "not-allowed" : "pointer",
                                        opacity: deletingCalendar ? 0.6 : 1,
                                    }}
                                >
                                    {deletingCalendar ? "Deleting..." : "Delete Calendar"}
                                </button>
                            </div>
                        )}
                        {userCalendarRole !== "owner" && userCalendarRole !== "admin" && (
                            <p style={{
                                color: "#78879e",
                                fontSize: "1.05rem",
                                fontFamily: "Inter, sans-serif",
                                textAlign: "center",
                                margin: 0,
                            }}>
                                Only owners and admins can edit this calendar.
                            </p>
                        )}
                    </div>
                )}
            </nav>
        </>
    )
}

export default NavBar