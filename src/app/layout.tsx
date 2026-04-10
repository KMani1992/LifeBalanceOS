
import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import AppShell from "@/components/layout/AppShell";
import AppProviders from "@/store/provider";
import "@/app/globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
});

export const metadata: Metadata = {
  title: "LifeBalanceOS",
  description:
    "Personal life management system for career, family, finance, peace, and daily operating rhythms.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

/**
 * Defines the shared application shell for all LifeBalanceOS routes.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={manrope.variable}>
      <body>
        <AppProviders>
          <AppShell>{children}</AppShell>
        </AppProviders>
      </body>
    </html>
  );
}
