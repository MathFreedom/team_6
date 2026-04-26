"use client";

import type { ReactNode } from "react";
import { Toaster } from "sonner";
import { ServiceWorkerRegister } from "@/components/pwa/service-worker-register";
import { FirebaseAnalytics } from "@/components/providers/firebase-analytics";
import { FirebaseAuthSync } from "@/components/providers/firebase-auth-sync";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <>
      <FirebaseAnalytics />
      <FirebaseAuthSync />
      <ServiceWorkerRegister />
      {children}
      <Toaster richColors position="top-center" />
    </>
  );
}
