"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { ComparisonResult, SwitchSimulationState, UserBillData, UserPreferences } from "@/types/energy";
import { DEFAULT_PREFERENCES } from "../constants";

interface JourneyState {
  billData: UserBillData | null;
  preferences: UserPreferences;
  comparison: ComparisonResult | null;
  switchState: SwitchSimulationState | null;
  pendingSource: "enedis" | "ocr" | null;
  pendingFile: File | null;
  setBillData: (billData: UserBillData | null) => void;
  setPreferences: (preferences: UserPreferences) => void;
  setComparison: (comparison: ComparisonResult | null) => void;
  setSwitchState: (switchState: SwitchSimulationState | null) => void;
  setPendingSource: (source: "enedis" | "ocr" | null) => void;
  setPendingFile: (file: File | null) => void;
  resetJourney: () => void;
}

export const useJourneyStore = create<JourneyState>()(
  persist(
    (set) => ({
      billData: null,
      preferences: DEFAULT_PREFERENCES,
      comparison: null,
      switchState: null,
      pendingSource: null,
      pendingFile: null,
      setBillData: (billData) => set({ billData }),
      setPreferences: (preferences) => set({ preferences }),
      setComparison: (comparison) => set({ comparison }),
      setSwitchState: (switchState) => set({ switchState }),
      setPendingSource: (pendingSource) => set({ pendingSource }),
      setPendingFile: (pendingFile) => set({ pendingFile }),
      resetJourney: () =>
        set({
          billData: null,
          preferences: DEFAULT_PREFERENCES,
          comparison: null,
          switchState: null,
          pendingSource: null,
          pendingFile: null,
        }),
    }),
    {
      name: "wattswitch-journey",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        billData: state.billData,
        preferences: state.preferences,
        comparison: state.comparison,
        switchState: state.switchState,
        pendingSource: state.pendingSource,
      }),
    },
  ),
);

