"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface AuthProfileState {
  uid: string | null;
  email: string;
  phone: string;
  address: string;
  setProfile: (profile: Partial<Pick<AuthProfileState, "uid" | "email" | "phone" | "address">>) => void;
  resetProfile: () => void;
}

const initialState = {
  uid: null,
  email: "",
  phone: "",
  address: "",
};

export const useAuthProfileStore = create<AuthProfileState>()(
  persist(
    (set) => ({
      ...initialState,
      setProfile: (profile) => set((state) => ({ ...state, ...profile })),
      resetProfile: () => set(initialState),
    }),
    {
      name: "nova-auth-profile",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
