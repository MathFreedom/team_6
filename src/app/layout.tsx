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
  title: "Nova - Mobile AI agent to cut your recurring charges",
  description: "A guided mobile experience to connect your energy, compare the market and launch the right switch.",
  applicationName: "Nova",
  appleWebApp: {
    capable: true,
    title: "Nova",
    statusBarStyle: "default",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${bodyFont.variable} ${displayFont.variable} page-frame bg-background font-[var(--font-body)] text-foreground antialiased`}
      >
        <Providers>
          <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-3 pb-4 sm:px-5">
            <AppHeader />
            <main className="flex-1 py-4 sm:py-6">{children}</main>
            <AppFooter />
          </div>
        </Providers>
      </body>
    </html>
  );
}
