import { useNavigate } from "react-router-dom"

function NavBar() {
    const navigate = useNavigate();
    const calendars = [
        { id: 1, name: "Calendar", color: "#00a3ff" },
    ];

    return (
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
            {/* home */}
            <div onClick={() => navigate("/")}
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
                fontSize: "2rem",
                transition: "border-radius 0.2s ease",
                color: "white",
        }}
        onMouseEnter={e => (e.currentTarget.style.borderRadius = "1.2rem")}
        onMouseLeave={e => (e.currentTarget.style.borderRadius = "50%")}
    >
                Home
            </div>
            <div style={{ width: "60%", height: "2px", backgroundColor: "#2a2f3b", margin: "0.3rem 0" }} />
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
                        e.currentTarget.style.borderRadius = "1.2rem";
                        e.currentTarget.style.transform = "scale(1.08)";
                    }}
                    onMouseLeave={e => {
                        e.currentTarget.style.borderRadius = "50%";
                        e.currentTarget.style.transform = "scale(1)";
                    }}
                >
                    {cal.name.charAt(0)}
                </div>
            ))}

            {/* add calendar */}
            <div style={{
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
                    e.currentTarget.style.borderRadius = "1.2rem";
                    e.currentTarget.style.backgroundColor = "#1e2426";
                }}
                onMouseLeave={e => {
                    e.currentTarget.style.borderRadius = "50%";
                    e.currentTarget.style.backgroundColor = "#2a2f3b";
                }}
            >
                +
            </div>

            {/* user */}
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
                transition: "border-radius 0.2s ease",
                color: 'white',
            }}
                onMouseEnter={e => (e.currentTarget.style.borderRadius = "1.2rem")}
                onMouseLeave={e => (e.currentTarget.style.borderRadius = "50%")}
            >
                Test
            </div>
        </nav>
    );
}

export default NavBar;