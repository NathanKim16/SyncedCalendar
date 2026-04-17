import { db } from "../firebase";
import {
  collection, addDoc, getDocs, getDoc,
  setDoc, doc, updateDoc, deleteDoc, query, where,
  Timestamp
} from "firebase/firestore";

// ─── TYPES ───────────────────────────────────────────────

interface User {
  username: string;
  email: string;
  avatar_url: string;
  created_at: Timestamp;
}

interface Calendar {
  name: string;
  description: string;
  owner_id: string;
  icon: string;
  color: string;
  created_at: Timestamp;
}

interface Membership {
  user_id: string;
  cal_id: string;
  role: string;
  permissions: string[];
  joined_at: Timestamp;
}

interface Event {
  cal_id: string;
  created_by: string;
  title: string;
  description: string;
  start_time: Timestamp;
  end_time: Timestamp;
  all_day: boolean;
  location: string;
  rsvp_deadline: string;
  color: string;
}

interface RSVP {
  event_id: string;
  user_id: string;
  status: string;
  note: string;
  responded_at: Timestamp;
}

interface Availability {
  user_id: string;
  cal_id: string;
  day_of_week: string;
  start_time: string;
  end_time: string;
  type: string;
}

// ─── USERS ───────────────────────────────────────────────

export const createUser = async (data: User) =>
  await addDoc(collection(db, "users"), data);

export const getUser = async (id: string) =>
  await getDoc(doc(db, "users", id));

export const updateUser = async (id: string, data: Partial<User>) =>
  await updateDoc(doc(db, "users", id), data);

export const setUser = async (id: string, data: Partial<User>) =>
  await setDoc(doc(db, "users", id), data, { merge: true });

export const deleteUser = async (id: string) =>
  await deleteDoc(doc(db, "users", id));

// ─── CALENDARS ───────────────────────────────────────────

export const createCalendar = async (data: Calendar) =>
  await addDoc(collection(db, "calendars"), data);

export const getCalendar = async (id: string) =>
  await getDoc(doc(db, "calendars", id));

export const getCalendarsByOwner = async (owner_id: string) => {
  const q = query(collection(db, "calendars"), where("owner_id", "==", owner_id));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const updateCalendar = async (id: string, data: Partial<Calendar>) =>
  await updateDoc(doc(db, "calendars", id), data);

export const deleteCalendar = async (id: string) =>
  await deleteDoc(doc(db, "calendars", id));

// ─── MEMBERSHIPS ─────────────────────────────────────────

export const createMembership = async (data: Membership) =>
  await addDoc(collection(db, "memberships"), data);

export const getMembershipsByUser = async (user_id: string) => {
  const q = query(collection(db, "memberships"), where("user_id", "==", user_id));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getMembershipsByCalendar = async (cal_id: string) => {
  const q = query(collection(db, "memberships"), where("cal_id", "==", cal_id)); // updated
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const updateMembership = async (id: string, data: Partial<Membership>) =>
  await updateDoc(doc(db, "memberships", id), data);

export const deleteMembership = async (id: string) =>
  await deleteDoc(doc(db, "memberships", id));

// ─── EVENTS ──────────────────────────────────────────────

export const createEvent = async (data: Event) =>
  await addDoc(collection(db, "events"), data);

export const getEvent = async (id: string) =>
  await getDoc(doc(db, "events", id));

export const getEventsByCalendar = async (cal_id: string) => {
  const q = query(collection(db, "events"), where("cal_id", "==", cal_id)); // updated
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getEventsByUser = async (created_by: string) => {
  const q = query(collection(db, "events"), where("created_by", "==", created_by));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const updateEvent = async (id: string, data: Partial<Event>) =>
  await updateDoc(doc(db, "events", id), data);

export const deleteEvent = async (id: string) =>
  await deleteDoc(doc(db, "events", id));

// ─── RSVPS ───────────────────────────────────────────────

export const createRSVP = async (data: RSVP) =>
  await addDoc(collection(db, "rsvps"), data);

export const getRSVPsByEvent = async (event_id: string) => {
  const q = query(collection(db, "rsvps"), where("event_id", "==", event_id));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getRSVPsByUser = async (user_id: string) => {
  const q = query(collection(db, "rsvps"), where("user_id", "==", user_id));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const updateRSVP = async (id: string, data: Partial<RSVP>) =>
  await updateDoc(doc(db, "rsvps", id), data);

export const deleteRSVP = async (id: string) =>
  await deleteDoc(doc(db, "rsvps", id));

// ─── AVAILABILITIES ──────────────────────────────────────

export const createAvailability = async (data: Availability) =>
  await addDoc(collection(db, "availabilities"), data);

export const getAvailabilitiesByUser = async (user_id: string) => {
  const q = query(collection(db, "availabilities"), where("user_id", "==", user_id));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getAvailabilitiesByCalendar = async (cal_id: string) => {
  const q = query(collection(db, "availabilities"), where("cal_id", "==", cal_id)); // updated
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const updateAvailability = async (id: string, data: Partial<Availability>) =>
  await updateDoc(doc(db, "availabilities", id), data);

export const deleteAvailability = async (id: string) =>
  await deleteDoc(doc(db, "availabilities", id));