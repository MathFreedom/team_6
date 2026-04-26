"use client";

import type { ReactNode } from "react";
import { Toaster } from "sonner";
import { ServiceWorkerRegister } from "@/components/pwa/service-worker-register";
import { FirebaseAnalytics } from "@/components/providers/firebase-analytics";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <>
      <FirebaseAnalytics />
      <ServiceWorkerRegister />
      {children}
      <Toaster richColors position="top-center" />
    </>
  );
}
