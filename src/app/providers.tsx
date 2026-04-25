"use client";

import type { ReactNode } from "react";
import { Toaster } from "sonner";
import { ServiceWorkerRegister } from "@/components/pwa/service-worker-register";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <>
      <ServiceWorkerRegister />
      {children}
      <Toaster richColors position="top-center" />
    </>
  );
}
