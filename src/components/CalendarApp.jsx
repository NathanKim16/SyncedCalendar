import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import { getMembershipsByUser, getCalendar, getEventsByCalendar, createEvent, deleteEvent, updateEvent, getMembershipsByCalendar, getUser, createRSVP, deleteRSVPByEventAndUser, getIsRSVPByEventAndUser, getRSVPsByUser, updateRSVP, deleteMembership, updateMembership, deleteRSVPsByUserAndCalendar, deleteEventsByUserAndCalendar, deleteRSVPsByEventID, incrementRSVPCount} from "../services/firestoreService"
import { Timestamp, doc, onSnapshot, collection, query, where } from "firebase/firestore"
import { useAuth } from "./context/auth/index"
import MembersIcon from "../assets/Members.png"
import { db } from "../firebase.ts";

const CalendarApp = () => {
  //Major variables
  const { currentUser, userLoggedIn, loading } = useAuth()
  const userId = currentUser?.uid
  const { calendarId } = useParams()
  const [userRole, setUserRole] = useState(null)
  const [memberMenuOpenId, setMemberMenuOpenId] = useState(null)

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
  const [hasSelectedDay, setHasSelectedDay] = useState(false)
  const [showEventPopup, setShowEventPopup] = useState(false)
  const [showRsvpPopup, setShowRsvpPopup] = useState(false)
  const [popupPosition, setPopupPosition] = useState({ top: 0, left: 0 })
  const [popupPlacement, setPopupPlacement] = useState('top') // 'top' or 'bottom'

  // Event state
  const [events, setEvents] = useState([])
  const [eventTitle, setEventTitle] = useState("")
  const [startHours, setStartHours] = useState(0)
  const [startMinutes, setStartMinutes] = useState(0)
  const [endHours, setEndHours] = useState(0)
  const [endMinutes, setEndMinutes] = useState(0)
  const [eventColor, setEventColor] = useState("#00a3ff")
  const [editingEvent, setEditingEvent] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [members, setMembers] = useState([])
  const [showMembersSidebar, setShowMembersSidebar] = useState(false)
  const [activeEventId, setActiveEventId] = useState(null)

  const activeCalendar = calendars.find(cal => cal.id === activeCalendarId)


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
    if (!userId) return
    const fetchCalendars = async () => {
      try {
        const memberships = await getMembershipsByUser(userId)

        const calendarDocs = await Promise.all(
          memberships.map(m => getCalendar(m.cal_id))
        )
        const calendarList = calendarDocs
          .filter(doc => doc.exists())
          .map(doc => ({ id: doc.id, ...doc.data() }))
        setCalendars(calendarList)
        
        // Set active calendar from URL param or default to first
        if (calendarId && calendarList.some(cal => cal.id === calendarId)) {
          setActiveCalendarId(calendarId)
        } else if (calendarList.length > 0) {
          setActiveCalendarId(calendarList[0].id)
        }
      } catch (error) {
        console.error("Error fetching calendars:", error)
      }
    }
    fetchCalendars()
  }, [userId, calendarId])

  //Fetch events for the active calendar
  useEffect(() => {
    if (!activeCalendarId) return
    
    console.log("Fetching events for calendar:", activeCalendarId)
    const eventsCollection = query(collection(db, "events"), where("cal_id", "==", activeCalendarId));
    const unsubscribe = onSnapshot(eventsCollection, (snapshot) => {const updatedEvents = snapshot.docs.map(doc => ({id: doc.id, ...doc.data()})); 
    setEvents(updatedEvents)
    })
    
    
    return () => unsubscribe();
  }, [activeCalendarId])

  useEffect(() => {
    if (!activeCalendarId || !userId) return
    const fetchMembers = async () => {
      try {
        const memberships = await getMembershipsByCalendar(activeCalendarId)
        const currentUserMembership = memberships.find(m => m.user_id === userId)
        console.log("All memberships for calendar:", memberships)
        console.log("Current user's membership:", currentUserMembership)
        const role = currentUserMembership?.role || null
        setUserRole(role)
        const users = await Promise.all(memberships.map(async (membership) => {
          if (membership.user_id === userId || membership.user_id === "QuaFv3JlIgSZvNhiX1BDeYUHL1e2" || membership.user_id === "usr_00001") {
            return null
          }
          const userDoc = await getUser(membership.user_id)
          const userData = userDoc.exists() ? userDoc.data() : null
          const email = userData?.email || membership.user_id || ""
          return {
            id: membership.id,
            userId: membership.user_id,
            displayName: userData?.username || "",
            email,
            role: membership.role || "user",
          }
        }))

        const seen = new Set()
        const uniqueMembers = users.filter(Boolean).reduce((acc, member) => {
          const key = member.userId || member.email
          if (!key || seen.has(key)) return acc
          seen.add(key)
          acc.push(member)
          return acc
        }, [])

        setMembers(uniqueMembers)
      } catch (error) {
        console.error("Error fetching members:", error)
      }
    }
    fetchMembers()
  }, [activeCalendarId, currentUser?.email, userId])
