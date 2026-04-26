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
  pendingPrm: string | null;
  selectedOfferId: string | null;
  setBillData: (billData: UserBillData | null) => void;
  setPreferences: (preferences: UserPreferences) => void;
  setComparison: (comparison: ComparisonResult | null) => void;
  setSwitchState: (switchState: SwitchSimulationState | null) => void;
  setPendingSource: (source: "enedis" | "ocr" | null) => void;
  setPendingFile: (file: File | null) => void;
  setPendingPrm: (prm: string | null) => void;
  setSelectedOfferId: (id: string | null) => void;
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
      pendingPrm: null,
      selectedOfferId: null,
      setBillData: (billData) => set({ billData }),
      setPreferences: (preferences) => set({ preferences }),
      setComparison: (comparison) => set({ comparison }),
      setSwitchState: (switchState) => set({ switchState }),
      setPendingSource: (pendingSource) => set({ pendingSource }),
      setPendingFile: (pendingFile) => set({ pendingFile }),
      setPendingPrm: (pendingPrm) => set({ pendingPrm }),
      setSelectedOfferId: (selectedOfferId) => set({ selectedOfferId }),
      resetJourney: () =>
        set({
          billData: null,
          preferences: DEFAULT_PREFERENCES,
          comparison: null,
          switchState: null,
          pendingSource: null,
          pendingFile: null,
          pendingPrm: null,
          selectedOfferId: null,
        }),
    }),
    {
      name: "nova-journey",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        billData: state.billData,
        preferences: state.preferences,
        comparison: state.comparison,
        switchState: state.switchState,
        pendingSource: state.pendingSource,
        pendingPrm: state.pendingPrm,
        selectedOfferId: state.selectedOfferId,
      }),
    },
  ),
);
