import type { Metadata } from "next";
import { Inter } from "next/font/google";
import MuiProvider from "@/components/MuiProvider";
import Navbar from "@/components/Navbar";
import { NotificationProvider } from "@/context/NotificationContext";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AFFORDMED Campus Notifications",
  description:
    "Real-time campus notification system for placements, results, and events — AFFORDMED.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <MuiProvider>
          <NotificationProvider>
            <Navbar />
            <main>{children}</main>
          </NotificationProvider>
        </MuiProvider>
      </body>
    </html>
  );
}
