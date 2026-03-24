import { useState, useEffect } from "react"
import { getEventsByCalendar, createEvent, deleteEvent } from "../services/firestoreService"
import { Timestamp } from "firebase/firestore"
import NavBar from "./navbar"

const CalendarApp = () => {
  // Lists of days and months
  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
  const monthsOfYear = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]

  // Get current date, month, year, and declare setter functions for traversal
  const currentDate = new Date()
  const [currentMonth, setCurrentMonth] = useState(currentDate.getMonth())
  const [currentYear, setCurrentYear] = useState(currentDate.getFullYear())

  const [selectedDay, setSelectedDay] = useState(currentDate)
  const [showEventPopup, setShowEventPopup] = useState(false)

  // ── NEW: Event state ──────────────────────────────────────
  const [events, setEvents] = useState([])
  const [eventTitle, setEventTitle] = useState("")
  const [startHours, setStartHours] = useState(0)
  const [startMinutes, setStartMinutes] = useState(0)
  const [endHours, setEndHours] = useState(0)
  const [endMinutes, setEndMinutes] = useState(0)

  // daysInMonth takes in current year, the future month, and the day just before
  // (the last day of the current month) to get the current months number of days
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
  const daysInPriorMonth = new Date(currentYear, currentMonth, 0).getDate()
  // firstDayOfMonth gets the day of the 1st of the current day and month
  // with 0 being sunday and 6 being saturday
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay()

  // ── NEW: Fetch events on mount ────────────────────────────
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const data = await getEventsByCalendar("YOUR_CALENDAR_ID")
        setEvents(data)
      } catch (error) {
        console.error("Error fetching events:", error)
      }
    }
    fetchEvents()
  }, [])

  const goToPrevMonth = () => {
    setCurrentMonth((prevMonth) => (prevMonth === 0 ? 11 : prevMonth - 1))
    setCurrentYear((prevYear) => (currentMonth === 0 ? prevYear - 1 : prevYear))
  }

  const goToNextMonth = () => {
    setCurrentMonth((nextMonth) => (nextMonth === 11 ? 0 : nextMonth + 1))
    setCurrentYear((nextYear) => (currentMonth === 11 ? nextYear + 1 : nextYear))
  }

  const handleDayClick = (day, month, year) => {
    setSelectedDay(new Date(year, month, day))
    setShowEventPopup(true)
  }

  // ── NEW: Add event handler ────────────────────────────────
  const handleAddEvent = async () => {
    if (!eventTitle.trim()) return

    const start = new Date(selectedDay)
    start.setHours(startHours, startMinutes)

    const end = new Date(selectedDay)
    end.setHours(endHours, endMinutes)

    const newEvent = {
      calendar_id: "YOUR_CALENDAR_ID",
      created_by: "YOUR_USER_ID",
      title: eventTitle,
      description: "",
      start_time: Timestamp.fromDate(start),
      end_time: Timestamp.fromDate(end),
      all_day: false,
      location: "",
      rsvp_deadline: "",
    }

    try {
      await createEvent(newEvent)
      const updated = await getEventsByCalendar("YOUR_CALENDAR_ID")
      setEvents(updated)
      // Reset popup state
      setEventTitle("")
      setStartHours(0)
      setStartMinutes(0)
      setEndHours(0)
      setEndMinutes(0)
      setShowEventPopup(false)
    } catch (error) {
      console.error("Error adding event:", error)
    }
  }

  // ── NEW: Delete event handler ─────────────────────────────
  const handleDeleteEvent = async (id) => {
    try {
      await deleteEvent(id)
      const updated = await getEventsByCalendar("YOUR_CALENDAR_ID")
      setEvents(updated)
    } catch (error) {
      console.error("Error deleting event:", error)
    }
  }

  return (
    <div className="calendar-app">
      <NavBar />
      <div className="sidebar"></div>
      <div className="calendar">
        <h1 className="heading">Synced</h1>
        <div className="navigate-date">
          <h2 className="month">{monthsOfYear[currentMonth]},</h2>
          <h2 className="year">{currentYear}</h2>
          <div className="buttons">
            <i className="bx bx-chevron-left" onClick={goToPrevMonth}></i>
            <i className="bx bx-chevron-right" onClick={goToNextMonth}></i>
          </div>
        </div>
        <div className="weekdays">
          {daysOfWeek.map((day) => <span key={day}>{day}</span>)}
        </div>
        <div className="days">
          {/* Previous month's trailing days */}
          {[...Array(firstDayOfMonth).keys()].map((dummy, index) => (
            <span
              className="predays"
              key={`pastday-${index}`}
              onClick={() => {
                const day = daysInPriorMonth - firstDayOfMonth + index + 1
                const newMonth = currentMonth === 0 ? 11 : currentMonth - 1
                const newYear = currentMonth === 0 ? currentYear - 1 : currentYear
                goToPrevMonth()
                handleDayClick(day, newMonth, newYear)
              }}
            >
              {daysInPriorMonth - firstDayOfMonth + index + 1}
            </span>
          ))}

          {/* Current month's days */}
          {[...Array(daysInMonth).keys()].map((dummy, index) => (
            <span
              onClick={() => handleDayClick(index + 1, currentMonth, currentYear)}
              className={
                (index + 1) === selectedDay.getDate() &&
                selectedDay.getMonth() === currentMonth &&
                selectedDay.getFullYear() === currentYear
                  ? "selected"
                  : index + 1 === currentDate.getDate() &&
                    currentMonth === currentDate.getMonth() &&
                    currentYear === currentDate.getFullYear()
                  ? "today"
                  : "neither"
              }
              key={index + 1}
            >
              {index + 1}
            </span>
          ))}

          {/* Next month's leading days */}
          {[...Array(Math.max(0, 42 - firstDayOfMonth - daysInMonth)).keys()].map((dummy, index) => (
            <span
              className="postdays"
              key={`futureday-${index}`}
              onClick={() => {
                const day = index + 1
                const newMonth = currentMonth === 11 ? 0 : currentMonth + 1
                const newYear = currentMonth === 11 ? currentYear + 1 : currentYear
                goToNextMonth()
                handleDayClick(day, newMonth, newYear)
              }}
            >
              {index + 1}
            </span>
          ))}
        </div>

        {/* ── Event Popup ── */}
        {showEventPopup && (
          <div className="event-popup">
            <div className="time-input-start">
              <div className="event-popup-time">Start Time</div>
              {/* ── NEW: Controlled inputs ── */}
              <input
                type="number"
                name="hours"
                min={0}
                max={24}
                className="hours"
                value={startHours}
                onChange={(e) => setStartHours(Number(e.target.value))}
              />
              <input
                type="number"
                name="minutes"
                min={0}
                max={60}
                className="minutes"
                value={startMinutes}
                onChange={(e) => setStartMinutes(Number(e.target.value))}
              />
            </div>
            <div className="time-input-end">
              <div className="event-popup-time">End Time</div>
              <input
                type="number"
                name="hours"
                min={0}
                max={24}
                className="hours"
                value={endHours}
                onChange={(e) => setEndHours(Number(e.target.value))}
              />
              <input
                type="number"
                name="minutes"
                min={0}
                max={60}
                className="minutes"
                value={endMinutes}
                onChange={(e) => setEndMinutes(Number(e.target.value))}
              />
            </div>
            {/* ── NEW: Controlled textarea ── */}
            <textarea
              placeholder="Enter Event Text (Maximum 60 Characters)"
              maxLength={60}
              value={eventTitle}
              onChange={(e) => setEventTitle(e.target.value)}
            ></textarea>
            {/* ── NEW: onClick wired to handleAddEvent ── */}
            <button className="event-pop-btn" onClick={handleAddEvent}>
              Add Event
            </button>
            <button
              className="close-event-popup"
              onClick={() => setShowEventPopup(false)}
            >
              <i className="bx bx-x"></i>
            </button>
          </div>
        )}
      </div>

      {/* ── NEW: Dynamic event list from Firestore ── */}
      <div className="events">
        {events.map((event) => (
          <div className="event" key={event.id}>
            <div className="event-date-wrapper">
              <div className="event-date">
                {event.start_time.toDate().toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </div>
              <div className="event-times">
                <div className="event-start-time">
                  {event.start_time.toDate().toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
                <div>-</div>
                <div className="event-end-time">
                  {event.end_time.toDate().toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            </div>
            <div className="event-text">{event.title}</div>
            <div className="event-button">
              <i className="bx bxs-edit-alt"></i>
              {/* ── NEW: Delete wired to handleDeleteEvent ── */}
              <i
                className="bx bxs-message-alt-x"
                onClick={() => handleDeleteEvent(event.id)}
              ></i>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default CalendarApp
