import { ref, get, set } from "firebase/database";
import { rtdb } from "../firebase";
import { UserProfile } from "../../types";

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const userRef = ref(rtdb, `users/${uid}`);
  const snapshot = await get(userRef);

  if (snapshot.exists()) {
    return snapshot.val() as UserProfile;
  }
  return null;
}

export async function createUserProfile(uid: string, data: Partial<UserProfile>): Promise<void> {
  const userRef = ref(rtdb, `users/${uid}`);
  const defaultProfile: UserProfile = {
    uid,
    name: data.name || "Anonymous",
    workType: "other",
    perceivedPeakTime: "morning",
    perceivedAvgSession: 25,
    topDistractors: [],
    onboardingComplete: false,
    createdAt: new Date().toISOString(),
  };

  await set(userRef, {
    ...defaultProfile,
    ...data,
  });
}
