import {db} from "../../firebase"; 
import {userId} from "../CalendarApp"
import {email} from "../Login"
import {collection, query, where, onSnapshot, doc} from "../../firebase/firestore";

//calendar collection
const collectionCalendar = collection(db, "calendars")


//find calendarid with the userid
const qCalendar = query(collectionCalendar, where("owner_id", "==", userId));

const calendarId = "";
onSnapshot(qCalendar, (snapshot) => {
    snapshot.docs.forEach((doc) => {
        calendarId = doc.id;
    })
})

//create invite code of last five digit/character in calendar id
const inviteCode = calendarId.substring(calendarId.length - 5);