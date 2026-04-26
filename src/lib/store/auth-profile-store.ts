"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export interface AuthAddress {
  street: string;
  zipCode: string;
  city: string;
}

interface AuthProfileState {
  uid: string | null;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: AuthAddress;
  setProfile: (
    profile: Partial<
      Pick<
        AuthProfileState,
        "uid" | "firstName" | "lastName" | "email" | "phone" | "address"
      >
    >,
  ) => void;
  resetProfile: () => void;
}

const initialState = {
  uid: null,
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  address: { street: "", zipCode: "", city: "" },
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
