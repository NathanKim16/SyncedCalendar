import { useState, useEffect } from "react"
import { getMembershipsByUser, getCalendar, getEventsByCalendar, createEvent, deleteEvent, updateEvent } from "../services/firestoreService"
import { Timestamp } from "firebase/firestore"
import NavBar from "./navbar"

const CalendarApp = () => {
  //TEMPORARY VARIABLES
    const USER_ID = "usr_00001";

  //Calendar IDs
  const [calendars, setCalendars] = useState([])
  const [activeCalendarId, setActiveCalendarId] = useState(null)

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
  const [eventColor, setEventColor] = useState("#00a3ff")
  const [editingEvent, setEditingEvent] = useState(null)



  //Test Comment
  // daysInMonth takes in current year, the future month, and the day just before
  // (the last day of the current month) to get the current months number of days
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
  const daysInPriorMonth = new Date(currentYear, currentMonth, 0).getDate()
  // firstDayOfMonth gets the day of the 1st of the current day and month
  // with 0 being sunday and 6 being saturday
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay()

  //Fetch Calendars that the user is in
  useEffect(() => {
    const fetchCalendars = async () => {
      try {
        const memberships = await getMembershipsByUser(USER_ID)
        const calendarDocs = await Promise.all(
          memberships.map(m => getCalendar(m.cal_id))
        )
        const calendarList = calendarDocs
          .filter(doc => doc.exists())
          .map(doc => ({ id: doc.id, ...doc.data() }))
        setCalendars(calendarList)
        if (calendarList.length > 0) {
          setActiveCalendarId(calendarList[0].id) // default to first
        }
      } catch (error) {
        console.error("Error fetching calendars:", error)
      }
    }
    fetchCalendars()
  }, [])

  //Fetch events for the active calendar
  useEffect(() => {
    if (!activeCalendarId) return
    const fetchEvents = async () => {
      try {
        console.log("Fetching events for calendar:", activeCalendarId)
        const data = await getEventsByCalendar(activeCalendarId)
        console.log("Events returned:", data)
        data.sort((a, b) => a.start_time.toDate() - b.start_time.toDate())
        setEvents(data)
      } catch (error) {
        console.error("Error fetching events:", error)
      }
    }
    fetchEvents()
  }, [activeCalendarId])

  const goToPrevMonth = () => {
    setCurrentMonth((prevMonth) => (prevMonth === 0 ? 11 : prevMonth - 1))
    setCurrentYear((prevYear) => (currentMonth === 0 ? prevYear - 1 : prevYear))
  }

  const goToNextMonth = () => {
    setCurrentMonth((nextMonth) => (nextMonth === 11 ? 0 : nextMonth + 1))
    setCurrentYear((nextYear) => (currentMonth === 11 ? nextYear + 1 : nextYear))
  }

  const handleDayClick = (day, month, year) => {
    const today = new Date()
    const clickedDate = new Date(year, month, day)
    if (clickedDate >= today || (clickedDate.getDate() === today.getDate() && clickedDate.getMonth() === today.getMonth() && clickedDate.getFullYear() === today.getFullYear())) {
      setShowEventPopup(true)
      setEventTitle('')
      setStartHours(0)
      setStartMinutes(0)
      setEndHours(23)
      setEndMinutes(59)
      setEventColor("#00a3ff")
      setEditingEvent(null)
    }
    else {
      setShowEventPopup(false)
      setEditingEvent(null)
    }
    setSelectedDay(clickedDate)
  }

  // ── NEW: Add event handler ────────────────────────────────
  const handleAddEvent = async () => {
    if (!eventTitle.trim()) return
    if (!activeCalendarId) return

    const start = new Date(selectedDay)
    start.setHours(startHours, startMinutes)

    const end = new Date(selectedDay)
    end.setHours(endHours, endMinutes)

    const newEvent = {
      cal_id: activeCalendarId,
      created_by: USER_ID,
      title: eventTitle,
      description: "",
      start_time: Timestamp.fromDate(start),
      end_time: Timestamp.fromDate(end),
      all_day: false,
      location: "",
      rsvp_deadline: "",
      color: eventColor || "#00a3ff",
    }

    try {
      if (editingEvent) {
            await updateEvent(editingEvent, newEvent)
       } else {
            await createEvent(newEvent)   
      }
      const updated = await getEventsByCalendar(activeCalendarId)
      updated.sort((a, b) => a.start_time.toDate() - b.start_time.toDate())
      setEvents(updated)
      // Reset popup state
      setEventTitle("")
      setStartHours(0)
      setStartMinutes(0)
      setEndHours(23)
      setEndMinutes(59)
      setShowEventPopup(false)
      setEventColor("#00a3ff")
      setEditingEvent(null)
    } catch (error) {
      console.error("Error saving event:", error)
    }
  }

  const handleEditEvent = (event) => {
    setEventTitle(event.title)
    setEventColor(event.color)
    setStartHours(event.start_time.toDate().getHours())
    setStartMinutes(event.start_time.toDate().getMinutes())
    setEndHours(event.end_time.toDate().getHours())
    setEndMinutes(event.end_time.toDate().getMinutes())
    setSelectedDay(event.start_time.toDate())
    setEditingEvent(event.id)
    setShowEventPopup(true)
    
  }


  // ── NEW: Delete event handler ─────────────────────────────
  const handleDeleteEvent = async (id) => {
    try {
      await deleteEvent(id)
      const updated = await getEventsByCalendar(activeCalendarId)
      updated.sort((a, b) => a.start_time.toDate() - b.start_time.toDate())
      setEvents(updated)
    } catch (error) {
      console.error("Error deleting event:", error)
    }
  }

  return (
    <div className="calendar-app">
        <div className="sidebar">
          {calendars.map(cal => (
            <div
              key={cal.id}
              className={`calendar-item ${cal.id === activeCalendarId ? "active" : ""}`}
              onClick={() => setActiveCalendarId(cal.id)}
            >
              <span
                className="calendar-color"
                style={{ backgroundColor: cal.color }}
              ></span>
              <span className="calendar-name">{cal.name}</span>
            </div>
          ))}
        </div>
        <div className="calendar">
            <h1 className="heading">Test Calendar</h1>
            <div className="navigate-date">
                <h2 className="month">{monthsOfYear[currentMonth]},</h2>
                <h2 className="year">{currentYear}</h2>
                <div className="buttons">
                    <i className="bx bx-chevron-left" onClick={goToPrevMonth}></i>
                    <i className="bx bx-chevron-right" onClick={goToNextMonth}></i>
                </div>
            </div>
            <div className="weekdays">
                {/* this will dynamically render each element of the days of the week array.*/}
                {daysOfWeek.map((day) => <span key={day}>{day}</span>)}
            </div>
            <div className="days">
                {[...Array(firstDayOfMonth).keys()].map((dummy, index) => <span className="predays" key={`pastday-${index}`}
                    onClick={() => {
                        const day = daysInPriorMonth - firstDayOfMonth + index + 1;
                        const newMonth = currentMonth === 0 ? 11 : currentMonth - 1;
                        const newYear = currentMonth === 0 ? currentYear - 1 : currentYear;

                        goToPrevMonth(); 
                        handleDayClick(day, newMonth, newYear); }}>
                        {daysInPriorMonth - firstDayOfMonth + index + 1}</span>)}

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
                max={23}
                className="hours"
                value={startHours}
                onChange={(e) => { if(Number(e.target.value) >= 0 && Number(e.target.value) <= 23 &&
                (Number(e.target.value) < endHours || (Number(e.target.value) === endHours && startMinutes < endMinutes)))  
                { setStartHours(Number(e.target.value)) } }}
              />
              <input
                type="number"
                name="minutes"
                min={0}
                max={59}
                className="minutes"
                value={startMinutes}
                onChange={(e) => { if(Number(e.target.value) >= 0 && Number(e.target.value) <= 59 &&
                (startHours < endHours || (startHours === endHours && Number(e.target.value) < endMinutes)))  
                { setStartMinutes(Number(e.target.value)) } }}
              />
            </div>
            <div className="time-input-end">
              <div className="event-popup-time">End Time</div>
              <input
                type="number"
                name="hours"
                min={0}
                max={23}
                className="hours"
                value={endHours}
                onChange={(e) => { if(Number(e.target.value) >= 0 && Number(e.target.value) <= 23 &&
                (Number(e.target.value) > startHours || (Number(e.target.value) === startHours && endMinutes > startMinutes)))  
                { setEndHours(Number(e.target.value)) } }}
              />
              <input
                type="number"
                name="minutes"
                min={0}
                max={59}
                className="minutes"
                value={endMinutes}
                onChange={(e) => { if(Number(e.target.value) >= 0 && Number(e.target.value) <= 59 &&
                (endHours > startHours || (endHours === startHours && Number(e.target.value) > startMinutes)))  
                { setEndMinutes(Number(e.target.value)) } }}
              />
            </div>
            {/* ── NEW: Controlled textarea ── */}
            <textarea
              placeholder="Enter Event Text (Maximum 60 Characters)"
              maxLength={60}
              value={eventTitle}
              onChange={(e) => setEventTitle(e.target.value)}
            ></textarea>
            <div className="color-picker">
                    <div className="color-title">Event Color:</div>
                    <input type="color" value={eventColor} onChange={(e) => setEventColor(e.target.value)} />
                </div>
            {/* ── NEW: onClick wired to handleAddEvent ── */}
            <button className="event-pop-btn" onClick={handleAddEvent}>
              {editingEvent ? "Save Changes" : "Add Event"}
            </button>
            <button
              className="close-event-popup"
              onClick={() => {
                setShowEventPopup(false)
                setEditingEvent(null)
                setEventColor("#00a3ff")
              }}
            >
              <i className="bx bx-x"></i>
            </button>
          </div>
        )}
      </div>

      {/* ── NEW: Dynamic event list from Firestore ── */}
      <div className="events">
        {events.map((event) => (
          <div className="event" key={event.id} style={{backgroundColor: event.color}}>
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
              <i className="bx bxs-edit-alt" onClick={() => handleEditEvent(event)}></i>
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