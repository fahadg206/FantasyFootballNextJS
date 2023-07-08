import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Scoreboard from "./components/Scoreboard";
import Navbar from "./components/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "RainCityLeague",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${inter.className} bg-slate-900 text-slate-100 container mx-auto p-4`}
      >
        <Scoreboard />
        <Navbar />
        {children}
      </body>
    </html>
  );
}
