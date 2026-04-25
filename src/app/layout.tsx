import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Manrope, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { AppHeader } from "@/components/layout/app-header";
import { AppFooter } from "@/components/layout/app-footer";

const bodyFont = Manrope({
  subsets: ["latin"],
  variable: "--font-body",
});

const displayFont = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: "WattSwitch",
  description: "L'agent qui optimise votre électricité en moins de 60 secondes.",
  applicationName: "WattSwitch",
  appleWebApp: {
    capable: true,
    title: "WattSwitch",
    statusBarStyle: "default",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className={`${bodyFont.variable} ${displayFont.variable} page-frame bg-background font-[var(--font-body)] text-foreground antialiased`}>
        <Providers>
          <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-4 sm:px-6">
            <AppHeader />
            <main className="flex-1 py-6 sm:py-8">{children}</main>
            <AppFooter />
          </div>
        </Providers>
      </body>
    </html>
  );
}
