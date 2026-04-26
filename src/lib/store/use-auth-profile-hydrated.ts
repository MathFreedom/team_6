"use client";

import { useEffect, useState } from "react";
import { useAuthProfileStore } from "./auth-profile-store";

export function useAuthProfileHydrated() {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const persistApi = useAuthProfileStore.persist;
    if (!persistApi) {
      setHydrated(true);
      return;
    }

    const unsubscribe = persistApi.onFinishHydration(() => setHydrated(true));
    setHydrated(persistApi.hasHydrated());
    return unsubscribe;
  }, []);

  return hydrated;
}
