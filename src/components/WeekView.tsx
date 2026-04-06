import { useState } from "react"
import { useNavigate } from "react-router-dom"

interface Event {
    id: number
    title: string
    date: Date
    startTime: string
    endTime: string
    color: string
    calendarName: string
}

const SAMPLE_EVENTS: Event[] = [
    { id: 1, title: "Meeting with John", date: new Date(2026, 3, 5), startTime: "9:00", endTime: "10:00", color: "#00a3ff", calendarName: "Test Calendar" },
]

const WeekView = () => {
    const navigate = useNavigate()
    const [currentWeekStart, setCurrentWeekStart] = useState(() => {
        const today = new Date()
        const day = today.getDay()
        const start = new Date(today)
        start.setDate(today.getDate() - day)
        start.setHours(0, 0, 0, 0)
        return start
    })

    const weekDays = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(currentWeekStart)
        d.setDate(currentWeekStart.getDate() + i)
        return d
    })

    const goToPrevWeek = () => {
        const prev = new Date(currentWeekStart)
        prev.setDate(prev.getDate() - 7)
        setCurrentWeekStart(prev)
    }

    const goToNextWeek = () => {
        const next = new Date(currentWeekStart)
        next.setDate(next.getDate() + 7)
        setCurrentWeekStart(next)
    }

    const getEventsForDay = (day: Date) =>
        SAMPLE_EVENTS.filter(e =>
            e.date.getFullYear() === day.getFullYear() &&
            e.date.getMonth() === day.getMonth() &&
            e.date.getDate() === day.getDate()
        )

    const today = new Date()
    const isToday = (day: Date) =>
        day.getDate() === today.getDate() &&
        day.getMonth() === today.getMonth() &&
        day.getFullYear() === today.getFullYear()

    const monthYear = currentWeekStart.toLocaleString('default', { month: 'long', year: 'numeric' })
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

    const weekEvents = SAMPLE_EVENTS.filter(e =>
        weekDays.some(d =>
            d.getDate() === e.date.getDate() &&
            d.getMonth() === e.date.getMonth() &&
            d.getFullYear() === e.date.getFullYear()
        )
    )

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap');

                .week-page {
                    min-height: 100vh;
                    background-color: #0f1319;
                    margin-left: 5.5rem;
                    padding: 2rem 4rem;
                    font-family: 'Inter', sans-serif;
                    box-sizing: border-box;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                }
                
                .week-layout {
                    display: flex;
                    gap: 2rem;
                    width: 100%;
                    max-width: 120rem;
                    align-items: flex-start;
                }

                .week-main {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                    flex: 1;
                }

                .week-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 2rem;
                }

                .week-title {
                    font-size: 2.5rem;
                    font-weight: bold;
                    color: rgb(236, 226, 226);
                    letter-spacing: 0.1rem;
                }

                .week-nav {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }

                .week-nav-btn {
                    width: 3.5rem;
                    height: 3.5rem;
                    background-color: #161b22;
                    border: none;
                    border-radius: 50%;
                    color: #78879e;
                    font-size: 1.8rem;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: background-color 0.2s ease;
                }

                .week-nav-btn:hover {
                    background-color: #2a2f3b;
                }

                .week-grid {
                    display: grid;
                    grid-template-columns: repeat(7, minmax(14rem, 1fr));
                    gap: 1rem;
                    height: 50vh;
                    width: 100%;
                    max-width: 120rem;
                    overflow-x: auto;
                }

                .week-day-col {
                    background-color: #161b22;
                    border-radius: 1.5rem;
                    padding: 1.5rem 1rem;
                    display: flex;
                    flex-direction: column;
                    gap: 0.8rem;
                    overflow-y: auto;
                    transition: transform 0.2s ease;
                }

                .week-day-col:hover {
                    transform: translateY(-2px);
                }

                .week-day-col.today-col {
                    border: 1.5px solid #00a3ff;
                }

                .week-day-header {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    margin-bottom: 0.5rem;
                }

                .week-day-name {
                    font-size: 1rem;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.1rem;
                    color: #78879e;
                }

                .week-day-number {
                    font-size: 2rem;
                    font-weight: 300;
                    color: white;
                    line-height: 1;
                    margin-top: 0.3rem;
                }

                .week-day-number.today-num {
                    color: #00a3ff;
                    font-weight: 700;
                }

                .week-divider {
                    height: 1px;
                    background-color: #2a2f3b;
                    margin-bottom: 0.5rem;
                }

                .week-event {
                    border-radius: 0.8rem;
                    padding: 0.8rem;
                    display: flex;
                    flex-direction: column;
                    gap: 0.2rem;
                    cursor: pointer;
                    transition: opacity 0.2s ease, transform 0.15s ease;
                }

                .week-event:hover {
                    opacity: 0.85;
                    transform: scale(1.02);
                }

                .week-event-title {
                    font-size: 1.1rem;
                    font-weight: 600;
                    color: white;
                    overflow-wrap: break-word;
                }

                .week-event-time {
                    font-size: 0.9rem;
                    color: rgba(255,255,255,0.7);
                }

                .week-empty {
                    color: #2a2f3b;
                    font-size: 1rem;
                    text-align: center;
                    margin-top: auto;
                    margin-bottom: auto;
                }

                .back-btn {
                    background: none;
                    border: none;
                    color: #78879e;
                    font-size: 1.3rem;
                    font-family: 'Inter', sans-serif;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0;
                    transition: color 0.2s ease;
                }

                .back-btn:hover {
                    color: #00a3ff;
                }

                .week-events-panel {
                    width: 22rem;
                    min-width: 22rem;
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                }

                .week-events-title {
                    font-size: 1.4rem;
                    font-weight: 600;
                    color: white;
                    letter-spacing: 0.05rem;
                }

                .week-event-card {
                    background-color: #161b22;
                    border-radius: 1rem;
                    padding: 1.2rem 1.5rem;
                    display: flex;
                    flex-direction: column;
                    gap: 0.4rem;
                }

                .week-event-card-title {
                    font-size: 1.2rem;
                    font-weight: 600;
                    color: white;
                    display: flex;
                    align-items: center;
                }

                .week-event-card-date {
                    font-size: 1rem;
                    color: #78879e;
                }

                .week-event-card-time {
                    font-size: 1rem;
                    color: #78879e;
                }

                .week-event-dot {
                    width: 0.8rem;
                    height: 0.8rem;
                    border-radius: 50%;
                    display: inline-block;
                    margin-right: 0.5rem;
                    flex-shrink: 0;
                }
            `}</style>

            <div className="week-page">

                <div className="week-layout">
                    <div className="week-main">
                        <div className="week-header">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                                <button className="back-btn" onClick={() => navigate("/calendar")}>← Back</button>
                                <h1 className="week-title">{monthYear}</h1>
                            </div>
                            <div className="week-nav">
                                <button className="week-nav-btn" onClick={goToPrevWeek}>‹</button>
                                <button className="week-nav-btn" onClick={goToNextWeek}>›</button>
                            </div>
                        </div>

                        <div className="week-grid">
                            {weekDays.map((day, i) => {
                                const events = getEventsForDay(day)
                                const todayCol = isToday(day)
                                return (
                                    <div key={i} className={`week-day-col ${todayCol ? 'today-col' : ''}`}>
                                        <div className="week-day-header">
                                            <span className="week-day-name">{dayNames[i]}</span>
                                            <span className={`week-day-number ${todayCol ? 'today-num' : ''}`}>
                                                {day.getDate()}
                                            </span>
                                        </div>
                                        <div className="week-divider" />
                                        {events.length === 0
                                            ? <span className="week-empty">—</span>
                                            : events.map(event => (
                                                <div key={event.id} className="week-event" style={{ backgroundColor: event.color }}>
                                                    <span className="week-event-title">{event.title}</span>
                                                    <span className="week-event-time">{event.startTime} – {event.endTime}</span>
                                                    <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', marginTop: '0.2rem' }}>{event.calendarName}</span>
                                                </div>
                                            ))
                                        }
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    <div className="week-events-panel">
                        <span className="week-events-title">This Week's Events</span>
                        {weekEvents.length === 0
                            ? <div className="week-event-card">
                                <span style={{ color: '#78879e', fontSize: '1.1rem' }}>No events this week</span>
                              </div>
                            : weekEvents.map(event => (
                                <div key={event.id} className="week-event-card">
                                    <span className="week-event-card-title">
                                        <span className="week-event-dot" style={{ backgroundColor: event.color }} />
                                        {event.title}
                                    </span>
                                    <span style={{ fontSize: '1rem', color: event.color, fontWeight: '600' }}>{event.calendarName}</span>
                                    <span className="week-event-card-date">
                                        {event.date.toLocaleDateString('default', { weekday: 'long', month: 'short', day: 'numeric' })}
                                    </span>
                                    <span className="week-event-card-time">{event.startTime} – {event.endTime}</span>
                                </div>
                            ))
                        }
                    </div>
                </div>
            </div>
        </>
    )
}

export default WeekView