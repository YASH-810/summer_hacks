import { ref, get, update, set } from "firebase/database";
import { db, rtdb } from "../firebase";
import { Session } from "../../types";

export async function createSession(sessionData: Session): Promise<void> {
  const docRef = doc(db, "sessions", sessionData.id);
  await setDoc(docRef, sessionData);
}

export async function getSession(sessionId: string): Promise<Session | null> {
  const docRef = doc(db, "sessions", sessionId);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return docSnap.data() as Session;
  }
  return null;
}

export async function updateSession(sessionId: string, data: Partial<Session>): Promise<void> {
  const docRef = doc(db, "sessions", sessionId);
  await updateDoc(docRef, data);
}

export async function getUserSessions(userId: string): Promise<Session[]> {
  const q = query(
    collection(db, "sessions"),
    where("userId", "==", userId),
    orderBy("startTime", "desc")
  );
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => doc.data() as Session);
}

// Active session real-time bridge update
export async function updateActiveSessionBridge(userId: string, data: any): Promise<void> {
  const docRef = doc(db, "activeSession", userId);
  await setDoc(docRef, {
    ...data,
    updatedAt: new Date().toISOString()
  }, { merge: true });
}
// Realtime Database Versions
export async function getSessionRTDB(userId: string, sessionId: string): Promise<Session | null> {
  const sessionRef = ref(rtdb, `users/${userId}/sessions/${sessionId}`);
  const snapshot = await get(sessionRef);
  if (snapshot.exists()) {
    return snapshot.val() as Session;
  }
  return null;
}

export async function updateSessionRTDB(userId: string, sessionId: string, data: Partial<Session>): Promise<void> {
  const sessionRef = ref(rtdb, `users/${userId}/sessions/${sessionId}`);
  await update(sessionRef, data);
}
