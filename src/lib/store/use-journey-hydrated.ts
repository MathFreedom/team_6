"use client";

import { useEffect, useState } from "react";
import { useJourneyStore } from "./journey-store";

export function useJourneyHydrated() {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const persistApi = useJourneyStore.persist;
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
