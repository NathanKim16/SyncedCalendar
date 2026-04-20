import {db} from "../../firebase"; 
import {userId} from "../CalendarApp"
import {email} from "../Login"
import {joinCode} from "../navbar"
import {collection, query, where, onSnapshot, doc, addDoc} from "../../firebase/firestore";

export function inviteCodeFunction(joinCode){
    //calendar collection
    const calendarCollection = collection(db, 'calendars')

    //real time calendar collection data
    let calendars = []
    onSnapshot(calendarCollection, (snapshot) => {
        snapshot.docs.forEach((doc) => {
            calendars.push(doc.id)
        })
    })

    //go through calendar to find the calendar that matches the invite code
    //if found, add new membership to the calendar
    const calendarId = ""
    calendars.forEach((cal) => {
        const lastFive = cal.substring(cal.length - 5)
        if(lastFive == joinCode){
            calendarId = cal
            addDoc(collection(db, "memberships"), {
                cal_id: calendarId,
                role: "member",
                user_id: userId
            })
            return true
        }
        else{
            return false
        }
    })
    return false
}



