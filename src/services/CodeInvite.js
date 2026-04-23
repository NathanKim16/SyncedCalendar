import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import { createMembership, getMembershipByUserAndCalendar } from "./firestoreService";

export async function inviteCodeFunction(joinCode, userId) {
  console.log("Join Code:", joinCode)

  if (!joinCode || !userId) {
    console.error("Missing joinCode or userId")
    return { success: false, message: "Missing join code or user ID." }
  }

  try {
    // Fetch all calendars
    const calendarCollection = collection(db, "calendars")
    const snapshot = await getDocs(calendarCollection)

    // Find the calendar whose ID ends with the join code
    let matchedCalendarId = null
    snapshot.docs.forEach((doc) => {
      const lastFive = doc.id.substring(doc.id.length - 5)
      if (lastFive === joinCode) {
        matchedCalendarId = doc.id
      }
    })

    if (!matchedCalendarId) {
      console.warn("No calendar found for join code:", joinCode)
      return { success: false, message: "Invalid invite code." }
    }

    // Check if user is already a member
    const existingMembership = await getMembershipByUserAndCalendar(userId, matchedCalendarId)
    if (existingMembership) {
      return { success: false, message: "You are already a member of this calendar." }
    }

    // Create the membership
    const newMember = {
      cal_id: matchedCalendarId,
      user_id: userId,
      role: "user",
      joined_at: new Date(),
    }

    await createMembership(newMember)
    console.log("Successfully joined calendar:", matchedCalendarId)
    return { success: true, message: "Successfully joined calendar!" }

  } catch (error) {
    console.error("Error joining calendar:", error)
    return { success: false, message: "An error occurred. Please try again." }
  }
}