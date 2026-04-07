// Code Snippet for fetching database data
// Step 1 — fetch calendar + members in parallel (you already have the calendar_id)
const [calendar, memberships] = await Promise.all([
  getCalendar(calendarId),
  getMemberships(calendarId)
])

// Step 2 — fetch events + member user details in parallel
const [events, members] = await Promise.all([
  getEvents(calendarId),               // WHERE calendar_id = X
  getUsers(memberships.map(m => m.user_id))
])

// Step 3 — fetch all RSVPs for those events in ONE query, not one per event
const rsvps = await getRsvps(events.map(e => e.id))
// WHERE event_id IN [id1, id2, id3, ...]


// FIREBASE Auth
// After Firebase Auth creates the user
const { uid } = await createUserWithEmailAndPassword(auth, email, password)

// Use that uid as the Firestore document ID
await setDoc(doc(db, "users", uid), {
  username: "janedoe",
  email: "jane@example.com",
  avatar_url: "",
  created_at: serverTimestamp()
})