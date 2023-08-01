"use client";
import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Scoreboard from "./components/Scoreboard";
import Providers from "./components/Theme";
import Themechanger from "./components/ThemeChanger";
import LeagueContext from "./context/LeagueContext";
import { useContext, useEffect } from "react";

import Footer from "./components/Footer";
import NavBar from "./components/Navbar";

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
        className={`${inter.className} bg-[#EDEDED] dark:bg-[#000000] from-1a1a1c to-AF1222 text-[#1a1a1c] dark:text-[#EDEDED]  mx-auto p-4 font-[${inter}] w-screen h-screen`}
      >
        <Providers>
          <div className="z-20  ">
            <div className=" ">
              <NavBar usernameSubmitted={true} leagueID="" />
            </div>
            <div className="flex flex-col ">
              <Themechanger />
              <Scoreboard />
              {children}
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
