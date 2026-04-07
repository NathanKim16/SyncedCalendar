import { useState } from "react"
import NavBar from "./navbar"

const CalendarApp = () => {
  //Lists of days and months
  const daysOfWeek =  ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
  const monthsOfYear = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
  
  //get current date, month, year, and declare setter functions for traversal
  const currentDate = new Date()
  const [currentMonth, setCurrentMonth] = useState(currentDate.getMonth())
  const [currentYear, setCurrentYear] = useState(currentDate.getFullYear())

  const [selectedDay, setSelectedDay] = useState(currentDate)
  const [showEventPopup, setShowEventPopup] = useState(false)

  const [events, setEvents] = useState([])
  const [eventTime, setEventTime] = useState({startHour: '00', startMinute: '00', endHour: '23', endMinute: '59'})
  const [eventText, setEventText] = useState('')
  const [editingEvent, setEditingEvent] = useState(null)
  const [eventColor, setEventColor] = useState("#00a3ff")
  
  // daysInMonth takes in current year, the future month, and the day just before(the last day of the current month) to get the current months number of days
  const daysInMonth = new Date(currentYear, currentMonth+1, 0).getDate()
  const daysInPriorMonth = new Date(currentYear, currentMonth, 0).getDate()
  // firstDayOfMonth gets the day of the 1rst of the current day and month with 0 being sunday and sat being 6
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

  const goToPrevMonth = () => {
    //sets current month to be previous month where 0(Jan) is sent back to december
    //should be called when clicking back arrow
    setCurrentMonth((prevMonth) => (prevMonth === 0  ? 11 : prevMonth-1)) 
    setCurrentYear((prevYear) => (currentMonth === 0  ? prevYear-1 : prevYear))
  }

  const goToNextMonth = () => {
    //sets current month to be next month where 11(Dec) is sent back to jan
    //should be called when clicking forward arrow
    setCurrentMonth((nextMonth) => (nextMonth === 11  ? 0 : nextMonth+1)) 
    setCurrentYear((nextYear) => (currentMonth === 11  ? nextYear+1 : nextYear))
  }

   const handleDayClick = (day, month, year) => {
    const today = new Date()
    const clickedDate = new Date(year, month, day)
    if (clickedDate >= today || (clickedDate.getDate() === today.getDate() && clickedDate.getMonth() === today.getMonth() && clickedDate.getFullYear() === today.getFullYear())) {
      setShowEventPopup(true)
      setEventText('')
      setEventTime({startHour: '00', startMinute: '00', endHour: '23', endMinute: '59'})
      setEditingEvent(null)
    }
    else {
      setShowEventPopup(false)
    }
    setSelectedDay(clickedDate)
  }

  const createEvent = () => {
    const newEvent = {
      id: editingEvent ? editingEvent.id : Date.now(),
      date: selectedDay,
      startTime: `${eventTime.startHour.padStart(2, '0')}:${eventTime.startMinute.padStart(2, '0')}`,
      endTime: `${eventTime.endHour.padStart(2, '0')}:${eventTime.endMinute.padStart(2, '0')}`,
      text: eventText,
      color: eventColor,
    }

    let updatedEvents = [...events]
    if (editingEvent) {
        updatedEvents = updatedEvents.map((event) => event.id === editingEvent.id ? newEvent : event)
    } else {
        updatedEvents.push(newEvent)
    }

    updatedEvents.sort((a, b) => new Date(a.date) - new Date(b.date))

    setEvents(updatedEvents)
    setEventTime({startHour: '00', startMinute: '00', endHour: '23', endMinute: '59'})
    setEventText('')
    setShowEventPopup(false)
    setEditingEvent(null)
  }

  const editEvent = (event) => {
    setSelectedDay(new Date(event.date))
    setEventTime({
      startHour: event.startTime.split(':')[0],
      startMinute: event.startTime.split(':')[1],
      endHour: event.endTime.split(':')[0],
      endMinute: event.endTime.split(':')[1]
    })
    setEventText(event.text)
    setEditingEvent(event)
    setShowEventPopup(true)
  }

  const deleteEvent = (eventId) => {
    const updatedEvents = events.filter((event) => event.id !== eventId)
    setEvents(updatedEvents)
    }

  return (
    <div className="calendar-app">
        <div className="sidebar">

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

                {[...Array(daysInMonth).keys()].map((dummy,index) => <span onClick={() => handleDayClick(index + 1, currentMonth, currentYear)} className={
                    ((index + 1) === selectedDay.getDate()  &&
                    selectedDay.getMonth() === currentMonth &&
                    selectedDay.getFullYear() === currentYear ? "selected" :
                    index+1 === currentDate.getDate() &&
                    currentMonth === currentDate.getMonth() &&
                    currentYear === currentDate.getFullYear() ? "today" : "neither")}
                    key={index+1}>
                    {index+1}</span>)
                    
                }
                
                {[...Array(Math.max(0, 42 - firstDayOfMonth - daysInMonth)).keys()].map((dummy, index) => <span className="postdays" key={`futureday-${index}`}
                    onClick={() => {
                        const day = index + 1;
                        const newMonth = currentMonth === 11 ? 0 : currentMonth + 1;
                        const newYear = currentMonth === 11 ? currentYear + 1 : currentYear;
                        goToNextMonth();
                        handleDayClick(index + 1, newMonth, newYear); }}>
                        {index + 1}</span>)}
                
            </div>

            {showEventPopup && (
             <div className="event-popup">
                <div className="time-input-start">
                    <div className="event-popup-time">Start Time</div>
                    <input type="number" name="hours" min={0} max={23} className="hours" value={eventTime.startHour} onChange={(e) => { if (Number(e.target.value) < Number(eventTime.endHour) || (Number(e.target.value) === Number(eventTime.endHour) && Number(eventTime.endMinute) > Number(eventTime.startMinute))) {if (Number(e.target.value) >= 0 && Number(e.target.value) <= 23) {setEventTime({...eventTime, startHour : String(e.target.value).padStart(2, '0')})}}}}/>
                    <input type="number" name="minutes" min={0} max={59} className="minutes" value={eventTime.startMinute} onChange={(e) => { if (Number(eventTime.startHour) < Number(eventTime.endHour) || (Number(eventTime.startHour) === Number(eventTime.endHour) && Number(e.target.value) < Number(eventTime.endMinute))) {if (Number(e.target.value) >= 0 && Number(e.target.value) <= 59) {setEventTime({...eventTime, startMinute : String(e.target.value).padStart(2, '0')})}}}}/>
                </div>
                <div className="time-input-end">
                    <div className="event-popup-time">End Time</div>
                    <input type="number" name="hours" min={0} max={23} className="hours" value={eventTime.endHour} onChange={(e) => { if (Number(e.target.value) > Number(eventTime.startHour) || (Number(e.target.value) === Number(eventTime.startHour) && Number(eventTime.endMinute) > Number(eventTime.startMinute))) { if (Number(e.target.value) >= 0 && Number(e.target.value) <= 23) {setEventTime({...eventTime, endHour : String(e.target.value).padStart(2, '0')})}}}}/>
                    <input type="number" name="minutes" min={0} max={59} className="minutes" value={eventTime.endMinute} onChange={(e) =>  { if (Number(eventTime.endHour) > Number(eventTime.startHour) || (Number(eventTime.endHour) === Number(eventTime.startHour) && Number(e.target.value) > Number(eventTime.startMinute))) {if (Number(e.target.value) >= 0 && Number(e.target.value) <= 59) {setEventTime({...eventTime, endMinute : String(e.target.value).padStart(2, '0')})}}}}/>
                </div>
                <textarea placeholder="Enter Event Text (Maximum 60 Characters)" value={eventText} onChange={(e) => { if (e.target.value.length <= 60) {setEventText(e.target.value); }}}></textarea>
                <div className="color-picker">
                    <div className="color-title">Event Color:</div>
                    <input type="color" value={eventColor} onChange={(e) => setEventColor(e.target.value)} />
                </div>
                <button className="event-pop-btn" onClick={createEvent}>{editingEvent ? "Update Event" : "Add Event"}</button>
                <button className="close-event-popup" onClick={() => setShowEventPopup(false)}>
                    <i className="bx bx-x"></i>
                </button>
            </div>       
            )}
        </div>
        
        <div className="events">
            
            {events.map((event, index) => (
                <div className="event" key={index} style={{backgroundColor: event.color}}>
                    <div className="event-date-wrapper">
                        <div className="event-date">{`${monthsOfYear[event.date.getMonth()]} ${event.date.getDate()}, ${event.date.getFullYear()}`}</div>
                        <div className="event-times">
                            <div className="event-start-time">{event.startTime}</div>
                            <div>-</div>
                            <div className="event-end-time">{event.endTime}</div>
                        </div>
                    </div>
                    <div className="event-text">{event.text}</div>
                        <div className="event-button">
                        <i className="bx bxs-edit-alt" onClick={() => editEvent(event)}></i>
                        <i className="bx bxs-message-alt-x" onClick={() => deleteEvent(event.id)}></i>
                    </div>
                </div>
            ))}
        </div>
    </div>
  )
}

export default CalendarApp