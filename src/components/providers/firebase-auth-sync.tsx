"use client";

import { useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { firebaseAuth } from "@/lib/firebase";
import { useAuthProfileStore } from "@/lib/store/auth-profile-store";
import { splitDisplayName } from "@/lib/auth/firebase-auth";

export function FirebaseAuthSync() {
  const setProfile = useAuthProfileStore((state) => state.setProfile);

  useEffect(() => {
    if (!firebaseAuth) {
      return;
    }

    return onAuthStateChanged(firebaseAuth, (user) => {
      if (!user) {
        setProfile({ uid: null });
        return;
      }

      const { firstName, lastName } = splitDisplayName(user.displayName);
      setProfile({
        uid: user.uid,
        email: user.email ?? "",
        phone: user.phoneNumber ?? "",
        firstName,
        lastName,
      });
    });
  }, [setProfile]);

  return null;
}
