import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { doSignInWithEmailAndPassword, doCreateUserWithEmailAndPassword } from "./firebase/auth"
import { useAuth } from "./context/auth/index"

function Login() {
    const navigate = useNavigate()
    const [isSignUp, setIsSignUp] = useState(false)
    const { userLoggedIn } = useAuth()
    const [email, setEmail]  = useState("")
    const [password, setPassword] = useState("");
    const [comfirmPassword, setComfirmPassword] = useState("");
    const [error, setError] = useState("")

    useEffect(() => {
        if (userLoggedIn) {
            navigate("/home")
        }
    }, [userLoggedIn, navigate])

    const onSubmit = async () => {
        setError("")
    try {
        if (isSignUp) {
            if (password !== comfirmPassword) {
                setError("Passwords do not match")
                return
            }
            await doCreateUserWithEmailAndPassword(email, password)
            navigate("/home")
        } else {
            await doSignInWithEmailAndPassword(email, password)
            navigate("/home")
        }
    } catch (err: any) {
        const code = err.code
        if (code === "auth/invalid-credential" || code === "auth/wrong-password" || code === "auth/user-not-found") {
            setError("Incorrect email or password")
        } else if (code === "auth/invalid-email") {
            setError("Invalid email address")
        } else if (code === "auth/too-many-requests") {
            setError("Too many attempts, please try again later")
        } else {
            setError("Something went wrong, please try again")
        }
    }
}


    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500&display=swap');

                .login-page {
                    min-height: 100vh;
                    width: 100%;
                    background-color: #0f1319;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-family: 'DM Sans', sans-serif;
                    position: relative;
                    overflow: hidden;
                }

                .login-bg-glow {
                    position: absolute;
                    width: 40rem;
                    height: 40rem;
                    background: radial-gradient(circle, rgba(0, 163, 255, 0.08) 0%, transparent 70%);
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    pointer-events: none;
                }

                .login-card {
                    background-color: #161b22;
                    border-radius: 2rem;
                    padding: 4rem 3.5rem;
                    width: clamp(32rem, 35vw, 45rem);
                    display: flex;
                    flex-direction: column;
                    gap: 1.8rem;
                    box-shadow: 0 2rem 6rem rgba(0, 0, 0, 0.5);
                    position: relative;
                    animation: fadeUp 0.5s ease forwards;
                }

                @keyframes fadeUp {
                    from { opacity: 0; transform: translateY(2rem); }
                    to { opacity: 1; transform: translateY(0); }
                }

                .login-title {
                    font-family: 'Inter', sans-serif;
                    font-weight: bold;
                    font-size: 3rem;
                    color: rgb(236, 226, 226);
                    margin: 0;
                    text-align: center;
                    margin: -1.5rem 0 0 0;
                    letter-spacing: 0.05rem;
                }

                .login-subtitle {
                    font-size: 1.3rem;
                    color: #78879e;
                    margin: -1rem 0 0 0;
                    font-weight: 300;
                }

                .login-input-group {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                }

                .login-input {
                    background-color: #0f1319;
                    border: 1px solid #2a2f3b;
                    border-radius: 0.8rem;
                    padding: 1.2rem 1.5rem;
                    color: white;
                    font-size: 1.4rem;
                    font-family: 'DM Sans', sans-serif;
                    outline: none;
                    transition: border-color 0.2s ease;
                    width: 100%;
                    box-sizing: border-box;
                }

                .login-input::placeholder {
                    color: #3d4a5c;
                }

                .login-input:focus {
                    border-color: #00a3ff;
                }

                .login-btn {
                    background-color: #00a3ff;
                    color: white;
                    border: none;
                    border-radius: 0.8rem;
                    padding: 1.3rem;
                    font-size: 1.5rem;
                    font-family: 'DM Sans', sans-serif;
                    font-weight: 500;
                    cursor: pointer;
                    transition: background-color 0.2s ease, transform 0.1s ease;
                    letter-spacing: 0.05rem;
                }

                .login-btn:hover {
                    background-color: #0090e0;
                }

                .login-btn:active {
                    transform: translateY(1px);
                }

                .login-divider {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    color: #2a2f3b;
                    font-size: 1.2rem;
                }

                .login-divider::before,
                .login-divider::after {
                    content: '';
                    flex: 1;
                    height: 1px;
                    background-color: #2a2f3b;
                }

                .login-toggle {
                    text-align: center;
                    font-size: 1.3rem;
                    color: #78879e;
                }

                .login-toggle span {
                    color: #00a3ff;
                    cursor: pointer;
                    font-weight: 500;
                }

                .login-toggle span:hover {
                    text-decoration: underline;
                }
            `}</style>

            <div className="login-page">
                <div className="login-bg-glow" />
                <div className="login-card">
                    <div className="login-accent" />
                    <h1 className="login-title">Synced</h1>
                    <div className="login-input-group">
                        <input
                            className="login-input"
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <input
                            className="login-input"
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        {isSignUp && (
                            <input
                                className="login-input"
                                type="password"
                                placeholder="Confirm password"
                                value={comfirmPassword}
                                onChange={(e) => setComfirmPassword(e.target.value)}
                            />
                        )}
                    </div>
                    
                    {error && (
                        <div style={{
                            backgroundColor: "rgba(255, 80, 80, 0.1)",
                            border: "1px solid rgba(255, 80, 80, 0.4)",
                            borderRadius: "0.8rem",
                            padding: "1rem 1.5rem",
                            color: "#ff5050",
                            fontFamily: "Inter, sans-serif",
                            fontSize: "1.2rem",
                            textAlign: "center",
                        }}>
                            {error}
                        </div>
                    )}

                    <button className="login-btn" onClick={() => onSubmit()}>
                        {isSignUp ? "Create Account" : "Sign In"}
                    </button>

                    <div className="login-toggle">
                        {isSignUp ? "" : ""}
                        <span onClick={() => setIsSignUp(!isSignUp)}>
                            {isSignUp ? "Sign in" : "Sign up"}
                        </span>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Login