import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase";
import { UserProfile } from "../../types";

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const docRef = doc(db, "users", uid);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    return docSnap.data() as UserProfile;
  }
  return null;
}

export async function createUserProfile(uid: string, data: Partial<UserProfile>): Promise<void> {
  const docRef = doc(db, "users", uid);
  await setDoc(docRef, {
    uid,
    createdAt: new Date().toISOString(),
    onboardingComplete: false,
    ...data,
  }, { merge: true });
}