const [userRsvps, setUserRsvps] = useState([]);

useEffect(() => {
  const fetchRSVPs = async () => {
    const data = await getRSVPsByUser(userId);
    setUserRsvps(data);
  };
  if (userId) {
    fetchRSVPs();
  }
}, [userId]);

  const goToPrevMonth = () => {
    setCurrentMonth((prevMonth) => (prevMonth === 0 ? 11 : prevMonth - 1))
    setCurrentYear((prevYear) => (currentMonth === 0 ? prevYear - 1 : prevYear))
  }

  const goToNextMonth = () => {
    setCurrentMonth((nextMonth) => (nextMonth === 11 ? 0 : nextMonth + 1))
    setCurrentYear((nextYear) => (currentMonth === 11 ? nextYear + 1 : nextYear))
  }

  const handleDayClick = (day, month, year) => {
    const clickedDate = new Date(year, month, day)
    
    // Toggle selection if clicking the same day
    if (hasSelectedDay && selectedDay.getDate() === clickedDate.getDate() &&
        selectedDay.getMonth() === clickedDate.getMonth() &&
        selectedDay.getFullYear() === clickedDate.getFullYear()) {
      setHasSelectedDay(false)
      setSelectedDay(new Date())
    } else {
      setSelectedDay(clickedDate)
      setHasSelectedDay(true)
    }
  }

  const handleDayRightClick = (e, day, month, year) => {
    e.preventDefault()
    const today = new Date()
    const clickedDate = new Date(year, month, day)
    
    // Only allow event creation for today or future dates
    if (clickedDate >= today || (clickedDate.getDate() === today.getDate() && 
        clickedDate.getMonth() === today.getMonth() && 
        clickedDate.getFullYear() === today.getFullYear())) {
      
      setSelectedDay(clickedDate)
      setShowEventPopup(true)
      setEventTitle('')
      setStartHours(0)
      setStartMinutes(0)
      setEndHours(23)
      setEndMinutes(59)
      setEventColor("#00a3ff")
      setEditingEvent(null)
      
      // Estimate popup height (adjust this value based on your actual popup size)
      const estimatedPopupHeight = 400
      const topPosition = e.clientY - 10
      
      // Check if popup would overflow at the top
      // If top position minus popup height is less than 0, position below instead
      const wouldOverflowTop = (topPosition - estimatedPopupHeight) < 0
      
      if (wouldOverflowTop) {
        // Position popup at bottom-right of click
        setPopupPosition({
          top: e.clientY + 10,
          left: e.clientX
        })
        setPopupPlacement('bottom')
      } else {
        // Position popup at top-right of click (original behavior)
        setPopupPosition({
          top: topPosition,
          left: e.clientX
        })
        setPopupPlacement('top')
      }
    }
  }

  // Add event handler
  const handleAddEvent = async () => {
    if (!eventTitle.trim()) return
    if (!activeCalendarId) return
    if (isSubmitting) return

    setIsSubmitting(true) // Prevent multiple submissions

    const start = new Date(selectedDay)
    start.setHours(startHours, startMinutes)

    const end = new Date(selectedDay)
    end.setHours(endHours, endMinutes)

    const newEvent = {
      cal_id: activeCalendarId,
      created_by: userId,
      title: eventTitle,
      description: "",
      start_time: Timestamp.fromDate(start),
      end_time: Timestamp.fromDate(end),
      all_day: false,
      location: "",
      rsvp_deadline: "",
      color: eventColor || "#00a3ff",
      numberOfRSVPs: 0,
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
    } finally{
      setIsSubmitting(false)
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


  // Delete event handler
  const handleDeleteEvent = async (id) => {
    try {
      await deleteEvent(id)
      const updated = await getEventsByCalendar(activeCalendarId)
      updated.sort((a, b) => a.start_time.toDate() - b.start_time.toDate())
      setEvents(updated)
      if (hasUserRsvp(id)) {
        await deleteRSVPsByEventID(id)
        setUserRsvps(prev => prev.filter(rsvp => rsvp.event_id !== id))
      }
    } catch (error) {
      console.error("Error deleting event:", error)
    }
  }

  //Loading Guards
  if (loading) {
    return <div>Loading...</div>
  }
  if (!userLoggedIn) {
    return <div>Please log in to view your calendar.</div>
  }

  const hasUserRsvp = (eventId) => {
    return userRsvps.some(rsvp => rsvp.event_id === eventId);
  };

  // Filter events based on selected day
  const filteredEvents = hasSelectedDay
    ? events.filter(event => {
        const eventDate = event.start_time.toDate()
        return eventDate.getDate() === selectedDay.getDate() &&
               eventDate.getMonth() === selectedDay.getMonth() &&
               eventDate.getFullYear() === selectedDay.getFullYear()
      })
    : events;

  const handleRsvpClick = async (event, userId) => {
    const isRsvp = hasUserRsvp(event.id);

    if (isRsvp) {
      await deleteRSVPByEventAndUser(event.id, userId)
      setUserRsvps(prev => prev.filter(rsvp => rsvp.event_id !== event.id))
      incrementRSVPCount(event.id, -1)
    }
    else {
      const newRsvp = {
        event_id: event.id,
        user_id: userId,
        timestamp: Timestamp.now(),
      }

      const docRef = await createRSVP(newRsvp)
      setUserRsvps(prev => [...prev, { ...newRsvp, id: docRef.id }])
      incrementRSVPCount(event.id, 1)
    }

    setActiveEventId(null)
    setShowRsvpPopup(false)
  }


  // Handle Member Kick
  const handleKickMember = async (membershipId) => {
    try {
      const member = members.find(m => m.id === membershipId)
      await deleteEventsByUserAndCalendar(member.userId, activeCalendarId)
      await deleteRSVPsByUserAndCalendar(member.userId, activeCalendarId)
      await deleteMembership(membershipId)
      setMembers(prev => prev.filter(m => m.id !== membershipId))
      setMemberMenuOpenId(null)
    } catch (error) {
      console.error("Error kicking member:", error)
    }
  }

  // Handle setting roles
  const handleSetRole = async (membershipId, newRole) => {
    try {
      await updateMembership(membershipId, { role: newRole })
      setMembers(prev => prev.map(m => 
        m.id === membershipId ? { ...m, role: newRole } : m
      ))
      setMemberMenuOpenId(null)
    } catch (error) {
      console.error("Error updating role:", error)
    }
  }

  return (
    <div className="calendar-app">
        <button
          onClick={() => setShowMembersSidebar(!showMembersSidebar)}
          style={{
            position: "fixed",
            top: "1rem",
            right: "1rem",
            width: "3.6rem",
            height: "3.6rem",
            borderRadius: "50%",
            border: "1px solid #2a2f3b",
            backgroundColor: "#2a2f3b",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 0.5rem 1rem rgba(0,0,0,0.25)",
            zIndex: 999,
          }}
          title={showMembersSidebar ? "Hide members" : "Show members"}
        >
          <img src={MembersIcon} alt="Members" style={{ width: "1.8rem", height: "1.8rem" }} />
        </button>
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
        <div className="calendar" style={{ position: "relative" }}>
            <h1 className="heading">{activeCalendar?.name || "Calendar"}</h1>
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
              onContextMenu={(e) => handleDayRightClick(e, index + 1, currentMonth, currentYear)}
              className={
                hasSelectedDay &&
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
          <div className="event-popup" style={{
            position: 'fixed',
            top: `${popupPosition.top}px`,
            left: `${popupPosition.left}px`,
            transform: popupPlacement === 'top' ? 'translate(-25%, -105%)' : 'translate(-25%, -5%)',
          }}>
            <div className="event-popup-header">
              <h2 className="event-popup-title">{editingEvent ? "Edit Event" : "Create Event"}</h2>
            </div>

            <div className="time-input-start">
              <div className="time-section-label">Start Time</div>
              <div className="time-inputs-wrapper">
                <input
                  type="number"
                  name="hours"
                  min={0}
                  max={23}
                  placeholder="HH"
                  value={String(startHours).padStart(2, '0')}
                  onChange={(e) => { if(Number(e.target.value) >= 0 && Number(e.target.value) <= 23 &&
                  (Number(e.target.value) < endHours || (Number(e.target.value) === endHours && startMinutes < endMinutes)))  
                  { setStartHours(Number(e.target.value)) } }}
                />
                <span style={{ color: '#78879e', fontSize: '1.5rem', fontWeight: 'bold' }}>:</span>
                <input
                  type="number"
                  name="minutes"
                  min={0}
                  max={59}
                  placeholder="MM"
                  value={String(startMinutes).padStart(2, '0')}
                  onChange={(e) => { if(Number(e.target.value) >= 0 && Number(e.target.value) <= 59 &&
                  (startHours < endHours || (startHours === endHours && Number(e.target.value) < endMinutes)))  
                  { setStartMinutes(Number(e.target.value)) } }}
                />
              </div>
            </div>

            <div className="time-input-end">
              <div className="time-section-label">End Time</div>
              <div className="time-inputs-wrapper">
                <input
                  type="number"
                  name="hours"
                  min={0}
                  max={23}
                  placeholder="HH"
                  value={String(endHours).padStart(2, '0')}
                  onChange={(e) => { if(Number(e.target.value) >= 0 && Number(e.target.value) <= 23 &&
                  (Number(e.target.value) > startHours || (Number(e.target.value) === startHours && endMinutes > startMinutes)))  
                  { setEndHours(Number(e.target.value)) } }}
                />
                <span style={{ color: '#78879e', fontSize: '1.5rem', fontWeight: 'bold' }}>:</span>
                <input
                  type="number"
                  name="minutes"
                  min={0}
                  max={59}
                  placeholder="MM"
                  value={String(endMinutes).padStart(2, '0')}
                  onChange={(e) => { if(Number(e.target.value) >= 0 && Number(e.target.value) <= 59 &&
                  (endHours > startHours || (endHours === startHours && Number(e.target.value) > startMinutes)))  
                  { setEndMinutes(Number(e.target.value)) } }}
                />
              </div>
            </div>

            <div className="event-title-section">
              <div className="event-title-label">Event Name</div>
              <textarea
                placeholder="Enter event name (max 40 characters)"
                maxLength={40}
                value={eventTitle}
                onChange={(e) => setEventTitle(e.target.value)}
              ></textarea>
            </div>

            <div className="color-picker">
              <div className="color-title">Event Color</div>
              <input type="color" value={eventColor} onChange={(e) => setEventColor(e.target.value)} />
            </div>

            <div className="event-popup-buttons">
              <button className="event-pop-btn" onClick={handleAddEvent} disabled={isSubmitting}>
                {editingEvent ? "Save Changes" : "Create Event"}
              </button>
            </div>

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

      {showMembersSidebar && (
        <div style={{
          position: "fixed",
          top: 0,
          right: 0,
          width: "24rem",
          maxWidth: "90vw",
          height: "100vh",
          backgroundColor: "#161b22",
          borderLeft: "1px solid #2a2f3b",
          padding: "1.5rem",
          boxShadow: "-0.5rem 0 2rem rgba(0,0,0,0.4)",
          zIndex: 500,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <div>
              <div style={{ color: "#ffffff", fontSize: "1.25rem", fontWeight: 700 }}>Calendar Members</div>
              <div style={{ color: "#78879e", fontSize: "0.95rem" }}>{members.length + 1} member{members.length + 1 === 1 ? "" : "s"}</div>
            </div>
            <button
              onClick={() => setShowMembersSidebar(false)}
              style={{
                width: "2.8rem",
                height: "2.8rem",
                borderRadius: "50%",
                border: "none",
                backgroundColor: "#2a2f3b",
                color: "white",
                cursor: "pointer",
                fontSize: "1.2rem",
              }}
              title="Close members"
            >
              ×
            </button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <div style={{ padding: "1rem", backgroundColor: "#0f1319", borderRadius: "1rem", border: "1px solid #2a2f3b" }}>
              <div style={{ color: "#ffffff", fontWeight: 700 }}>{currentUser?.displayName || currentUser?.email || "You"}</div>
              <div style={{ color: "#78879e", fontSize: "0.9rem", marginTop: "0.35rem" }}>You</div>
            </div>
            {members.length === 0 ? (
              <div style={{ color: "#78879e", padding: "1rem", backgroundColor: "#0f1319", borderRadius: "0.9rem" }}>
                No other members found for this calendar.
              </div>
            ) : members.map((member) => (
              <div key={member.id} style={{ padding: "1rem", backgroundColor: "#0f1319", borderRadius: "1rem", border: "1px solid #2a2f3b", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ color: "#ffffff", fontWeight: 700 }}>{member.displayName || member.email || "Unknown"}</div>
                  <div style={{ color: "#78879e", fontSize: "0.9rem", marginTop: "0.35rem" }}>{member.email}</div>
                  {/* ← Add role badge */}
                  <div style={{
                    display: "inline-block",
                    marginTop: "0.4rem",
                    padding: "0.15rem 0.6rem",
                    borderRadius: "999px",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    fontFamily: "Inter, sans-serif",
                    backgroundColor:
                      member.role === "owner" ? "rgba(255, 200, 0, 0.15)" :
                      member.role === "admin" ? "rgba(0, 163, 255, 0.15)" :
                      "rgba(120, 135, 158, 0.15)",
                    color:
                      member.role === "owner" ? "#ffc800" :
                      member.role === "admin" ? "#00a3ff" :
                      "#78879e",
                    border: `1px solid ${
                      member.role === "owner" ? "#ffc800" :
                      member.role === "admin" ? "#00a3ff" :
                      "#78879e"
                    }`,
                  }}>
                    {member.role === "owner" ? "Owner" :
                    member.role === "admin" ? "Admin" :
                    "Member"}
                  </div>
                </div>
              {(userRole === "owner" || (userRole === "admin" && member.role !== "owner")) && (
                <div style={{ position: "relative" }}>
                  <button
                      onClick={() => setMemberMenuOpenId(
                      memberMenuOpenId === member.id ? null : member.id
                      )}
                      style={{
                      background: "none",
                      border: "none",
                      color: "#ffffff",
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
                      {/*Set member to Admin*/}
                      {userRole === "owner" && member.role !== "admin" && (
                        <div
                          onClick={() => handleSetRole(member.id, "admin")}
                          style={{
                            padding: "0.7rem 1rem",
                            color: "#ffffff",
                            fontSize: "1rem",
                            cursor: "pointer",
                            borderRadius: "0.5rem",
                            fontFamily: "Inter, sans-serif",
                          }}
                          onMouseEnter={e => e.currentTarget.style.backgroundColor = "#2a2f3b"}
                          onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}
                        >
                          Set as Admin
                        </div>
                      )}
                      {/*Set member to User*/}
                      {userRole === "owner" && member.role !== "user" && (
                        <div
                          onClick={() => handleSetRole(member.id, "user")}
                          style={{
                            padding: "0.7rem 1rem",
                            color: "#ffffff",
                            fontSize: "1rem",
                            cursor: "pointer",
                            borderRadius: "0.5rem",
                            fontFamily: "Inter, sans-serif",
                          }}
                          onMouseEnter={e => e.currentTarget.style.backgroundColor = "#2a2f3b"}
                          onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}
                        >
                          Set as User
                        </div>
                      )}
                      {/* Divider between role options and kick — only show if owner */}
                      {userRole === "owner" && (
                        <div style={{ borderTop: "1px solid #2a2f3b", margin: "0.3rem 0" }} />
                      )}

                      {/* Kick Member */}
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
                          Kick
                      </div>
                      </div>
                  )}
                </div>
              )}
              </div>
            ))}
          </div>
          {/* Invite Code */}
          <div style={{
            marginTop: "auto",
            paddingTop: "1.5rem",
            padding: "1rem",
            borderRadius: "1rem",
            border: "1px solid #2a2f3b",
            textAlign: "center",
          }}>
            <div style={{ color: "#78879e", fontSize: "0.85rem", fontFamily: "Inter, sans-serif", marginBottom: "0.4rem" }}>
              Invite Code
            </div>
            <div style={{ color: "#ffffff", fontSize: "1.4rem", fontWeight: 700, letterSpacing: "0.2rem", fontFamily: "monospace" }}>
              {activeCalendarId ? activeCalendarId.slice(-5).toUpperCase() : "—"}
            </div>
          </div>
        </div>
      )}

      {/* ── NEW: Dynamic event list from Firestore ── */}
      <div className="events">
        {filteredEvents.map((event) => (
          <div className={`event ${activeEventId === event.id ? 'is-active' : ''}`} key={event.id} style={{backgroundColor: event.color}}>
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
            <div className="event-rsvp-count">{`${event.numberOfRSVPs}`}</div>
            <div className="users-rsvp">
              <i className="bx bxs-user"></i>
            </div>

            <div className="rsvp-button">
              <i className={`bx ${hasUserRsvp(event.id) ? 'bxs-calendar-check' : 'bx-calendar-check'}`} onClick={() => { setActiveEventId(event.id); handleRsvpClick(event, userId)}}></i>
            </div>
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
