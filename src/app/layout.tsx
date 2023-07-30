"use client";
import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Scoreboard from "./components/Scoreboard";
import Navbar from "./components/Navbar";
import Providers from "./components/Theme";
import Themechanger from "./components/ThemeChanger";
import LeagueContext from "./context/LeagueContext";
import { useContext, useEffect } from "react";

import Footer from "./components/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "RainCityLeague",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // useEffect(() => {
  //   console.log("Root Layout", leagueID);
  // }, [leagueID]);

  return (
    <html lang="en">
      <body
        className={`${inter.className} bg-[#EDEDED] dark:bg-[#000000] from-1a1a1c to-AF1222 text-[#1a1a1c] dark:text-[#EDEDED] container mx-auto p-4 font-[${inter}] `}
      >
        <Providers>
          <div className="z-20">
            <Themechanger />
            <Scoreboard />
            <Navbar leagueID="1232" usernameSubmitted={true} />
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
