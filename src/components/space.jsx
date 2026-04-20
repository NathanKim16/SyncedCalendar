{(userRole === "owner" || userRole === "admin") && (
    <div style={{ position: "relative" }}>
    <button
        onClick={() => setMemberMenuOpenId(
        memberMenuOpenId === member.id ? null : member.id
        )}
        style={{
        background: "none",
        border: "none",
        color: "#78879e",
        fontSize: "1.4rem",
        cursor: "pointer",
        padding: "0.2rem 0.5rem",
        borderRadius: "0.4rem",
        }}
    >
        ···
    </button>

    {memberMenuOpenId === member.id && (
        <div style={{
        position: "absolute",
        right: 0,
        top: "2.2rem",
        backgroundColor: "#1e2426",
        border: "1px solid #2a2f3b",
        borderRadius: "0.8rem",
        padding: "0.4rem",
        zIndex: 600,
        minWidth: "10rem",
        boxShadow: "0 0.5rem 1.5rem rgba(0,0,0,0.4)",
        }}>
        <div
            onClick={() => handleKickMember(member.id)}
            style={{
            padding: "0.7rem 1rem",
            color: "#ff5050",
            fontSize: "1rem",
            cursor: "pointer",
            borderRadius: "0.5rem",
            fontFamily: "Inter, sans-serif",
            }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = "#2a2f3b"}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}
        >
            Kick from Calendar
        </div>
        </div>
    )}
    </div>
)}