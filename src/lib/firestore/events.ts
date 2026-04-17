import { push, ref, set } from "firebase/database";
import { db, rtdb } from "../firebase";
import { PCEvent, PhoneEvent } from "../../types";

export async function logPCEvent(sessionId: string, eventData: Omit<PCEvent, 'id'>): Promise<void> {
  // We can include a basic auto-generated ID directly with addDoc, or we can use doc(collection()) to generate one
  await addDoc(collection(db, "sessions", sessionId, "pcEvents"), eventData);
}

export async function logPhoneEvent(sessionId: string, eventData: Omit<PhoneEvent, 'id'>): Promise<void> {
  await addDoc(collection(db, "sessions", sessionId, "phoneEvents"), eventData);
}

// Helper to update the real-time bridge for phone pickup/events
export async function updateLastPhoneEvent(userId: string, sessionId: string, eventData: any): Promise<void> {
  const docRef = doc(db, 'activeSession', userId);
  await setDoc(docRef, { 
    sessionId, 
    lastPhoneEvent: eventData,
    updatedAt: new Date().toISOString()
  }, { merge: true });
}

export async function updateLastPCEvent(userId: string, sessionId: string, eventData: any): Promise<void> {
  const docRef = doc(db, 'activeSession', userId);
  await setDoc(docRef, { 
    sessionId, 
    lastPCEvent: eventData,
    updatedAt: new Date().toISOString()
  }, { merge: true });
}
// Realtime Database versions
export async function logPCEventRTDB(userId: string, sessionId: string, eventData: Omit<PCEvent, 'id'>): Promise<void> {
  const eventsRef = ref(rtdb, `users/${userId}/sessions/${sessionId}/pcEvents`);
  const newEventRef = push(eventsRef);
  await set(newEventRef, {
    ...eventData,
    id: newEventRef.key
  });
}
