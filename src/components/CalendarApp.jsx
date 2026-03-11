import { useState } from "react"

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
    setSelectedDay(new Date(year, month, day))
    setShowEventPopup(true)
  }


  return (
    <div className="calendar-app">
        <div className="sidebar">

        </div>
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
                
                {[...Array(42 - firstDayOfMonth - daysInMonth).keys()].map((dummy, index) => <span className="postdays" key={`futureday-${index}`}
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
                    <input type="number" name="hours" min={0} max={24} className="hours"/>
                    <input type="number" name="minutes" min={0} max={60} className="minutes"/>
                </div>
                <div className="time-input-end">
                    <div className="event-popup-time">End Time</div>
                    <input type="number" name="hours" min={0} max={24} className="hours"/>
                    <input type="number" name="minutes" min={0} max={60} className="minutes"/>
                </div>
                <textarea placeholder="Enter Event Text (Maximum 60 Characters)"></textarea>
                <button className="event-pop-btn">Add Event</button>
                <button className="close-event-popup" onClick={() => setShowEventPopup(false)}>
                    <i className="bx bx-x"></i>
                </button>
            </div>       
            )}
        </div>
        
        <div className="events">
            
            <div className="event">
                <div className="event-date-wrapper">
                    <div className="event-date">March 8, 2026</div>
                    <div className="event-times">
                        <div className="event-start-time">9:23</div>
                        <div>-</div>
                        <div className="event-end-time">10:23</div>
                    </div>
                </div>
                <div className="event-text"> Meeting with John</div>
                    <div className="event-button">
                    <i className="bx bxs-edit-alt"></i>
                    <i className="bx bxs-message-alt-x" ></i>
                </div>
            </div>
        </div>
    </div>
  )
}

export default CalendarApp