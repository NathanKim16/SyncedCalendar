import {db} from "../firebase"; 
import {collection, query, where, onSnapshot, doc, addDoc} from "firebase/firestore";
import { createMembership } from "./firestoreService";
import { create } from "domain";

export function inviteCodeFunction(joinCode){
    console.log("Join Code: " + joinCode)
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
            const newMember = {
                cal_id: cal,
                user_id: userId,
                role: "user"
            }
            // calendarId = cal
            // addDoc(collection(db, "memberships"), {
            //     cal_id: calendarId,
            //     role: "user",
            //     user_id: userId
            // })
            try{
                createMembership(newMember)
            } catch (error){
                console.log("Error")
            }
            
            
        }
        else{
            return false
        }
    })
    return false
}



