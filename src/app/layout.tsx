import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Manrope } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const bodyFont = Manrope({
  subsets: ["latin"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: "Nova",
  description: "Agent IA pour réduire votre facture d'électricité",
  applicationName: "Nova",
  appleWebApp: {
    capable: true,
    title: "Nova",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#ffffff",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="fr">
      <body
        className={`${bodyFont.variable} bg-white font-[var(--font-body)] text-[#0a1628] antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
